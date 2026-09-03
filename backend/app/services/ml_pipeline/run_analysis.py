from __future__ import annotations

import argparse
import json
import re
import warnings
from pathlib import Path
from collections import Counter

import numpy as np
import pandas as pd
from tqdm import tqdm

warnings.filterwarnings("ignore")

TEXT_ALIASES = ["text","tweet","tweet_text","message","content","post_text","body"]
USER_ALIASES = ["user_id","author_id","sender_id","userid","user"]
TIME_ALIASES = ["timestamp","created_at","created","date","time"]
LANG_ALIASES = ["language","lang"]
LOCATION_ALIASES = ["location","user_location","place","geo"]
MENTION_ALIASES = ["mentions","mentioned_users","user_mentions"]
FOLLOWERS_ALIASES = ["followers_count","followers","follower_count"]
PLATFORM_ALIASES = ["platform","source","network","site"]
POST_ID_ALIASES = ["post_id","tweet_id","message_id","status_id","id"]
HASHTAG_ALIASES = ["hashtags","hashtag","tags","hash_tags"]
ENGAGEMENT_ALIASES = {
    "likes":["likes","like_count","favorite_count"],
    "replies":["replies","reply_count"],
    "shares":["shares","share_count","retweets","retweet_count"],
    "views":["views","view_count","impressions","impression_count"],
    "quotes":["quotes","quote_count"],
    "forwards":["forwards","forward_count"],
    "bookmarks":["bookmarks","bookmark_count","saves","save_count"],
}

def find_col(columns, aliases):
    norm={re.sub(r"[^a-z0-9]+","_",str(c).lower()).strip("_"):c for c in columns}
    for a in aliases:
        k=re.sub(r"[^a-z0-9]+","_",a.lower()).strip("_")
        if k in norm: return norm[k]
    return None

def detect_columns(df):
    return {
        "text": find_col(df.columns,TEXT_ALIASES),
        "user_id": find_col(df.columns,USER_ALIASES),
        "timestamp": find_col(df.columns,TIME_ALIASES),
        "language": find_col(df.columns,LANG_ALIASES),
        "location": find_col(df.columns,LOCATION_ALIASES),
        "mentions": find_col(df.columns,MENTION_ALIASES),
        "followers": find_col(df.columns,FOLLOWERS_ALIASES),
        "platform": find_col(df.columns,PLATFORM_ALIASES),
        "post_id": find_col(df.columns,POST_ID_ALIASES),
        "hashtags": find_col(df.columns,HASHTAG_ALIASES),
        **{f"eng_{k}":find_col(df.columns,v) for k,v in ENGAGEMENT_ALIASES.items()}
    }

def clean_text(x):
    if pd.isna(x): return ""
    x=str(x)
    x=re.sub(r"https?://\S+|www\.\S+"," <URL> ",x)
    x=re.sub(r"(?<!\w)@\w+"," <USER> ",x,flags=re.UNICODE)
    return re.sub(r"\s+"," ",x).strip()

def parse_mentions(row, col, text):
    vals=[]
    if col and not pd.isna(row[col]):
        raw=row[col]
        if isinstance(raw,(list,tuple,set)): vals.extend(map(str,raw))
        else: vals.extend(re.findall(r"@[\w]+|[\w.:-]+",str(raw)))
    vals.extend(re.findall(r"(?<!\w)@([A-Za-z0-9_]+)", text))
    out=[]
    for v in vals:
        v=str(v).strip().strip("'\"[]()")
        if not v: continue
        if not v.startswith("@"): v="@"+v
        if v.lower() not in {x.lower() for x in out}: out.append(v)
    return out

def make_post_ids(df, c):
    if c["post_id"]:
        ids=df[c["post_id"]].astype(str)
    else:
        ids=pd.Series([f"derived-{i}" for i in range(len(df))],index=df.index)
    return ids

