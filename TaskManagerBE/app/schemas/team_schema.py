"""
Team Schemas (Marshmallow)
"""
from marshmallow import fields, validate

from app.extensions import ma
from app.models.team import Team, TeamMember
from app.schemas.auth_schema import UserSchema


class TeamMemberSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing TeamMember objects."""

    user = fields.Nested(UserSchema, dump_only=True)

    class Meta:
        model = TeamMember
        fields = ('id', 'team_id', 'user_id', 'role', 'joined_at', 'user')
        dump_only = ('id', 'joined_at')


class TeamSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing Team objects."""

    creator = fields.Nested(UserSchema, dump_only=True)
    member_count = fields.Method('get_member_count')

    class Meta:
        model = Team
        fields = ('id', 'name', 'invite_code', 'created_by', 'created_at',
                  'creator', 'member_count')
        dump_only = ('id', 'invite_code', 'created_at')

    def get_member_count(self, obj: Team) -> int:
        return obj.members.count()


class TeamCreateSchema(ma.Schema):
    """Schema for validating team creation input."""
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100)
    )


class TeamJoinSchema(ma.Schema):
    """Schema for validating team join input."""
    invite_code = fields.String(
        required=True,
        validate=validate.Length(min=1, max=20)
    )
