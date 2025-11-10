from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Message, User

class MessageListResource(Resource):
    @jwt_required()
    def get(self):
        """GET /messages - Get all messages for current user"""
        user_id = get_jwt_identity()
        
        messages = Message.query.filter(
            (Message.sender_id == user_id) | (Message.recipient_id == user_id)
        ).order_by(Message.timestamp.desc()).all()
        
        return {
            'messages': [{
                'id': m.id,
                'sender_id': m.sender_id,
                'sender_username': m.sender.username,
                'recipient_id': m.recipient_id,
                'recipient_username': m.recipient.username,
                'content': m.content,
                'timestamp': m.timestamp.isoformat(),
                'is_read': m.is_read,
                'is_mine': m.sender_id == user_id
            } for m in messages]
        }, 200
    
    @jwt_required()
    
    def post(self):
        """POST /messages - Send a new message"""
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('recipient_id') or not data.get('content'):
            return {'message': 'Missing required fields'}, 400
        
        # Validate recipient exists
        recipient = User.query.get(data['recipient_id'])
        if not recipient:
            return {'message': 'Recipient not found'}, 404
        
        # Can't message yourself
        if user_id == data['recipient_id']:
            return {'message': 'Cannot message yourself'}, 400
        
        new_message = Message(
            sender_id=user_id,
            recipient_id=data['recipient_id'],
            content=data['content']
        )
        
        db.session.add(new_message)
        db.session.commit()
        
        return {
            'message': 'Message sent successfully',
            'data': {
                'id': new_message.id,
                'sender_id': new_message.sender_id,
                'recipient_id': new_message.recipient_id,
                'content': new_message.content,
                'timestamp': new_message.timestamp.isoformat()
            }
        }, 201


class ConversationResource(Resource):
    @jwt_required()
    def get(self, other_user_id):
        """GET /users/<id>/messages - Get conversation with specific user"""
        user_id = get_jwt_identity()
        
        # Validate other user exists
        other_user = User.query.get(other_user_id)
        if not other_user:
            return {'message': 'User not found'}, 404
        
        messages = Message.query.filter(
            ((Message.sender_id == user_id) & (Message.recipient_id == other_user_id)) |
            ((Message.sender_id == other_user_id) & (Message.recipient_id == user_id))
        ).order_by(Message.timestamp.asc()).all()
        
        return {
            'conversation_with': {
                'id': other_user.id,
                'username': other_user.username
            },
            'messages': [{
                'id': m.id,
                'sender_id': m.sender_id,
                'content': m.content,
                'timestamp': m.timestamp.isoformat(),
                'is_mine': m.sender_id == user_id
            } for m in messages]
        }, 200
    
class MessageResource(Resource):
    @jwt_required()
    def delete(self, message_id):
        """DELETE /messages/<id> - Delete message"""
        user_id = get_jwt_identity()
        message = Message.query.get_or_404(message_id)
        
        # Only sender can delete their message
        if message.sender_id != user_id:
            return {'message': 'Unauthorized'}, 403
        
        db.session.delete(message)
        db.session.commit()
        
        return {'message': 'Message deleted successfully'}, 200