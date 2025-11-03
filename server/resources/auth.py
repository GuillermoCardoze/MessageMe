from flask import request
from flask_restful import Resource
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from models import db, User

bcrypt = Bcrypt()

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return {'message': 'Missing email or password'}, 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if user and bcrypt.check_password_hash(user.password_hash, data['password']):
            access_token = create_access_token(identity=user.id)
            return {
                'token': access_token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }, 200
        
        return {'message': 'Invalid credentials'}, 401
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