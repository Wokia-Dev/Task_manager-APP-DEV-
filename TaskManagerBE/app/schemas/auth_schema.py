"""
Auth / User Schemas (Marshmallow)
"""
from marshmallow import fields, validate

from app.extensions import ma
from app.models.user import User


class UserSchema(ma.SQLAlchemyAutoSchema):
    """Schema for serializing User objects (public-facing)."""

    initials = fields.Method('get_initials')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'full_name', 'avatar_color',
                  'initials', 'created_at')
        dump_only = ('id', 'created_at', 'initials')

    def get_initials(self, obj: User) -> str:
        return obj.get_initials()


class UserRegisterSchema(ma.Schema):
    """Schema for validating registration input."""
    username = fields.String(
        required=True,
        validate=validate.Length(min=3, max=50)
    )
    email = fields.Email(required=True)
    password = fields.String(
        required=True,
        validate=validate.Length(min=6, max=128),
        load_only=True
    )
    full_name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100)
    )
    avatar_color = fields.String(
        validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'),
        load_default='#6C63FF'
    )


class UserLoginSchema(ma.Schema):
    """Schema for validating login input."""
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)
