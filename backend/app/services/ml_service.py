from __future__ import annotations

import logging
from typing import Any
import re

import numpy as np
import pandas as pd
import torch
from transformers import pipeline

from app.services.ml_pipeline.run_analysis import (
    _ALLCAPS_WORD_PATTERN,
    _ANXIETY_PATTERN,
    _EXCITEMENT_PATTERN,
    _FRUSTRATION_PATTERN,
    _HEURISTIC_CONFIDENCE_DISCOUNT,
    _NATIVE_TO_ORIGINAL,
    _SUPPORTIVE_PATTERN,
    batch_pipe,
    clean_text,
)
from app.services.topic_service import assign_topics

logger = logging.getLogger(__name__)

SENTIMENT_MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
EMOTION_MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"

_sentiment_pipe: Any = None
_emotion_pipe: Any = None


def get_sentiment_pipeline() -> Any:
    """Lazy load and cache the transformer sentiment analysis pipeline."""
    global _sentiment_pipe
    if _sentiment_pipe is None:
        device = 0 if torch.cuda.is_available() else -1
        logger.info("Initializing Sentiment pipeline on device %s...", "GPU" if device == 0 else "CPU")
        _sentiment_pipe = pipeline(
            "text-classification",
            model=SENTIMENT_MODEL_NAME,
            device=device,
        )
    return _sentiment_pipe


def get_emotion_pipeline() -> Any:
    """Lazy load and cache the Option-A transformer emotion analysis pipeline."""
    global _emotion_pipe
    if _emotion_pipe is None:
        device = 0 if torch.cuda.is_available() else -1
        logger.info("Initializing Option-A Emotion pipeline on device %s...", "GPU" if device == 0 else "CPU")
        _emotion_pipe = pipeline(
            "text-classification",
            model=EMOTION_MODEL_NAME,
            top_k=1,
            device=device,
            dtype=torch.float16 if device == 0 else torch.float32,
        )
    return _emotion_pipe


def reset_model_pipelines() -> None:
    """Reset cached pipeline singletons (useful for test isolation)."""
    global _sentiment_pipe, _emotion_pipe
    _sentiment_pipe = None
    _emotion_pipe = None


def normalize_sentiment_label(raw_label: str) -> str:
    """Normalize CardiffNLP labels (e.g. 'LABEL_0', 'POS', 'POSITIVE', etc.) to standard taxonomy."""
    norm = raw_label.upper()
    if "POS" in norm or norm == "LABEL_2":
        return "positive"
    if "NEG" in norm or norm == "LABEL_0":
        return "negative"
    if "NEU" in norm or norm == "LABEL_1":
        return "neutral"
    return raw_label.lower()


def analyze_batch(
    posts: list[dict[str, Any]],
    batch_size: int = 64,
    sentiment_batch_size: int | None = None,
    emotion_batch_size: int | None = None,
) -> list[dict[str, Any]]:
    """
    Authoritative stable ML/NLP interface.
    Input: list of post dicts (containing at minimum 'post_id' and 'text').
    Output: list of post dicts with 'sentiment', 'sentiment_confidence', 'emotion',
            'emotion_confidence', 'emotion_source', 'topic', 'topic_probability' populated.
    Input order and all existing fields are strictly preserved.
    """
    if not posts:
        return []

    s_bs = sentiment_batch_size or batch_size
    e_bs = emotion_batch_size or batch_size

    n = len(posts)
    post_ids = [p["post_id"] for p in posts]
    raw_texts = [str(p.get("text", "") or "") for p in posts]
    cleaned_texts = [clean_text(t) for t in raw_texts]

    # 1. Sentiment Inference (Transformer: cardiffnlp/twitter-xlm-roberta-base-sentiment)
    sent_pipe = get_sentiment_pipeline()
    sent_outputs = batch_pipe(sent_pipe, cleaned_texts, batch_size=s_bs, truncation=True)
    sent_labels = [normalize_sentiment_label(str(x["label"])) for x in sent_outputs]
    sent_confs = [round(float(x["score"]), 4) for x in sent_outputs]

    # 2. Option-A Emotion Inference (j-hartmann/emotion-english-distilroberta-base + 11-label reconstruction)
    emo_pipe = get_emotion_pipeline()
    native_labels: list[str] = []
    native_scores: list[float] = []

    for i in range(0, n, e_bs):
        chunk = cleaned_texts[i : i + e_bs]
        outputs = emo_pipe(chunk, batch_size=e_bs, truncation=True, max_length=64)
        for out in outputs:
            item = out[0] if isinstance(out, list) else out
            native_labels.append(str(item["label"]).lower())
            native_scores.append(float(item["score"]))

    mapped_emotions = [_NATIVE_TO_ORIGINAL.get(lbl, lbl) for lbl in native_labels]

    # Vectorized heuristic cues across the batch
    text_series = pd.Series(cleaned_texts).fillna("")
    has_excitement = text_series.str.contains(_EXCITEMENT_PATTERN) | text_series.apply(
        lambda t: bool(_ALLCAPS_WORD_PATTERN.search(t))
    )
    has_anxiety = text_series.str.contains(_ANXIETY_PATTERN)
    has_frustration = text_series.str.contains(_FRUSTRATION_PATTERN)
    has_supportive = text_series.str.contains(_SUPPORTIVE_PATTERN)

    final_emotions: list[str] = []
    final_emo_confs: list[float] = []
    final_emo_sources: list[str] = []

    for idx, base in enumerate(mapped_emotions):
        conf = native_scores[idx]
        label = base
        source = "model"

        if (base in ("joy", "neutral")) and has_supportive.iloc[idx]:
            label, source = "supportive", "heuristic"
        elif base == "joy" and has_excitement.iloc[idx]:
            label, source = "excitement", "heuristic"
        elif base == "fear" and has_anxiety.iloc[idx]:
            label, source = "anxiety", "heuristic"
        elif base == "anger" and has_frustration.iloc[idx]:
            label, source = "frustration", "heuristic"

        if source == "heuristic":
            conf = conf * _HEURISTIC_CONFIDENCE_DISCOUNT

        final_emotions.append(label)
        final_emo_confs.append(round(float(conf), 4))
        final_emo_sources.append(source)

    # 3. Topic Assignment (Pre-fitted Reference NMF Model via topic_service)
    topic_results = assign_topics(raw_texts)

    # 4. Merge all enrichments into final result aligned by index
    results: list[dict[str, Any]] = []
    for idx, post in enumerate(posts):
        item = dict(post)
        item["post_id"] = post_ids[idx]
        item["sentiment"] = sent_labels[idx]
        item["sentiment_confidence"] = sent_confs[idx]
        item["emotion"] = final_emotions[idx]
        item["emotion_confidence"] = final_emo_confs[idx]
        item["emotion_source"] = final_emo_sources[idx]
        if topic_results and idx < len(topic_results):
            item["topic"] = topic_results[idx]["topic"]
            item["topic_probability"] = topic_results[idx]["topic_probability"]
        results.append(item)

    return results