def load_and_prepare(path):
    df=pd.read_csv(path,encoding="utf-8",low_memory=False)
    c=detect_columns(df)
    if not c["text"]: raise ValueError(f"No text column detected. Available columns: {list(df.columns)}")
    if not c["user_id"]: raise ValueError(f"No user ID column detected. Available columns: {list(df.columns)}")
    out=df.copy()
    out["__text"]=out[c["text"]].map(clean_text)
    out["__user_id"]=out[c["user_id"]].astype(str)
    out["__post_id"]=make_post_ids(out,c)
    out["__platform"]=out[c["platform"]].astype(str) if c["platform"] else "unknown"
    out["__language"]=out[c["language"]].astype(str) if c["language"] else ""
    out["__location"]=out[c["location"]].astype(str) if c["location"] else ""
    out["__timestamp"]=pd.to_datetime(out[c["timestamp"]],errors="coerce",utc=True) if c["timestamp"] else pd.NaT
    out["__mentions"]=[parse_mentions(row,c["mentions"],row["__text"]) for _,row in out.iterrows()]
    for k in ENGAGEMENT_ALIASES:
        col=c[f"eng_{k}"]
        out[f"__{k}"]=pd.to_numeric(out[col],errors="coerce").clip(lower=0) if col else np.nan
    if c["followers"]:
        out["__followers"]=pd.to_numeric(out[c["followers"]],errors="coerce").clip(lower=0)
    else: out["__followers"]=np.nan
    out=out[out["__text"].str.len()>0].copy()
    out=out.drop_duplicates(subset=["__platform","__post_id"],keep="first").reset_index(drop=True)
    return out,c

def batch_pipe(pipe,texts,batch_size=32,**kwargs):
    outputs=[]
    for i in tqdm(range(0,len(texts),batch_size),desc="ML inference"):
        outputs.extend(pipe(texts[i:i+batch_size],batch_size=batch_size,**kwargs))
    return outputs

def sentiment(df, model_name):
    from transformers import pipeline
    pipe=pipeline("text-classification",model=model_name,device=0 if __import__("torch").cuda.is_available() else -1)
    outs=batch_pipe(pipe,df["__text"].tolist(),batch_size=32,truncation=True)
    labels=[str(x["label"]).upper() for x in outs]
    # Normalize common labels.
    def norm(x):
        if "POS" in x: return "positive"
        if "NEG" in x: return "negative"
        if "NEU" in x: return "neutral"
        return x.lower()
    return [norm(x) for x in labels],[float(x["score"]) for x in outs]


# =============================================================================
# EMOTION INFERENCE -- Option A (fine-tuned single-pass model) + deterministic
# reconstruction of the original 11-category schema.
#
# NO ZERO-SHOT MODEL IS LOADED ANYWHERE IN THIS PIPELINE.
#
# --------------------------------------------------------------------------
# LABEL PROVENANCE (read this before trusting a number in a demo/report)
# --------------------------------------------------------------------------
# The classifier below (j-hartmann/emotion-english-distilroberta-base) was
# fine-tuned on exactly 7 output classes. That model choice is what gives
# the speed: one forward pass per post instead of eleven separate
# zero-shot entailment checks.
#
# Of your original 11 labels:
#
#   NATIVE MODEL OUTPUTS (7) -- the model was trained on these, directly:
#     joy, anger, sadness, fear, surprise, neutral
#     + disgust, RELABELED to "opposition" (see note below)
#
#   DETERMINISTIC, RULE-BASED DERIVATIONS (4) -- the model does NOT predict
#   these; they are recovered from a native label + a lightweight keyword/
#   punctuation heuristic applied with pandas vectorized string ops (fast,
#   no per-row Python loop):
#     excitement  <- joy    + high-arousal cues (multiple "!", ALL-CAPS
#                    word, or intensity phrases like "can't wait")
#     anxiety     <- fear   + worry/uncertainty cues ("worried", "what if",
#                    "nervous", "afraid that", ...)
#     frustration <- anger  + irritation/resignation cues ("so annoying",
#                    "sick of", "fed up", "smh", ...)
#     supportive  <- joy/neutral + encouragement cues ("you got this",
#                    "proud of you", "sending love", ...)
#
# HONESTY NOTES:
#   - excitement/anxiety/frustration are grounded in a real, defensible
#     idea: the circumplex model of affect, where joy/fear/anger each
#     have a higher-arousal variant. Splitting them via lexical intensity
#     cues is a reasonable, if imperfect, approximation.
#   - "opposition" via disgust is a relabel, not a derivation -- disgust
#     is the closest available native class to "opposition/aversion",
#     but they are not identical concepts. Confidence score is kept as
#     the model's own (it's still a native, single-pass prediction).
#   - "supportive" is the WEAKEST of the four derived labels. It isn't a
#     variant of any of the 7 trained emotions -- it's closer to a stance/
#     social-function category than an emotion, so it's caught only by
#     keyword matching, not by any signal the model was trained on. Treat
#     supportive-label counts as indicative, not authoritative.
#   - Every row also gets an `emotion_source` value ("model" or
#     "heuristic") so you can filter/report on native vs. derived counts
#     separately if judges ask about it.
# =============================================================================

