import os
import copy
import logging
import json

from multiprocessing import Process
from flask import request, jsonify, Blueprint, current_app, Response
from werkzeug.utils import secure_filename
from sqlalchemy.exc import InvalidRequestError

from gnn_server.db import *
api = Blueprint('api', __name__)

logger = logging.getLogger('gnn_vis')


######################
# API Starts here
######################
@api.route('/datasets', methods=['GET'])
def get_datasets():
    """Fetch the info of all datasets"""
    return jsonify({'success': True, 'datasets':GetDatasetsList()})



@api.route('/models', methods=['GET'])
def get_models():
    """Fetch the info of all models"""
    dataset_id = request.args.get('dataset_id', None, type=int)
    if dataset_id is None:
        return jsonify({'success': False, "info": "Please provide dataset_id." })
    else:
        modelsList = GetModelsList(dataset_id)
        if modelsList is None:
            return jsonify({'success': False, "info": "Please provide valid dataset_id." })
        else:
            return jsonify({'success': True, 'models':modelsList})

@api.route('/explainMethods', methods=['GET'])
def get_explainMethods():
    """Fetch the info of all explain methods"""
    model_id = request.args.get('model_id', None, type=int)
    if model_id is None:
        return jsonify({'success': False, "info": "Please provide model_id." })
    else:
        explainMethodsList = GetExplainMethodList(model_id)
        if explainMethodsList is None:
            return jsonify({'success': False, "info": "Please provide valid model_id." })
        else:
            return jsonify({'success': True, 'explainMethods':explainMethodsList})        
        
        
@api.route('/graphs', methods=['GET'])
def get_graphs():
    """Fetch the info of graphs corresponding to a specific dataset"""
    dataset_id = request.args.get('dataset_id', None, type=int)
    if dataset_id is None:
        return jsonify({'success': False, "info": "Please provide dataset_id." })
    else:
        graphList = GetGraphList(dataset_id)
        if graphList is None:
            return jsonify({'success': False, "info": "Please provide valid dataset_id." })
        else:
            return jsonify({'success': True, 'graphs':graphList})

@api.route('/graph_info', methods=['GET'])
def get_graph_info():
    """Fetch the info of specific graph with specific models output and explaination results"""
    dataset_id = request.args.get('dataset_id', None, type=int)
    model_id = request.args.get('model_id', None, type=int)
    graph_id = request.args.get('graph_id', None, type=int)
    explain_id = request.args.get('explain_id', None, type=int)
    if model_id is None or graph_id is None or dataset_id is None or explain_id is None:
        return jsonify({'success': False, "info": "Please provide model_id, graph_id, dataset_id, explain_id." })
    else:
        valid = check_id(dataset_id, model_id, explain_id, graph_id)
        if valid:
            ## OK ! 
            graph_obj = getGraphInfo(dataset_id, model_id, explain_id, graph_id)
            if graph_obj is None:
                return jsonify({'success': False, "info": "Something goes wrong when making prediction and explaination." })
            else:
                return jsonify({'success': True, "graph_obj": graph_obj })
        else:
            return jsonify({'success': False, "info": "Please provide valid model_id, graph_id, dataset_id, explain_id." })

@api.route('/graph_bundle_info', methods=['GET'])
def get_graph_bundle_info():
    """Fetch the info of specific graph with 3 models output"""
    dataset_id = request.args.get('dataset_id', None, type=int)
    if dataset_id is None:
        return jsonify({'success': False, "info": "Please provide dataset_id." })
    else:
        graph_obj = getGraphBundleInfo(dataset_id)
        if graph_obj is None:
            return jsonify({'success': False, "info": "Something goes wrong when fetching info of bundle graphs." })
        else:
            return jsonify({'success': True, "graph_obj": graph_obj })
        
@api.route('/rule_mining', methods=['GET'])
def get_rules_info():
    """Fetch the info of specific graph with 3 models output"""
    dataset_id = request.args.get('dataset_id', None, type=int)
    if dataset_id is None:
        return jsonify({'success': False, "info": "Please provide dataset_id." })
    else:
        rule_obj = getRulesInfo(dataset_id)
        if rule_obj is None:
            return jsonify({'success': False, "info": "Something goes wrong when fetching info of rules." })
        else:
            return jsonify({'success': True, "rule_obj": rule_obj })
