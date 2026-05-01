"""
Team & TeamMember Models
"""
import secrets
import string
from datetime import datetime

from app.extensions import db


class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    invite_code = db.Column(db.String(20), unique=True, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    creator = db.relationship('User', foreign_keys=[created_by])
    members = db.relationship('TeamMember', back_populates='team', lazy='dynamic',
                              cascade='all, delete-orphan')

    @staticmethod
    def generate_invite_code(length: int = 8) -> str:
        """Generate a random uppercase alphanumeric invite code."""
        alphabet = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))

    def __repr__(self) -> str:
        return f'<Team {self.name}>'


class TeamMember(db.Model):
    __tablename__ = 'team_members'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.Enum('owner', 'member', name='member_role'), default='member')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('team_id', 'user_id', name='unique_membership'),
    )

    # Relationships
    team = db.relationship('Team', back_populates='members')
    user = db.relationship('User', back_populates='team_memberships')

    def __repr__(self) -> str:
        return f'<TeamMember team={self.team_id} user={self.user_id}>'