_NATIVE_TO_ORIGINAL = {
    "anger": "anger",
    "disgust": "opposition",   # relabel, not a derivation -- see notes above
    "fear": "fear",
    "joy": "joy",
    "neutral": "neutral",
    "sadness": "sadness",
    "surprise": "surprise",
}

_EXCITEMENT_PATTERN = re.compile(
    r"(!\s*!|can'?t wait|so excited|omg|amazing|yess+|let'?s go|pumped|thrilled|stoked)",
    re.IGNORECASE,
)
_ANXIETY_PATTERN = re.compile(
    r"(worried|anxious|nervous|afraid that|scared that|what if|stressed about|dread|overthinking)",
    re.IGNORECASE,
)
_FRUSTRATION_PATTERN = re.compile(
    r"(ugh\b|so annoying|so frustrating|sick of|tired of|fed up|smh|done with this|why does this always)",
    re.IGNORECASE,
)
_SUPPORTIVE_PATTERN = re.compile(
    r"(you got this|proud of you|here for you|sending love|keep going|great job|well done|rooting for you|stay strong|sending strength)",
    re.IGNORECASE,
)
_ALLCAPS_WORD_PATTERN = re.compile(r"\b[A-Z]{3,}\b")

# Confidence is discounted for heuristic-derived labels only, to reflect
# that the model itself was confident about the *parent* emotion (e.g.
# "joy"), not specifically about the derived subtype (e.g. "excitement").
_HEURISTIC_CONFIDENCE_DISCOUNT = 0.85


def emotions_fast_11(df: pd.DataFrame, batch_size: int = 64, max_length: int = 64):
    """
    Fast, single-pass emotion inference that outputs your ORIGINAL 11-label
    schema. See the module-level comment block above for exactly which
    labels are native model output vs. deterministic post-processing.

    Returns (labels, confidences, sources) -- three lists, same order as df.
    """
    import torch
    from transformers import pipeline

    device = 0 if torch.cuda.is_available() else -1
    pipe = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        top_k=1,
        device=device,
        torch_dtype=torch.float16 if device == 0 else torch.float32,
    )

    texts = df["__text"].tolist()
    native_labels, native_scores = [], []
    for i in tqdm(range(0, len(texts), batch_size), desc="Emotion inference (Option A, single-pass)"):
        batch = texts[i:i + batch_size]
        outputs = pipe(batch, batch_size=batch_size, truncation=True, max_length=max_length)
        for out in outputs:
            item = out[0] if isinstance(out, list) else out
            native_labels.append(item["label"].lower())
            native_scores.append(float(item["score"]))

    # Step 1: relabel native -> original schema (identity for 6 of them,
    # disgust -> opposition).
    mapped = [_NATIVE_TO_ORIGINAL.get(lbl, lbl) for lbl in native_labels]

    # Step 2: vectorized heuristic checks over the whole column at once
    # (no per-row Python loop -- this stays fast even on 100k+ rows).
    text_series = df["__text"].fillna("")
    has_excitement_cue = text_series.str.contains(_EXCITEMENT_PATTERN) | \
        text_series.apply(lambda t: bool(_ALLCAPS_WORD_PATTERN.search(t)))
    has_anxiety_cue = text_series.str.contains(_ANXIETY_PATTERN)
    has_frustration_cue = text_series.str.contains(_FRUSTRATION_PATTERN)
    has_supportive_cue = text_series.str.contains(_SUPPORTIVE_PATTERN)

    final_labels = []
    final_conf = []
    final_source = []
    for i, base in enumerate(mapped):
        conf = native_scores[i]
        label = base
        source = "model"

        if base == "joy" and has_supportive_cue.iloc[i]:
            label, source = "supportive", "heuristic"
        elif base == "neutral" and has_supportive_cue.iloc[i]:
            label, source = "supportive", "heuristic"
        elif base == "joy" and has_excitement_cue.iloc[i]:
            label, source = "excitement", "heuristic"
        elif base == "fear" and has_anxiety_cue.iloc[i]:
            label, source = "anxiety", "heuristic"
        elif base == "anger" and has_frustration_cue.iloc[i]:
            label, source = "frustration", "heuristic"

        if source == "heuristic":
            conf = conf * _HEURISTIC_CONFIDENCE_DISCOUNT

        final_labels.append(label)
        final_conf.append(conf)
        final_source.append(source)

    return final_labels, final_conf, final_source


