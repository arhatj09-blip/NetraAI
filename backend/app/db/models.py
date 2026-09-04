from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class XPost(Base):
    __tablename__ = "x_posts"
    __table_args__ = (
        UniqueConstraint("post_id", name="uq_x_posts_post_id"),
        Index("ix_x_posts_timestamp", "timestamp"),
        Index("ix_x_posts_user_id", "user_id"),
        Index("ix_x_posts_sentiment", "sentiment"),
        Index("ix_x_posts_emotion", "emotion"),
        Index("ix_x_posts_topic", "topic"),
        Index("ix_x_posts_gender", "gender"),
        Index("ix_x_posts_age_group", "age_group"),
        Index("ix_x_posts_region", "region"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    post_id: Mapped[str] = mapped_column(String(255), nullable=False)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(255), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    hashtags: Mapped[list[str] | None] = mapped_column(JSON)
    mentions: Mapped[list[str] | None] = mapped_column(JSON)
    like_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reply_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    retweet_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    quote_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    bookmark_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    followers_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    following_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    verified: Mapped[bool | None] = mapped_column(Boolean)
    bio: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255))
    language: Mapped[str | None] = mapped_column(String(32))
    is_reply: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    in_reply_to_user_id: Mapped[str | None] = mapped_column(String(255))
    referenced_tweet_id: Mapped[str | None] = mapped_column(String(255))
    referenced_tweet_type: Mapped[str | None] = mapped_column(String(32))
    gender: Mapped[str | None] = mapped_column(String(64))
    age_group: Mapped[str | None] = mapped_column(String(64))
    region: Mapped[str | None] = mapped_column(String(128))
    demographic_source: Mapped[str | None] = mapped_column(String(64))
    dataset_source: Mapped[str | None] = mapped_column(String(255))
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    sentiment: Mapped[str | None] = mapped_column(String(32))
    sentiment_confidence: Mapped[float | None] = mapped_column(Float)
    emotion: Mapped[str | None] = mapped_column(String(64))
    emotion_confidence: Mapped[float | None] = mapped_column(Float)
    emotion_source: Mapped[str | None] = mapped_column(String(64))
    topic: Mapped[str | None] = mapped_column(String(255))
    topic_probability: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)


class XHashtagTrend(Base):
    __tablename__ = "x_hashtag_trends"
    __table_args__ = (UniqueConstraint("hashtag", "time_period", name="uq_x_hashtag_trend_period"), Index("ix_x_hashtag_trends_hashtag", "hashtag"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    hashtag: Mapped[str] = mapped_column(String(255), nullable=False)
    time_period: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    post_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    unique_users: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    previous_period_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    growth_rate: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    trend_velocity: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    trend_score: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    trend_status: Mapped[str] = mapped_column(String(32), nullable=False)


class XSentimentAnalytics(Base):
    __tablename__ = "x_sentiment_analytics"
    __table_args__ = (UniqueConstraint("time_period", name="uq_x_sentiment_period"), Index("ix_x_sentiment_time_period", "time_period"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    time_period: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    positive_posts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    negative_posts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    neutral_posts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    positive_percentage: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    negative_percentage: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    neutral_percentage: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    average_confidence: Mapped[float | None] = mapped_column(Float)


class XEmotionAnalytics(Base):
    __tablename__ = "x_emotion_analytics"
    __table_args__ = (
        UniqueConstraint("time_period", "emotion", name="uq_x_emotion_period"),
        Index("ix_x_emotion_time_period", "time_period"),
        Index("ix_x_emotion_emotion", "emotion"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    time_period: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    emotion: Mapped[str] = mapped_column(String(64), nullable=False)
    post_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    average_confidence: Mapped[float | None] = mapped_column(Float)


class XNetworkNode(Base):
    __tablename__ = "x_network_nodes"
    __table_args__ = (Index("ix_x_network_nodes_user_id", "user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    username: Mapped[str] = mapped_column(String(255), nullable=False)
    activity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    degree: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    followers_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    verified: Mapped[bool | None] = mapped_column(Boolean)
    pagerank: Mapped[float | None] = mapped_column(Float)
    betweenness: Mapped[float | None] = mapped_column(Float)
    layout_x: Mapped[float] = mapped_column(Float, nullable=False)
    layout_y: Mapped[float] = mapped_column(Float, nullable=False)
    layout_z: Mapped[float] = mapped_column(Float, nullable=False)


class XNetworkEdge(Base):
    __tablename__ = "x_network_edges"
    __table_args__ = (
        UniqueConstraint("source_user_id", "target_user_id", "interaction_type", name="uq_x_network_edges"),
        Index("ix_x_network_edges_source", "source_user_id"),
        Index("ix_x_network_edges_target", "target_user_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    target_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    interaction_type: Mapped[str] = mapped_column(String(32), nullable=False)
    weight: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    first_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_seen_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class XNetworkEvent(Base):
    __tablename__ = "x_network_events"
    __table_args__ = (Index("ix_x_network_events_timestamp", "timestamp"), Index("ix_x_network_events_source", "source_user_id"), Index("ix_x_network_events_target", "target_user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    post_id: Mapped[str] = mapped_column(String(255), ForeignKey("x_posts.post_id"), nullable=False)
    source_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    target_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    interaction_type: Mapped[str] = mapped_column(String(32), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ingestion_cycle_id: Mapped[str | None] = mapped_column(String(255), index=True)


class XPipelineRun(Base):
    __tablename__ = "x_pipeline_runs"
    __table_args__ = (Index("ix_x_pipeline_runs_scheduled", "scheduled_time"), Index("ix_x_pipeline_runs_status", "status"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ingestion_cycle_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    platform: Mapped[str] = mapped_column(String(32), nullable=False)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    scheduled_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    actual_start_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    actual_end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    records_available: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_ingested: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_processed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_failed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)