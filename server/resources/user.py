from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User

class UserListResource(Resource):
    @jwt_required()
    def get(self):
        """GET /users - Get all users (protected route)"""
        users = User.query.all()
        return {
            'users': [{
                'id': u.id,
                'username': u.username,
                'email': u.email
            } for u in users]
        }, 200


class UserResource(Resource):
    @jwt_required()
    def get(self, user_id):
        """GET /users/<id> - Get specific user (protected route)"""
        user = User.query.get_or_404(user_id)
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at.isoformat()
        }, 200