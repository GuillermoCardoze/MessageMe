from flask import Flask
from flask_restful import Api, Resource
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from config import Config
from resources.auth import RegisterResource, LoginResource
from resources.user import UserListResource, UserResource

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
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

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)