from pydantic import BaseModel
from typing import List


class EngagementDynamics(BaseModel):
    discussion_ratio: float
    virality_velocity_per_hour: float
    backlash_alert: bool


class StanceBreakdown(BaseModel):
    supportive_pct: float
    opposing_pct: float
    neutral_pct: float


class EmotionSpectrum(BaseModel):
    optimism: float
    sarcasm: float
    anxiety: float
    anger: float


class SentimentAndStance(BaseModel):
    consensus_index: float
    controversy_score: float
    stance_breakdown: StanceBreakdown
    emotion_spectrum: EmotionSpectrum


class Author(BaseModel):
    username: str
    inferred_domain: str
    location: str
    kol_pagerank: float


class NetworkEdge(BaseModel):
    source: str
    target: str
    stance: str


class TwitterAnalysis(BaseModel):
    thread_id: str
    category: str
    topic_cluster: str
    author: Author
    engagement_dynamics: EngagementDynamics
    sentiment_and_stance: SentimentAndStance
    network_edges: List[NetworkEdge]