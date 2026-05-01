"""
Authentication Routes
POST /api/auth/register  — Register a new user
POST /api/auth/login     — Login and receive JWT tokens
GET  /api/auth/me        — Get current user profile
PUT  /api/auth/me        — Update current user profile
POST /api/auth/refresh   — Refresh access token
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from marshmallow import ValidationError

from app.extensions import db
from app.models.user import User
from app.schemas.auth_schema import UserLoginSchema, UserRegisterSchema, UserSchema

auth_bp = Blueprint('auth', __name__)

user_schema = UserSchema()
register_schema = UserRegisterSchema()
login_schema = UserLoginSchema()


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = register_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400

    # Check for existing user
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'A user with this email already exists'}), 409
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'This username is already taken'}), 409

    # Create user
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data['full_name'],
        avatar_color=data.get('avatar_color', '#6C63FF'),
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    # Generate tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'User registered successfully',
        'user': user_schema.dump(user),
        'access_token': access_token,
        'refresh_token': refresh_token,
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login and receive JWT tokens."""
    try:
        data = login_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'Login successful',
        'user': user_schema.dump(user),
        'access_token': access_token,
        'refresh_token': refresh_token,
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """Get the current user's profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({'user': user_schema.dump(user)}), 200


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update the current user's profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    data = request.get_json()
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'avatar_color' in data:
        user.avatar_color = data['avatar_color']
    if 'username' in data:
        existing = User.query.filter_by(username=data['username']).first()
        if existing and existing.id != user.id:
            return jsonify({'error': 'Username already taken'}), 409
        user.username = data['username']

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user_schema.dump(user)}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh the access token."""
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({'access_token': access_token}), 200
