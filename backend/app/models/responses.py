"""
Response Models for API Endpoints
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, List


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Health status (healthy/unhealthy)")
    message: str = Field(..., description="Status message")
    timestamp: datetime = Field(..., description="Current server timestamp")


class PipelineStatusResponse(BaseModel):
    """Pipeline status response"""
    status: str = Field(..., description="Pipeline status (operational/processing/error/completed)")
    message: str = Field(..., description="Status message")
    last_ingestion: datetime = Field(..., description="Timestamp of last data ingestion")
    next_refresh: datetime = Field(..., description="Timestamp of next scheduled refresh")
    records_processed: int = Field(..., description="Total records processed across pipeline")
    analytics_updated: datetime = Field(..., description="Timestamp of last analytics update")
    new_analysis_ready: bool = Field(default=False, description="Whether a new analysis batch is ready for dashboard consumption")
    current_cycle_id: Optional[str] = Field(default=None, description="Active or most recent ingestion cycle ID")
    last_completed_cycle: Optional[str] = Field(default=None, description="Last successfully completed cycle ID")
    new_records_processed: int = Field(default=0, description="Records processed in the last ingestion cycle")
    logical_window_index: int = Field(default=0, description="Current logical 15-minute window sequence index")
    demo_mode: bool = Field(default=True, description="Whether accelerated demo simulation mode is active")
    health_index: float = Field(default=100.0, description="Pipeline health index (0-100)")
    active_platforms: List[str] = Field(..., description="List of active platforms")
    platform_records: Dict[str, int] = Field(..., description="Record count per platform")


class PlatformResponse(BaseModel):
    """Platform information response"""
    id: str = Field(..., description="Platform identifier (x, reddit, telegram)")
    name: str = Field(..., description="Platform display name")
    description: str = Field(..., description="Platform description")
    icon: str = Field(..., description="Icon identifier")
    color: str = Field(..., description="Platform accent color (hex)")
    active: bool = Field(..., description="Whether platform is active")
    record_count: int = Field(..., description="Number of records for this platform")


class DatasetValidationResponse(BaseModel):
    """Validation summary for a processed dataset."""
    total_records: int
    valid_records: int
    invalid_records: int
    duplicate_records: int
    missing_values: Dict[str, int]
    available_columns: List[str]
    required_columns: List[str]
    missing_required_columns: List[str]
    timestamp_range: Dict[str, Dict[str, str]]
    source_file: str
    platform: str
    rejected_reasons: Dict[str, int] = Field(default_factory=dict)


class DatasetProcessingResponse(BaseModel):
    """Processed dataset payload returned by the API."""
    platform: str
    source_file: str
    total_records: int
    data: List[Dict[str, object]]
    validation: DatasetValidationResponse


class HashtagTrendItem(BaseModel):
    """Rising hashtag item for the dashboard trends panel"""
    tag: str = Field(..., description="Hashtag with # prefix")
    hashtag: str = Field(..., description="Hashtag name")
    growth: str = Field(..., description="Formatted growth percentage (e.g. +242%)")
    growth_rate: float = Field(..., description="Numeric growth rate")
    mentions: str = Field(..., description="Formatted total mentions count")
    post_count: int = Field(..., description="Total post count")
    unique_users: int = Field(..., description="Distinct user count")
    status: str = Field(..., description="Trend status (Rising/Spiking/Stable/Declining)")
    velocity: str = Field(..., description="Formatted velocity (e.g. +1,840/hr)")
    trend_velocity: float = Field(..., description="Numeric trend velocity")
    score: float = Field(..., description="Composite trend score")
    trend_score: float = Field(..., description="Full numeric trend score")


class HashtagTimeSeriesPoint(BaseModel):
    """Single time-bucket data point for a hashtag timeline"""
    time: str = Field(..., description="ISO formatted period timestamp")
    time_period: str = Field(..., description="ISO formatted period timestamp")
    post_count: int = Field(..., description="Post count in this period")
    growth_rate: float = Field(..., description="Growth rate compared to previous period")
    trend_velocity: float = Field(..., description="Velocity in this period")
    trend_score: float = Field(..., description="Trend score in this period")
    trend_status: str = Field(..., description="Status in this period")


class HashtagDetailResponse(BaseModel):
    """Full detail and time-series for a specific hashtag"""
    hashtag: str = Field(..., description="Hashtag with # prefix")
    tag: str = Field(..., description="Hashtag with # prefix")
    post_count: int = Field(..., description="Total post count across queried window")
    unique_users: int = Field(..., description="Peak or total unique users")
    growth_rate: float = Field(..., description="Average growth rate across queried window")
    trend_velocity: float = Field(..., description="Peak velocity across queried window")
    trend_score: float = Field(..., description="Peak trend score across queried window")
    trend_status: str = Field(..., description="Current/latest trend status")
    time_series: List[HashtagTimeSeriesPoint] = Field(default_factory=list, description="Chronological time-series points")

