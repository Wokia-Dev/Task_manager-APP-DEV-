"""
Task Schemas (Marshmallow)
"""
from marshmallow import fields, validate

from app.extensions import ma
from app.models.task import Task
from app.schemas.auth_schema import UserSchema


class TaskSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing Task objects."""

    creator = fields.Nested(UserSchema, dump_only=True)
    assignee = fields.Nested(UserSchema, dump_only=True, allow_none=True)
    is_overdue = fields.Boolean(dump_only=True)

    class Meta:
        model = Task
        fields = ('id', 'team_id', 'title', 'description', 'status', 'priority',
                  'due_date', 'created_by', 'assigned_to', 'created_at',
                  'updated_at', 'completed_at', 'creator', 'assignee', 'is_overdue')
        dump_only = ('id', 'created_at', 'updated_at', 'completed_at')


class TaskCreateSchema(ma.Schema):
    """Schema for validating task creation input."""
    team_id = fields.Integer(required=True)
    title = fields.String(
        required=True,
        validate=validate.Length(min=1, max=200)
    )
    description = fields.String(
        validate=validate.Length(max=5000),
        load_default=None
    )
    status = fields.String(
        validate=validate.OneOf(['todo', 'in_progress', 'completed']),
        load_default='todo'
    )
    priority = fields.String(
        validate=validate.OneOf(['low', 'medium', 'high', 'urgent']),
        load_default='medium'
    )
    due_date = fields.Date(load_default=None)
    assigned_to = fields.Integer(load_default=None)


class TaskUpdateSchema(ma.Schema):
    """Schema for validating task update input."""
    title = fields.String(validate=validate.Length(min=1, max=200))
    description = fields.String(validate=validate.Length(max=5000), allow_none=True)
    status = fields.String(validate=validate.OneOf(['todo', 'in_progress', 'completed']))
    priority = fields.String(validate=validate.OneOf(['low', 'medium', 'high', 'urgent']))
    due_date = fields.Date(allow_none=True)
    assigned_to = fields.Integer(allow_none=True)
