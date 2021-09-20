import os
import copy
import logging
import json

#from multiprocessing import Process
from flask import request, jsonify, Blueprint, current_app, Response
#from werkzeug.utils import secure_filename
#from sqlalchemy.exc import InvalidRequestError

from mini_server.db import *
api = Blueprint('api', __name__)

logger = logging.getLogger('gnn_vis')


######################
# API Starts here
######################
@api.route('/datasets', methods=['GET'])
def get_datasets():
    """Fetch the info of all datasets"""
    return jsonify({'success': True, 'datasets':GetDatasetsList()})


@api.route('/graph_bundle_info', methods=['GET'])
def get_graph_bundle_info():
    """Fetch the info of specific graph with 3 models output"""
    dataset_id = request.args.get('dataset_id', None, type=int)
    if dataset_id is None:
        return jsonify({'success': False, "info": "Please provide model_id, graph_id, dataset_id, explain_id." })
    else:
        graph_obj = getGraphBundleInfo(dataset_id)
        if graph_obj is None:
            return jsonify({'success': False, "info": "Something goes wrong when fetching info of bundle graphs." })
        else:
            return jsonify({'success': True, "graph_obj": graph_obj })
        
