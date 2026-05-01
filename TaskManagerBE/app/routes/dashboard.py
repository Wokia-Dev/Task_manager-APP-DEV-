"""
Dashboard Routes
GET /api/dashboard/stats?team_id=X  — Get dashboard statistics for a team
"""
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.models.task import Task
from app.models.team import TeamMember

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    """Get dashboard statistics for a specific team."""
    user_id = int(get_jwt_identity())
    team_id = request.args.get('team_id', type=int)

    if not team_id:
        return jsonify({'error': 'team_id query parameter is required'}), 400

    membership = TeamMember.query.filter_by(team_id=team_id, user_id=user_id).first()
    if not membership:
        return jsonify({'error': 'You are not a member of this team'}), 403

    # Task counts by status
    total = Task.query.filter_by(team_id=team_id).count()
    todo_count = Task.query.filter_by(team_id=team_id, status='todo').count()
    in_progress_count = Task.query.filter_by(team_id=team_id, status='in_progress').count()
    completed_count = Task.query.filter_by(team_id=team_id, status='completed').count()

    # Overdue tasks (not completed + past due date)
    today = datetime.utcnow().date()
    overdue_count = Task.query.filter(
        Task.team_id == team_id,
        Task.status != 'completed',
        Task.due_date.isnot(None),
        Task.due_date < today,
    ).count()

    # Progress percentage
    progress = round((completed_count / total) * 100, 1) if total > 0 else 0

    # My tasks counts
    my_total = Task.query.filter_by(team_id=team_id, assigned_to=user_id).count()
    my_completed = Task.query.filter_by(
        team_id=team_id, assigned_to=user_id, status='completed'
    ).count()
    my_progress = round((my_completed / my_total) * 100, 1) if my_total > 0 else 0

    # Recent tasks (last 5)
    from app.schemas.task_schema import TaskSchema
    recent_tasks = Task.query.filter_by(team_id=team_id).order_by(
        Task.created_at.desc()
    ).limit(5).all()
    recent_schema = TaskSchema(many=True)

    # Team member count
    member_count = TeamMember.query.filter_by(team_id=team_id).count()

    return jsonify({
        'stats': {
            'total': total,
            'todo': todo_count,
            'in_progress': in_progress_count,
            'completed': completed_count,
            'overdue': overdue_count,
            'progress': progress,
            'my_tasks': {
                'total': my_total,
                'completed': my_completed,
                'progress': my_progress,
            },
            'member_count': member_count,
            'recent_tasks': recent_schema.dump(recent_tasks),
        }
    }), 200
