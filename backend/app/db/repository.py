from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .models import XPost


class XPostRepository:
    """Small persistence boundary for X posts used by later ingestion work."""

    def __init__(self, session: Session):
        self.session = session

    def get_by_post_id(self, post_id: str) -> XPost | None:
        return self.session.scalar(select(XPost).where(XPost.post_id == post_id))

    def add(self, **values: object) -> XPost:
        post = XPost(**values)
        self.session.add(post)
        try:
            self.session.commit()
        except IntegrityError:
            self.session.rollback()
            raise
        self.session.refresh(post)
        return post

    def update(self, post_id: str, **values: object) -> XPost | None:
        post = self.get_by_post_id(post_id)
        if post is None:
            return None
        for key, value in values.items():
            setattr(post, key, value)
        post.updated_at = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(post)
        return post