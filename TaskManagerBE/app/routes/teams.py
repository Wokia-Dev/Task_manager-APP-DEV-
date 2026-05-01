"""
Team Routes
GET  /api/teams              — List current user's teams
POST /api/teams              — Create a new team
POST /api/teams/join         — Join a team via invite code
GET  /api/teams/:id/members  — List members of a team
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.team import Team, TeamMember
from app.schemas.team_schema import (
    TeamCreateSchema,
    TeamJoinSchema,
    TeamMemberSchema,
    TeamSchema,
)

teams_bp = Blueprint('teams', __name__)

team_schema = TeamSchema()
teams_schema = TeamSchema(many=True)
member_schema = TeamMemberSchema(many=True)
create_schema = TeamCreateSchema()
join_schema = TeamJoinSchema()


@teams_bp.route('', methods=['GET'])
@jwt_required()
def list_teams():
    """List all teams the current user belongs to."""
    user_id = int(get_jwt_identity())
    memberships = TeamMember.query.filter_by(user_id=user_id).all()
    team_ids = [m.team_id for m in memberships]
    teams = Team.query.filter(Team.id.in_(team_ids)).all() if team_ids else []
    return jsonify({'teams': teams_schema.dump(teams)}), 200


@teams_bp.route('', methods=['POST'])
@jwt_required()
def create_team():
    """Create a new team. The creator becomes the owner."""
    user_id = int(get_jwt_identity())

    try:
        data = create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400

    # Generate a unique invite code
    invite_code = Team.generate_invite_code()
    while Team.query.filter_by(invite_code=invite_code).first():
        invite_code = Team.generate_invite_code()

    team = Team(
        name=data['name'],
        invite_code=invite_code,
        created_by=user_id,
    )
    db.session.add(team)
    db.session.flush()  # get team.id

    # Add creator as owner
    membership = TeamMember(
        team_id=team.id,
        user_id=user_id,
        role='owner',
    )
    db.session.add(membership)
    db.session.commit()

    return jsonify({
        'message': 'Team created successfully',
        'team': team_schema.dump(team),
    }), 201


@teams_bp.route('/join', methods=['POST'])
@jwt_required()
def join_team():
    """Join a team using an invite code."""
    user_id = int(get_jwt_identity())

    try:
        data = join_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400

    team = Team.query.filter_by(invite_code=data['invite_code'].upper()).first()
    if not team:
        return jsonify({'error': 'Invalid invite code'}), 404

    # Check if already a member
    existing = TeamMember.query.filter_by(team_id=team.id, user_id=user_id).first()
    if existing:
        return jsonify({'error': 'You are already a member of this team'}), 409

    membership = TeamMember(
        team_id=team.id,
        user_id=user_id,
        role='member',
    )
    db.session.add(membership)
    db.session.commit()

    return jsonify({
        'message': f'Successfully joined team "{team.name}"',
        'team': team_schema.dump(team),
    }), 200


@teams_bp.route('/<int:team_id>/members', methods=['GET'])
@jwt_required()
def list_members(team_id: int):
    """List all members of a team."""
    user_id = int(get_jwt_identity())

    # Verify the user is a member of this team
    membership = TeamMember.query.filter_by(team_id=team_id, user_id=user_id).first()
    if not membership:
        return jsonify({'error': 'You are not a member of this team'}), 403

    members = TeamMember.query.filter_by(team_id=team_id).all()
    return jsonify({'members': member_schema.dump(members)}), 200
