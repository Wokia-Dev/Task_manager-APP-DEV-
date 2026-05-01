"""
User Model
"""
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    avatar_color = db.Column(db.String(7), default='#6C63FF')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    team_memberships = db.relationship('TeamMember', back_populates='user', lazy='dynamic')
    created_tasks = db.relationship('Task', foreign_keys='Task.created_by', back_populates='creator', lazy='dynamic')
    assigned_tasks = db.relationship('Task', foreign_keys='Task.assigned_to', back_populates='assignee', lazy='dynamic')

    def set_password(self, password: str) -> None:
        """Hash and set the user password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Check the password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    def get_initials(self) -> str:
        """Return user initials (up to 2 chars)."""
        parts = self.full_name.strip().split()
        if len(parts) >= 2:
            return (parts[0][0] + parts[-1][0]).upper()
        return self.full_name[:2].upper()

    def __repr__(self) -> str:
        return f'<User {self.username}>'
