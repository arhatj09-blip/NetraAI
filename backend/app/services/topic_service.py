from __future__ import annotations

from datetime import datetime, timezone
import logging
from pathlib import Path
import re
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import XPost

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_DIR = PROJECT_ROOT / "models"
DEFAULT_REFERENCE_MODEL_PATH = DEFAULT_MODEL_DIR / "reference_topic_model.joblib"
REFERENCE_MODEL_PATH = DEFAULT_REFERENCE_MODEL_PATH

_cached_reference_model: dict[str, Any] | None = None

_SOCIAL_NOISE_STOPWORDS = {
    "rt", "dm", "via", "http", "https", "com", "www", "pic", "twitter",
    "status", "post", "tweet", "just", "like", "today", "day", "time",
    "people", "good", "great", "new", "dont", "cant", "wont", "didnt",
    "got", "going", "know", "think", "really", "want", "see", "make",
}

_URL_RE = re.compile(r"https?://\S+|www\.\S+")
_MENTION_RE = re.compile(r"@\w+")
_HASHTAG_RE = re.compile(r"#\w+")
_PUNCT_RE = re.compile(r"[^\w\s]")


def clean_text_for_topics(text: str) -> str:
    """Preprocess text specifically for topic modeling by removing URLs, mentions, and hashtags."""
    if not text or not isinstance(text, str):
        return ""
    t = _URL_RE.sub(" ", text)
    t = _MENTION_RE.sub(" ", t)
    t = _HASHTAG_RE.sub(" ", t)
    t = _PUNCT_RE.sub(" ", t)
    return " ".join(t.lower().split())


def _label_topic(terms: np.ndarray, row: np.ndarray, top_n: int = 5) -> tuple[str, list[str], bool]:
    """Generate human-readable topic name and top keywords from NMF component weight vector."""
    top_indices = np.argsort(row)[::-1][:top_n]
    kw = [str(terms[i]) for i in top_indices if row[i] > 0]
    if not kw:
        return "General Topic", [], True
    name = f"Topic ({', '.join(kw[:3])})"
    return name, kw, False


class ReferenceTopicModelNotFoundError(RuntimeError):
    """Raised when an ingestion cycle attempts topic assignment without a pre-fitted reference model."""
    pass


def has_reference_model(model_path: Path | str | None = None) -> bool:
    """Check if the reference topic model artifact exists on disk."""
    target_path = Path(model_path) if model_path else REFERENCE_MODEL_PATH
    return target_path.exists()


def get_reference_model(model_path: Path | str | None = None) -> dict[str, Any]:
    """
    Retrieves the in-memory singleton reference topic model.
    Loads from disk if not yet cached in memory.
    Raises ReferenceTopicModelNotFoundError if the artifact does not exist on disk.
    """
    global _cached_reference_model
    target_path = Path(model_path) if model_path else REFERENCE_MODEL_PATH

    if _cached_reference_model is not None and not model_path:
        return _cached_reference_model

    if not target_path.exists():
        raise ReferenceTopicModelNotFoundError(
            f"Reference topic model artifact was not found at {target_path}. "
            f"The reference model must be explicitly fitted from the 15K corpus using "
            f"'fit_reference_model_from_x_posts(session)' before ingestion cycles can run. "
            f"Automatic small-batch bootstrapping is strictly prohibited."
        )

    logger.info("Loading reference topic model from %s...", target_path)
    loaded = joblib.load(target_path)
    if not model_path:
        _cached_reference_model = loaded
    return loaded


load_reference_model = get_reference_model


def set_reference_model(model_dict: dict[str, Any]) -> None:
    """Manually set or override the in-memory reference model (useful for unit tests)."""
    global _cached_reference_model
    _cached_reference_model = model_dict


def clear_reference_model_cache() -> None:
    """Clear the in-memory cached reference model."""
    global _cached_reference_model
    _cached_reference_model = None


