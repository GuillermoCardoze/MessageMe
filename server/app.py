from flask import Flask
from flask_restful import Api, Resource
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_jwt_extended import JWTManager
from models import db
from config import Config
from resources.auth import RegisterResource, LoginResource
from resources.user import UserListResource, UserResource
from resources.group import GroupListResource, GroupResource, GroupMembersResource
from resources.message import MessageListResource, ConversationResource, MessageResource


app = Flask(__name__)
app.config.from_object(Config)

CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")
jwt = JWTManager(app)
api = Api(app)

db.init_app(app)

# Test endpoint
class HelloWorld(Resource):
    def get(self):
        return {'message': 'Hello World! MessageMe API is running!'}, 200

api.add_resource(HelloWorld, '/')
api.add_resource(RegisterResource, '/auth/register')
api.add_resource(LoginResource, '/auth/login')
api.add_resource(UserListResource, '/users')
api.add_resource(UserResource, '/users/<int:user_id>')
api.add_resource(GroupListResource, '/groups')
api.add_resource(GroupResource, '/groups/<int:group_id>')
api.add_resource(GroupMembersResource, '/groups/<int:group_id>/members')
api.add_resource(MessageListResource, '/messages')
api.add_resource(ConversationResource, '/users/<int:other_user_id>/messages')
api.add_resource(MessageResource, '/messages/<int:message_id>')

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('connection_response', {'status': 'Connected to MessageMe!'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join')
def handle_join(data):
    user_id = data.get('user_id')
    if user_id:
        join_room(f'user_{user_id}')
        print(f'User {user_id} joined their room')

@socketio.on('send_message')
def handle_send_message(data):
    """Handle incoming message from client"""
    try:
        sender_id = data.get('sender_id')
        recipient_id = data.get('recipient_id')
        content = data.get('content')
        
        print(f'Message from user {sender_id} to user {recipient_id}: {content}')
        
        # Save message to database
        from models import Message
        new_message = Message(
            sender_id=sender_id,
            recipient_id=recipient_id,
            content=content
        )
        db.session.add(new_message)
        db.session.commit()
        
        # Prepare message data
        message_data = {
            'id': new_message.id,
            'sender_id': new_message.sender_id,
            'recipient_id': new_message.recipient_id,
            'content': new_message.content,
            'timestamp': new_message.timestamp.isoformat()
        }
        
        # Send to recipient's room
        emit('new_message', message_data, room=f'user_{recipient_id}')
        
        # Also send back to sender for confirmation
        emit('message_sent', message_data)
        
        print(f'Message saved and sent!')
        
    except Exception as e:
        print(f'Error sending message: {e}')
        emit('message_error', {'error': str(e)})

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)