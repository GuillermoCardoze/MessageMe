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
    
    @jwt_required()
    def patch(self, user_id):
        """PATCH /users/<id> - Update user profile"""
        current_user_id = get_jwt_identity()
        
        # Only allow users to update their own profile
        if current_user_id != user_id:
            return {'message': 'Unauthorized'}, 403
        
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'username' in data:
            # Check if username is taken
            existing = User.query.filter_by(username=data['username']).first()
            if existing and existing.id != user_id:
                return {'message': 'Username already taken'}, 400
            user.username = data['username']
        
        if 'email' in data:
            # Check if email is taken
            existing = User.query.filter_by(email=data['email']).first()
            if existing and existing.id != user_id:
                return {'message': 'Email already taken'}, 400
            user.email = data['email']
        
        db.session.commit()
        
        return {
            'message': 'User updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, 200
    
    @jwt_required()
    def delete(self, user_id):
        """DELETE /users/<id> - Delete user account"""
        current_user_id = get_jwt_identity()
        
        # Only allow users to delete their own account
        if current_user_id != user_id:
            return {'message': 'Unauthorized'}, 403
        
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        
        return {'message': 'User deleted successfully'}, 200