def fit_reference_model(
    texts: list[str],
    n_topics: int = 10,
    source_dataset: str = "x_dataset_synthetic_15000.csv",
    save_path: Path | str | None = None,
) -> dict[str, Any]:
    """
    Fits TF-IDF and NMF once on the provided text corpus and persists the model artifact.
    """
    if len(texts) < max(20, n_topics):
        raise ValueError(
            f"Corpus too small ({len(texts)} texts) to build a stable reference topic model with {n_topics} topics."
        )

    logger.info("Cleaning %d texts for reference topic model fitting...", len(texts))
    cleaned_texts = [clean_text_for_topics(t) for t in texts]
    n_docs = len(cleaned_texts)

    min_df = 2 if n_docs < 5000 else max(3, int(n_docs * 0.0006))
    max_features = int(min(20000, max(3000, n_docs * 2.5)))
    topic_stopwords = list(ENGLISH_STOP_WORDS.union(_SOCIAL_NOISE_STOPWORDS))

    vectorizer = TfidfVectorizer(
        stop_words=topic_stopwords,
        ngram_range=(1, 2),
        min_df=min_df,
        max_df=0.9,
        sublinear_tf=True,
        max_features=max_features,
        token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z]+\b",
    )

    logger.info("Vectorizing reference corpus with TF-IDF...")
    X = vectorizer.fit_transform(cleaned_texts)
    if X.shape[1] < 2:
        raise ValueError("Vocabulary collapsed during vectorization; insufficient text signal.")

    k = min(n_topics, max(2, X.shape[1] - 1), max(2, n_docs))
    logger.info("Fitting NMF with %d components on matrix shape %s...", k, X.shape)
    nmf = NMF(n_components=k, random_state=42, init="nndsvda", max_iter=400)
    nmf.fit(X)

    H = nmf.components_
    terms = np.array(vectorizer.get_feature_names_out())
    topic_names: dict[int, str] = {}
    keyword_map: dict[int, list[str]] = {}

    for i, row in enumerate(H):
        name, kw, low_q = _label_topic(terms, row)
        topic_names[i] = f"{name} [component {i}]" if low_q else name
        keyword_map[i] = kw

    target_path = Path(save_path) if save_path else REFERENCE_MODEL_PATH
    target_path.parent.mkdir(parents=True, exist_ok=True)

    metadata: dict[str, Any] = {
        "model_version": "v1.0.0",
        "source_dataset": source_dataset,
        "source_row_count": len(texts),
        "fit_timestamp": datetime.now(timezone.utc).isoformat(),
        "n_topics": k,
        "topic_names": topic_names,
        "keyword_map": keyword_map,
        "vectorizer": vectorizer,
        "nmf": nmf,
    }

    joblib.dump(metadata, target_path)
    logger.info("Successfully persisted reference topic model to %s", target_path)

    global _cached_reference_model
    _cached_reference_model = metadata
    return metadata


def fit_reference_model_from_x_posts(
    session: Session,
    n_topics: int = 10,
    save_path: Path | str | None = None,
) -> dict[str, Any]:
    """
    Explicit operation to fit the reference topic model on all existing posts in x_posts.
    """
    logger.info("Querying all post texts from x_posts for reference topic model...")
    stmt = select(XPost.text).where(XPost.text.is_not(None)).order_by(XPost.id.asc())
    results = session.execute(stmt).scalars().all()

    texts = [str(t) for t in results if str(t).strip()]
    if not texts:
        raise ValueError("No text posts found in x_posts table to fit reference topic model.")

    return fit_reference_model(
        texts=texts,
        n_topics=n_topics,
        source_dataset="x_posts (MySQL database)",
        save_path=save_path,
    )


def assign_topics(
    texts: list[str],
    model_path: Path | str | None = None,
) -> list[dict[str, Any]]:
    """
    Inference operation: Assigns topics to a list of texts using the pre-fitted reference topic model.
    Uses vectorizer.transform() + nmf.transform() (NEVER refits).
    """
    if not texts:
        return []

    model_data = get_reference_model(model_path=model_path)
    vectorizer: TfidfVectorizer = model_data["vectorizer"]
    nmf: NMF = model_data["nmf"]
    topic_names: dict[int, str] = model_data["topic_names"]

    cleaned_texts = [clean_text_for_topics(t) for t in texts]
    X = vectorizer.transform(cleaned_texts)
    W = nmf.transform(X)

    results: list[dict[str, Any]] = []
    for row in W:
        row_sum = row.sum()
        if row_sum > 0:
            probs = row / row_sum
            best_idx = int(np.argmax(probs))
            best_prob = float(probs[best_idx])
            topic_label = topic_names.get(best_idx, f"Topic {best_idx}")
        else:
            best_prob = 0.0
            topic_label = "Unassigned / General"

        results.append({
            "topic": topic_label,
            "topic_probability": round(best_prob, 4),
        })

    return results
