"""
Flask extension instances.
Initialized here to avoid circular imports — imported by models, routes, etc.
"""
from flask_jwt_extended import JWTManager
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()
ma = Marshmallow()
