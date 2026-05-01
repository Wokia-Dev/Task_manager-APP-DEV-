from app.routes.auth import auth_bp
from app.routes.tasks import tasks_bp
from app.routes.teams import teams_bp
from app.routes.dashboard import dashboard_bp

__all__ = ['auth_bp', 'tasks_bp', 'teams_bp', 'dashboard_bp']
