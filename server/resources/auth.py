from flask import request
from flask_restful import Resource
from flask_bcrypt import Bcrypt
from models import db, User

bcrypt = Bcrypt()

class RegisterResource(Resource):
    def post(self):
        data = request.get_json()
        
        # Validation
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return {'message': 'Missing required fields'}, 400
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return {'message': 'Email already exists'}, 400
        
        if User.query.filter_by(username=data['username']).first():
            return {'message': 'Username already exists'}, 400
        
        # Hash password
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create user
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=hashed_password
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return {
            'message': 'User created successfully',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            }
        }, 201