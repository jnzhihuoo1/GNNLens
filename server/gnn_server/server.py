import os
import sys
SERVER_ROOT = os.path.dirname(os.path.abspath(os.path.join(__file__, '..')))
sys.path.append(SERVER_ROOT)

import argparse
try:
    import simplejson as json
except ImportError:
    import json
from flask import Flask
from flask_cors import CORS
from gnn_server.api import api
from flask_compress import Compress
def create_app(config=None):
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    CORS(app)
    #Compress(app)
    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    
    app.register_blueprint(api, url_prefix='/api')
    return app


def add_arguments_server(parser):

    # API flags
    parser.add_argument('--host', default='0.0.0.0', help='Port in which to run the API')
    parser.add_argument('--port', default=7777, help='Port in which to run the API')
    parser.add_argument('--debug', action="store_const", default=False, const=True,
                        help='If true, run Flask in debug mode')


def start_server():

    # ATM flags
    parser = argparse.ArgumentParser()
    add_arguments_server(parser)

    _args = parser.parse_args()

    if _args.debug:
        os.environ['FLASK_ENV'] = 'development'

    app = create_app(vars(_args))

    app.run(
        debug=_args.debug,
        host=_args.host,
        port=int(_args.port)
    )


if __name__ == '__main__':
    start_server()
