"""
Task Model
"""
from datetime import datetime

from app.extensions import db


class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(
        db.Enum('todo', 'in_progress', 'completed', name='task_status'),
        default='todo'
    )
    priority = db.Column(
        db.Enum('low', 'medium', 'high', 'urgent', name='task_priority'),
        default='medium'
    )
    due_date = db.Column(db.Date, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    team = db.relationship('Team', backref=db.backref('tasks', lazy='dynamic'))
    creator = db.relationship('User', foreign_keys=[created_by], back_populates='created_tasks')
    assignee = db.relationship('User', foreign_keys=[assigned_to], back_populates='assigned_tasks')

    @property
    def is_overdue(self) -> bool:
        """Check if the task is past its due date and not completed."""
        if self.due_date and self.status != 'completed':
            return datetime.utcnow().date() > self.due_date
        return False

    def mark_completed(self) -> None:
        """Mark the task as completed with timestamp."""
        self.status = 'completed'
        self.completed_at = datetime.utcnow()

    def __repr__(self) -> str:
        return f'<Task {self.title}>'