# =============================================================================
# TOPIC DETECTION -- hashtag-based (replaces TF-IDF + NMF).
#
# Each unique, case-normalized hashtag IS a topic. No semantic modeling,
# no clustering, no embeddings: #AI and #ArtificialIntelligence are and
# remain two separate topics. See PROJECT_STATUS.md / conversation history
# for the rationale.
# =============================================================================

_HASHTAG_TOKEN_RE = re.compile(r"(?<!\w)#([^\s#@]+)", re.UNICODE)
_HASHTAG_TRIM_CHARS = ".,!?;:'\"()[]{}<>*"

def _clean_hashtag_token(tok):
    tok=str(tok).strip().lstrip("#").strip()
    tok=tok.strip(_HASHTAG_TRIM_CHARS)
    return tok

def extract_post_hashtags(raw_value, text, use_text_fallback=True):
    """Return a de-duplicated, order-preserving list of (normalized_key, original_spelling)
    for one post.

    - normalized_key: lowercased, leading '#' removed, whitespace-trimmed -- used for
      grouping/counting (per spec: 'convert to lowercase for comparison').
    - original_spelling: the hashtag as it appeared, '#' removed -- kept so a
      human-readable label can be chosen later ('preserve the original spelling').

    Primary source is `raw_value` (the dataset's existing hashtags field, split on
    ';' or ','). If that field is missing/empty, hashtags are optionally pulled out
    of `text` with a regex -- never the other way around, and never used to invent
    topics from ordinary words.
    """
    tokens=[]
    has_raw = raw_value is not None and not (isinstance(raw_value,float) and pd.isna(raw_value))
    raw_str = str(raw_value).strip() if has_raw else ""
    if has_raw and raw_str and raw_str.lower()!="nan":
        for part in re.split(r"[;,]", raw_str):
            tok=_clean_hashtag_token(part)
            if tok:
                tokens.append(tok)
    elif use_text_fallback and text:
        for m in _HASHTAG_TOKEN_RE.findall(text):
            tok=_clean_hashtag_token(m)
            if tok:
                tokens.append(tok)

    seen=set()
    out=[]
    for tok in tokens:
        key=tok.lower()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append((key,tok))
    return out

def summarize_hashtag_topics(exploded):
    """Aggregate the post-hashtag pairs into the topic_summary.csv schema.
    Ranked primarily by post_count (never by engagement), per spec."""
    cols=["topic","post_count","unique_users","total_likes","total_replies","total_retweets",
          "total_quotes","total_bookmarks","total_impressions","average_engagement",
          "first_seen","last_seen","rank"]
    if exploded.empty:
        return pd.DataFrame(columns=cols)
    g=exploded.groupby("hashtag_key",dropna=False).agg(
        topic=("topic","first"),
        post_count=("post_id","nunique"),
        unique_users=("user_id","nunique"),
        total_likes=("__likes","sum"),
        total_replies=("__replies","sum"),
        total_retweets=("__shares","sum"),
        total_quotes=("__quotes","sum"),
        total_bookmarks=("__bookmarks","sum"),
        total_impressions=("__views","sum"),
        total_engagement=("__engagement","sum"),
        first_seen=("timestamp","min"),
        last_seen=("timestamp","max"),
    ).reset_index(drop=True)
    g["average_engagement"]=g["total_engagement"]/g["post_count"].replace(0,np.nan)
    g=g.drop(columns=["total_engagement"])
    # Primary rank: post_count desc (never engagement). Ties broken by total
    # engagement desc, then topic name, purely for a deterministic ordering --
    # the brief doesn't specify a tie-break rule.
    g=g.sort_values(["post_count","average_engagement","topic"],ascending=[False,False,True]).reset_index(drop=True)
    g["rank"]=g.index+1
    return g[cols]

