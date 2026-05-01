"""
Task Routes
GET    /api/tasks       — List tasks (with filters: team_id, status, assigned_to, sort)
POST   /api/tasks       — Create a new task
GET    /api/tasks/:id   — Get a single task
PUT    /api/tasks/:id   — Update a task
DELETE /api/tasks/:id   — Delete a task
"""
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from app.extensions import db
from app.models.task import Task
from app.models.team import TeamMember
from app.schemas.task_schema import TaskCreateSchema, TaskSchema, TaskUpdateSchema

tasks_bp = Blueprint('tasks', __name__)

task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)
create_schema = TaskCreateSchema()
update_schema = TaskUpdateSchema()


def _verify_team_access(user_id: int, team_id: int):
    """Verify the user has access to the team. Returns membership or None."""
    return TeamMember.query.filter_by(team_id=team_id, user_id=user_id).first()


@tasks_bp.route('', methods=['GET'])
@jwt_required()
def list_tasks():
    """List tasks with optional filters."""
    user_id = int(get_jwt_identity())
    team_id = request.args.get('team_id', type=int)

    if not team_id:
        return jsonify({'error': 'team_id query parameter is required'}), 400

    if not _verify_team_access(user_id, team_id):
        return jsonify({'error': 'You are not a member of this team'}), 403

    query = Task.query.filter_by(team_id=team_id)

    # Filters
    status = request.args.get('status')
    if status and status in ('todo', 'in_progress', 'completed'):
        query = query.filter_by(status=status)

    assigned_to = request.args.get('assigned_to', type=int)
    if assigned_to:
        query = query.filter_by(assigned_to=assigned_to)

    # "my tasks" shortcut
    if request.args.get('my_tasks') == 'true':
        query = query.filter_by(assigned_to=user_id)

    # Sorting
    sort = request.args.get('sort', 'created_at')
    sort_order = request.args.get('order', 'desc')

    sort_columns = {
        'created_at': Task.created_at,
        'due_date': Task.due_date,
        'priority': Task.priority,
        'title': Task.title,
        'status': Task.status,
    }

    sort_col = sort_columns.get(sort, Task.created_at)
    if sort_order == 'asc':
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    tasks = query.all()
    return jsonify({'tasks': tasks_schema.dump(tasks)}), 200


@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    """Create a new task."""
    user_id = int(get_jwt_identity())

    try:
        data = create_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400

    if not _verify_team_access(user_id, data['team_id']):
        return jsonify({'error': 'You are not a member of this team'}), 403

    # If assigning to someone, verify they are a team member
    if data.get('assigned_to'):
        if not _verify_team_access(data['assigned_to'], data['team_id']):
            return jsonify({'error': 'Assignee is not a member of this team'}), 400

    task = Task(
        team_id=data['team_id'],
        title=data['title'],
        description=data.get('description'),
        status=data.get('status', 'todo'),
        priority=data.get('priority', 'medium'),
        due_date=data.get('due_date'),
        created_by=user_id,
        assigned_to=data.get('assigned_to'),
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({
        'message': 'Task created successfully',
        'task': task_schema.dump(task),
    }), 201


@tasks_bp.route('/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id: int):
    """Get a single task by ID."""
    user_id = int(get_jwt_identity())
    task = Task.query.get_or_404(task_id)

    if not _verify_team_access(user_id, task.team_id):
        return jsonify({'error': 'You are not a member of this team'}), 403

    return jsonify({'task': task_schema.dump(task)}), 200


@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id: int):
    """Update a task."""
    user_id = int(get_jwt_identity())
    task = Task.query.get_or_404(task_id)

    if not _verify_team_access(user_id, task.team_id):
        return jsonify({'error': 'You are not a member of this team'}), 403

    try:
        data = update_schema.load(request.get_json())
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400

    # Update fields if provided
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'priority' in data:
        task.priority = data['priority']
    if 'due_date' in data:
        task.due_date = data['due_date']
    if 'assigned_to' in data:
        if data['assigned_to'] is not None:
            if not _verify_team_access(data['assigned_to'], task.team_id):
                return jsonify({'error': 'Assignee is not a member of this team'}), 400
        task.assigned_to = data['assigned_to']

    # Handle status change
    if 'status' in data:
        old_status = task.status
        task.status = data['status']
        if data['status'] == 'completed' and old_status != 'completed':
            task.completed_at = datetime.utcnow()
        elif data['status'] != 'completed':
            task.completed_at = None

    db.session.commit()
    return jsonify({'message': 'Task updated', 'task': task_schema.dump(task)}), 200


@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id: int):
    """Delete a task."""
    user_id = int(get_jwt_identity())
    task = Task.query.get_or_404(task_id)

    if not _verify_team_access(user_id, task.team_id):
        return jsonify({'error': 'You are not a member of this team'}), 403

    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'}), 200
