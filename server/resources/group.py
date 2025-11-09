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
    
    @jwt_required()
    def patch(self, group_id):
        """PATCH /groups/<id> - Update group"""
        group = Group.query.get_or_404(group_id)
        data = request.get_json()
        
        if 'name' in data:
            group.name = data['name']
        if 'description' in data:
            group.description = data['description']
        
        db.session.commit()
        
        return {
            'message': 'Group updated successfully',
            'group': {
                'id': group.id,
                'name': group.name,
                'description': group.description
            }
        }, 200
    
    @jwt_required()
    def delete(self, group_id):
        """DELETE /groups/<id> - Delete group"""
        group = Group.query.get_or_404(group_id)
        db.session.delete(group)
        db.session.commit()
        
        return {'message': 'Group deleted successfully'}, 200
    
class GroupMembersResource(Resource):
    @jwt_required()
    def post(self, group_id):
        """POST /groups/<id>/members - Join a group"""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        group = Group.query.get_or_404(group_id)
        
        if group in user.groups:
            return {'message': 'Already in group'}, 400
        
        user.groups.append(group)
        db.session.commit()
        
        return {
            'message': 'Joined group successfully',
            'group': {
                'id': group.id,
                'name': group.name
            }
        }, 201
    
    @jwt_required()
    def delete(self, group_id):
        """DELETE /groups/<id>/members - Leave a group"""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        group = Group.query.get_or_404(group_id)
        
        if group not in user.groups:
            return {'message': 'Not in group'}, 400
        
        user.groups.remove(group)
        db.session.commit()
        
        return {'message': 'Left group successfully'}, 200