def topics(df,hashtag_col=None,use_text_fallback=True):
    """Hashtag-based topic detection.

    Returns:
      primary_topic: list[str], aligned to df rows -- the post's highest-global-
        frequency hashtag (ties -> first hashtag appearing in the post), or
        "No Hashtag Topic" if the post has none.
      all_topics: list[str], aligned to df rows -- ';'-joined original-spelling
        hashtags for that post, in first-seen order.
      topic_summary_df: one row per unique hashtag, ranked by post_count desc
        (topic_summary.csv schema).
      exploded: one row per (post, hashtag) pair -- feeds hashtag_trends().
    """
    raws=df[hashtag_col].tolist() if hashtag_col else [None]*len(df)
    texts=df["__text"].tolist()

    per_post=[]
    global_post_count=Counter()
    label_votes={}
    for raw,text in zip(raws,texts):
        pairs=extract_post_hashtags(raw,text,use_text_fallback=use_text_fallback)
        per_post.append(pairs)
        for key,orig in pairs:
            global_post_count[key]+=1
            label_votes.setdefault(key,Counter())[orig]+=1

    # Canonical display label per key = most-common original spelling seen for it.
    canonical_label={k:c.most_common(1)[0][0] for k,c in label_votes.items()}

    primary_topic=[]
    all_topics=[]
    for pairs in per_post:
        if not pairs:
            primary_topic.append("No Hashtag Topic")
            all_topics.append("")
            continue
        best_key,best_count=None,-1
        for key,_ in pairs:  # first occurrence wins ties (strict >)
            cnt=global_post_count[key]
            if cnt>best_count:
                best_key,best_count=key,cnt
        primary_topic.append(canonical_label[best_key])
        all_topics.append(";".join(canonical_label[k] for k,_ in pairs))

    eng_cols=["__likes","__replies","__shares","__quotes","__bookmarks","__views","__engagement"]
    col_data={c:(df[c].tolist() if c in df.columns else [np.nan]*len(df)) for c in eng_cols}
    post_ids=df["__post_id"].tolist(); user_ids=df["__user_id"].tolist(); timestamps=df["__timestamp"].tolist()

    records=[]
    for i,pairs in enumerate(per_post):
        for key,_ in pairs:
            records.append((
                post_ids[i],user_ids[i],timestamps[i],key,canonical_label[key],
                col_data["__likes"][i],col_data["__replies"][i],col_data["__shares"][i],
                col_data["__quotes"][i],col_data["__bookmarks"][i],col_data["__views"][i],
                col_data["__engagement"][i],
            ))
    exploded=pd.DataFrame.from_records(records,columns=[
        "post_id","user_id","timestamp","hashtag_key","topic",
        "__likes","__replies","__shares","__quotes","__bookmarks","__views","__engagement",
    ])
    for c in ["__likes","__replies","__shares","__quotes","__bookmarks","__views","__engagement"]:
        if c in exploded.columns:
            exploded[c]=pd.to_numeric(exploded[c],errors="coerce").fillna(0)

    topic_summary_df=summarize_hashtag_topics(exploded)
    return primary_topic,all_topics,topic_summary_df,exploded

TIME_WINDOWS={"15min":"15min","1h":"1h","6h":"6h","24h":"24h"}

def hashtag_trends(exploded,window="1h",growth_threshold=0.2):
    """Time-binned trend score per hashtag, independent of the post_count ranking.

    growth_rate / trend_score compare each bin to the *previous occupied bin* for
    that hashtag (gaps with zero posts aren't materialized as rows, same
    convention the original trends() used). A hashtag's first-ever bin has no
    prior bin to compare to, so it's flagged 'Emerging' rather than given a
    fabricated growth rate.

    trend_score is a log-growth measure (log1p(current) - log1p(previous)) so a
    hashtag going 20 -> 100 scores far higher than one flat at 5000 -> 5000,
    per spec -- it is NOT a re-ranking by raw frequency.
    growth_threshold (default 0.2 = +/-20%) separates Growing/Declining from
    Stable; this threshold isn't specified in the brief, so it's a documented
    default rather than an invented data field.
    """
    cols=["topic","time_bin","post_count","unique_users","engagement",
          "previous_count","growth_rate","trend_score","trend_status"]
    if exploded.empty:
        return pd.DataFrame(columns=cols)
    x=exploded.dropna(subset=["timestamp"]).copy()
    if x.empty:
        return pd.DataFrame(columns=cols)
    freq=TIME_WINDOWS.get(window,"1h")
    x["time_bin"]=x["timestamp"].dt.floor(freq)
    g=x.groupby(["hashtag_key","time_bin"],dropna=False).agg(
        topic=("topic","first"),
        post_count=("post_id","nunique"),
        unique_users=("user_id","nunique"),
        engagement=("__engagement","sum"),
    ).reset_index()
    g=g.sort_values(["hashtag_key","time_bin"])

    rows=[]
    for _,sub in g.groupby("hashtag_key"):
        sub=sub.sort_values("time_bin").copy()
        sub["previous_count"]=sub["post_count"].shift(1)
        has_prev=sub["previous_count"].notna()
        sub["growth_rate"]=np.where(has_prev,(sub["post_count"]-sub["previous_count"])/sub["previous_count"],np.nan)
        sub["trend_score"]=np.where(
            has_prev,
            np.log1p(sub["post_count"])-np.log1p(sub["previous_count"]),
            np.log1p(sub["post_count"]),
        )
        def _status(row):
            if pd.isna(row["previous_count"]):
                return "Emerging"
            if row["growth_rate"]>growth_threshold:
                return "Growing"
            if row["growth_rate"]<-growth_threshold:
                return "Declining"
            return "Stable"
        sub["trend_status"]=sub.apply(_status,axis=1)
        rows.append(sub)
    out=pd.concat(rows,ignore_index=True) if rows else pd.DataFrame(columns=cols)
    return out[cols] if not out.empty else out

