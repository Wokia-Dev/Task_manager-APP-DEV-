"""
TaskFlow App Factory
"""
import os

from flask import Flask
from flask_cors import CORS

from app.config import config_by_name
from app.extensions import db, jwt, ma


def create_app(config_name: str | None = None) -> Flask:
    """Create and configure the Flask application."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)

    # CORS — allow Expo dev server and web builds
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:8081", "http://localhost:8082", "http://localhost:19006",
                        "http://localhost:3000", "http://localhost:5173",
                        "http://127.0.0.1:8081", "http://127.0.0.1:8082", "http://127.0.0.1:19006",
                        "exp://*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    })

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.dashboard import dashboard_bp
    from app.routes.tasks import tasks_bp
    from app.routes.teams import teams_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(teams_bp, url_prefix='/api/teams')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')

    # Health check
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'TaskFlow API is running'}

    # Create tables (dev convenience — production should use migrations)
    with app.app_context():
        from app.models import task, team, user  # noqa: F401
        db.create_all()

    return app
