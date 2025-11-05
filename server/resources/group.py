from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Group

class GroupListResource(Resource):
    @jwt_required()
    def get(self):
        """GET /groups - Get all groups"""
        groups = Group.query.all()
        return {
            'groups': [{
                'id': g.id,
                'name': g.name,
                'description': g.description,
                'member_count': len(g.members),
                'created_at': g.created_at.isoformat()
            } for g in groups]
        }, 200
    
    @jwt_required()
    def post(self):
        """POST /groups - Create a new group"""
        data = request.get_json()
        
        if not data or not data.get('name'):
            return {'message': 'Group name required'}, 400
        
        new_group = Group(
            name=data['name'],
            description=data.get('description', '')
        )
        
        db.session.add(new_group)
        db.session.commit()
        
        return {
            'message': 'Group created successfully',
            'group': {
                'id': new_group.id,
                'name': new_group.name,
                'description': new_group.description
            }
        }, 201


class GroupResource(Resource):
    @jwt_required()
    def get(self, group_id):
        """GET /groups/<id> - Get specific group"""
        group = Group.query.get_or_404(group_id)
        
        return {
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'created_at': group.created_at.isoformat(),
            'member_count': len(group.members),
            'members': [{
                'id': m.id,
                'username': m.username
            } for m in group.members]
        }, 200