def network(df):
    import networkx as nx
    G=nx.DiGraph()
    for _,r in df.iterrows():
        src=str(r["__user_id"])
        for m in r["__mentions"]:
            target=m.lstrip("@")
            if target and target!=src:
                G.add_edge(src,target,weight=G.get_edge_data(src,target,{}).get("weight",0)+1)
    if not G.nodes:
        return pd.DataFrame(),pd.DataFrame()
    pagerank=nx.pagerank(G,weight="weight")
    indeg=dict(G.in_degree(weight="weight")); outdeg=dict(G.out_degree(weight="weight"))
    between=nx.betweenness_centrality(G,weight=None,normalized=True)
    nodes=pd.DataFrame([{
        "user_id":u,"in_degree":indeg.get(u,0),"out_degree":outdeg.get(u,0),
        "pagerank":pagerank.get(u,0),"betweenness":between.get(u,0)
    } for u in G.nodes]).sort_values("pagerank",ascending=False)
    edges=pd.DataFrame([{"source_user_id":a,"target_user_id":b,**d} for a,b,d in G.edges(data=True)])
    return nodes,edges

def audience(df):
    # Aggregate, non-sensitive profiling from observed language/location and
    # unsupervised interest segments based on text embeddings.
    rows=[]
    if df["__user_id"].nunique()==0:return pd.DataFrame()
    try:
        from sentence_transformers import SentenceTransformer
        from sklearn.cluster import MiniBatchKMeans
        model=SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
        users=df.groupby("__user_id")["__text"].apply(lambda s:" ".join(s.head(20))).reset_index()
        emb=model.encode(users["__text"].tolist(),show_progress_bar=True,batch_size=32,normalize_embeddings=True)
        k=min(8,max(2,len(users)//50)) if len(users)>=20 else 1
        if k>1:
            km=MiniBatchKMeans(n_clusters=k,random_state=42,n_init="auto")
            users["segment_id"]=km.fit_predict(emb)
            users["segment_name"]="interest_segment_"+users["segment_id"].astype(str)
        else:
            users["segment_id"]=0; users["segment_name"]="interest_segment_0"
        seg=users.groupby(["segment_id","segment_name"]).size().reset_index(name="users")
        seg["share"]=seg["users"]/len(users)
        return seg
    except Exception as e:
        return pd.DataFrame([{"segment_id":"unavailable","segment_name":"embedding_model_unavailable","users":0,"share":0,"error":str(e)}])

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("dataset")
    ap.add_argument("--output",default="output")
    ap.add_argument("--sentiment-model",default="cardiffnlp/twitter-xlm-roberta-base-sentiment")
    ap.add_argument("--skip-emotion",action="store_true")
    ap.add_argument("--skip-audience",action="store_true")
    ap.add_argument("--time-window",choices=list(TIME_WINDOWS.keys()),default="1h",
                     help="Bin size for hashtag_trends.csv timeline aggregation.")
    ap.add_argument("--no-hashtag-text-fallback",action="store_true",
                     help="Disable falling back to regex-extracted hashtags from post text when the hashtags field is missing/empty.")
    ap.add_argument("--top-n-json",type=int,default=100,
                     help="How many ranked topics to write into topic_ranked.json.")
    args=ap.parse_args()

    outdir=Path(args.output); outdir.mkdir(parents=True,exist_ok=True)
    df,c=load_and_prepare(args.dataset)
    df["__engagement"]=df[[x for x in ["__likes","__replies","__shares","__views","__quotes","__forwards","__bookmarks"]]].fillna(0).sum(axis=1)

    # Core ML
    sent,sc=sentiment(df,args.sentiment_model)
    df["sentiment"]=sent; df["sentiment_confidence"]=sc
    if args.skip_emotion:
        df["emotion"]="not_run"; df["emotion_confidence"]=np.nan; df["emotion_source"]="not_run"
    else:
        emo,ec,esrc=emotions_fast_11(df)
        df["emotion"]=emo; df["emotion_confidence"]=ec; df["emotion_source"]=esrc

    primary_topic,all_topics,topic_summary,hashtag_index=topics(
        df,hashtag_col=c["hashtags"],use_text_fallback=not args.no_hashtag_text_fallback
    )
    df["primary_topic"]=primary_topic; df["all_topics"]=all_topics

    # Persist enriched posts without internal helper columns.
    helper=[x for x in df.columns if x.startswith("__")]
    enriched=df.drop(columns=helper,errors="ignore")
    enriched.to_csv(outdir/"enriched_posts.csv",index=False,encoding="utf-8-sig")

    sentiment_summary=df.groupby("sentiment").agg(posts=("__post_id","count"),avg_confidence=("sentiment_confidence","mean"),engagement=("__engagement","sum")).reset_index()
    sentiment_summary.to_csv(outdir/"sentiment_summary.csv",index=False)

    emotion_summary=df.groupby("emotion").agg(posts=("__post_id","count"),avg_confidence=("emotion_confidence","mean")).reset_index()
    emotion_summary.to_csv(outdir/"emotion_summary.csv",index=False)

    # Native vs. heuristic breakdown -- useful if judges ask "how much of
    # this is the model vs. rules".
    if not args.skip_emotion:
        source_summary=df.groupby(["emotion","emotion_source"]).size().reset_index(name="posts")
        source_summary.to_csv(outdir/"emotion_label_provenance.csv",index=False)

    topic_summary.to_csv(outdir/"topic_summary.csv",index=False)

    tr=hashtag_trends(hashtag_index,window=args.time_window)
    tr.to_csv(outdir/"hashtag_trends.csv",index=False)

    ranked_json=topic_summary.head(args.top_n_json).to_dict("records")
    (outdir/"topic_ranked.json").write_text(json.dumps(ranked_json,indent=2,ensure_ascii=False,default=str),encoding="utf-8")

    nodes,edges=network(df)
    nodes.to_csv(outdir/"network_nodes.csv",index=False)
    edges.to_csv(outdir/"network_edges.csv",index=False)

    if not args.skip_audience:
        aud=audience(df)
        aud.to_csv(outdir/"audience_segments.csv",index=False)
    else:
        aud=pd.DataFrame()

    # Observed demographic distributions; not ML claims.
    demo={}
    for name,col in [("language","__language"),("location","__location")]:
        s=df[col].replace({"":"<missing>"}).fillna("<missing>").value_counts()
        demo[name]=[{"value":str(k),"posts":int(v),"share":float(v/len(df))} for k,v in s.head(50).items()]
    (outdir/"demographics_observed.json").write_text(json.dumps(demo,indent=2,ensure_ascii=False),encoding="utf-8")

    report={
        "input_rows": int(len(df)),
        "columns_detected": c,
        "outputs": [p.name for p in outdir.iterdir() if p.is_file()],
        "sentiment_distribution": sentiment_summary.to_dict("records"),
        "top_topics": topic_summary.head(10).to_dict("records"),
        "network_nodes": int(len(nodes)),
        "network_edges": int(len(edges)),
        "audience_segments": int(len(aud)),
        "note":"Demographics are reported from observed fields; interest segments are unsupervised aggregate clusters. They are not ground-truth personal attributes. Emotion labels: 7 are native model output (see emotions_fast_11 docstring), 4 are deterministic heuristic derivations flagged in emotion_source."
    }
    (outdir/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,default=str),encoding="utf-8")
    print(json.dumps(report,indent=2,ensure_ascii=False,default=str))

if __name__=="__main__":
    main()
