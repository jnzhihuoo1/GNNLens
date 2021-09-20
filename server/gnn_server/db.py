from models import *
from graphs import *
from utils import *
from __init__ import *
#from rule_mining import extract_rule
import time
### Constants
EXPLAIN_SA = 11
EXPLAIN_GBP = 12
EXPLAIN_LRP = 13
EXPLAIIN_MESSAGEPASSING = 14
### Database
models_list = {
    "models": {
        4:{
            "id":4,
            "name": "Cora_GCN",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":False
            },
            "model_config":{
                "args":[1433,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_cora_state.pkt",
            "available_explain_method": [4]
        },
        5:{
            "id":5,
            "name": "Cora_GCN_LeftNorm",
            "type": "GCN",
            "graph_config": {
                "norm_type":"LeftNorm_tildeA",
                "identity_features":False
            },
            "model_config":{
                "args":[1433,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_cora_leftnorm_state.pkt",
            "available_explain_method": [4]
        },
        6:{
            "id":6,
            "name": "Cora_GCN_SymNorm",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":False
            },
            "model_config":{
                "args":[1433,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_cora_symnorm_state.pkt",
            "available_explain_method": [4]
        },
        7:{
            "id":7,
            "name": "Cora_MLP",
            "type": "GCN",
            "graph_config": {
                "norm_type":"Identity_L",
                "identity_features":False
            },
            "model_config":{
                "args":[1433,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/mlp_cora_state.pkt",
            "available_explain_method": [4]
        },
        8:{
            "id":8,
            "name": "Cora_GCN_Identity_features",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":True
            },
            "model_config":{
                "args":[2708,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_identity_features_cora_state.pkt",
            "available_explain_method": [4]
        },
        9:{
            "id":9,
            "name": "Citeseer_GCN",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":False
            },
            "model_config":{
                "args":[3703,16,6,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_citeseer_state.pkt",
            "available_explain_method": [4]
        },
        10:{
            "id":10,
            "name": "Citeseer_MLP",
            "type": "GCN",
            "graph_config": {
                "norm_type":"Identity_L",
                "identity_features":False
            },
            "model_config":{
                "args":[3703,16,6,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/mlp_citeseer_state.pkt",
            "available_explain_method": [4]
        },
        11:{
            "id":11,
            "name": "Citeseer_GCN_identity_features",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":True
            },
            "model_config":{
                "args":[3327,16,6,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_identity_features_citeseer_state.pkt",
            "available_explain_method": [4]
        },
        12:{
            "id":12,
            "name": "Cora_GCN_SymNorm_A",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_A",
                "identity_features":False
            },
            "model_config":{
                "args":[1433,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_symnorm_a_cora_state.pkt",
            "available_explain_method": [4]
        },
        13:{
            "id":13,
            "name": "PubMed_GCN",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":False
            },
            "model_config":{
                "args":[500,16,3,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_pubmed_state.pkt",
            "available_explain_method": [4]
        },
        14:{
            "id":14,
            "name": "PubMed_MLP",
            "type": "GCN",
            "graph_config": {
                "norm_type":"Identity_L",
                "identity_features":False
            },
            "model_config":{
                "args":[500,16,3,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/mlp_pubmed_state.pkt",
            "available_explain_method": [4]
        },
        15:{
            "id":15,
            "name": "PubMed_GCN_identity_features",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":True
            },
            "model_config":{
                "args":[19717,16,3,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_identity_features_pubmed_state.pkt",
            "available_explain_method": [4]
        },
        16:{
            "id":16,
            "name": "Cora_ML_GCN",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":False
            },
            "model_config":{
                "args":[2879,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_cora_ml_state.pkt",
            "available_explain_method": [4]
        },
        17:{
            "id":17,
            "name": "Cora_ML_MLP",
            "type": "GCN",
            "graph_config": {
                "norm_type":"Identity_L",
                "identity_features":False
            },
            "model_config":{
                "args":[2879,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/mlp_cora_ml_state.pkt",
            "available_explain_method": [4]
        },
        18:{
            "id":18,
            "name": "Cora_ML_GCN_Identity_features",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":True
            },
            "model_config":{
                "args":[2810,16,7,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_identity_features_cora_ml_state.pkt",
            "available_explain_method": [4]
        },
        19:{
            "id":19,
            "name": "PolBlogs_GCN_Identity_features",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":True
            },
            "model_config":{
                "args":[1222,16,2,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_identity_features_polblogs_state.pkt",
            "available_explain_method": [4]
        },
        20:{
            "id":20,
            "name": "Photo_GCN",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":False
            },
            "model_config":{
                "args":[745,16,8,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_photo_state.pkt",
            "available_explain_method": [4]
        },
        21:{
            "id":21,
            "name": "Photo_MLP",
            "type": "GCN",
            "graph_config": {
                "norm_type":"Identity_L",
                "identity_features":False
            },
            "model_config":{
                "args":[745,16,8,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/mlp_photo_state.pkt",
            "available_explain_method": [4]
        },
        22:{
            "id":22,
            "name": "Photo_GCN_Identity_features",
            "type": "GCN",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":True
            },
            "model_config":{
                "args":[7650,16,8,0.5],
                "kwargs":{
                    "bias": True
                }
            },
            "path": "/models/gcn_identity_features_photo_state.pkt",
            "available_explain_method": [4]
        },
        23:{
            "id":23,
            "name": "Cora_GAT",
            "type": "GAT",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":False,
                "load_version":"v3"
            },
            "model_config":{
                "args":[1433, 1433, 8, 7, 1],
                "kwargs":{
                    
                }
            },
            "path": "/models/gat_cora_state.pkt",
            "available_explain_method": [4]
        },
        24:{
            "id":24,
            "name": "Cora_GAT_Identity_Features",
            "type": "GAT",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":True,
                "load_version":"v3"
            },
            "model_config":{
                "args":[2708, 2708, 8, 7, 1],
                "kwargs":{
                    
                }
            },
            "path": "/models/gat_identity_features_cora_state.pkt",
            "available_explain_method": [4]
        },
        25:{
            "id":25,
            "name": "Cora_ML_GAT",
            "type": "GAT",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":False,
                "load_version":"v3"
            },
            "model_config":{
                "args":[2879, 2879, 8, 7, 1],
                "kwargs":{
                    
                }
            },
            "path": "/models/gat_cora_ml_state.pkt",
            "available_explain_method": [4]
        },
        26:{
            "id":26,
            "name": "Cora_ML_GAT_Identity_Features",
            "type": "GAT",
            "graph_config": {
                "norm_type":"SymNorm_tildeA",
                "identity_features":True,
                "load_version":"v3"
            },
            "model_config":{
                "args":[2810, 2810, 8, 7, 1],
                "kwargs":{
                    
                }
            },
            "path": "/models/gat_identity_features_cora_ml_state.pkt",
            "available_explain_method": [4]
        },
        27:{
            "id":27,
            "name": "Cora_ML_GAT_Identity_Structure",
            "type": "GAT",
            "graph_config": {
                "norm_type":"Identity_L",
                "identity_features":False,
                "load_version":"v3"
            },
            "model_config":{
                "args":[2879, 2879, 8, 7, 1],
                "kwargs":{
                    
                }
            },
            "path": "/models/gat_identity_structure_cora_ml_state.pkt",
            "available_explain_method": [4]
        },
        
    }
}

#####



'''  1:{
            "id":1,
            "name":"Infection",
            "available_models":[1,2],
            "task":"node_classification",
            "graphlist":[
                [1, "graph-1"],
                [2, "graph-2"],
                [3, "graph-3"],
                [4, "graph-4"],
                [5, "graph-5"]
            ]
        },
        2:{
            "id":2,
            "name":"Big_Infection",
            "available_models":[1,2],
            "task":"node_classification",
            "graphlist":[
                [1, "biggraph-6"]
            ]
        },
        3:{
            "id":3,
            "name":"Solubility",
            "available_models":[3],
            "task":"graph_classification",
            "graphlist":getSolubilityGraphList()
        }, 
        8:{
            "id":8,
            "name":"PolBlogs",
            "available_models":[19],
            "task":"node_classification",
            "graphlist":[
                [1, "PolBlogs"]
            ],
            "bundle_info":{
               "GCN":{"model_id":19},
               "MLP":{"model_id":19},
               "GCN_Identity_features":{"model_id":19}
            }
        }, 
       10:{
            "id":10,
            "name":"Cora(GAT)",
            "available_models":[7,23,24],
            "task":"node_classification",
            "graphlist":[
                [1, "Cora"]
            ],
            "bundle_info":{
               "GCN":{"model_id":23,"real_model_name":"GAT"},
               "MLP":{"model_id":7,"real_model_name":"MLP"},
               "GCN_Identity_features":{"model_id":24,"real_model_name":"GAT w/o features"}
            }
        },
        11:{
            "id":11,
            "name":"Cora(GAT_GCN)",
            "available_models":[4,23,24],
            "task":"node_classification",
            "graphlist":[
                [1, "Cora"]
            ],
            "bundle_info":{
               "GCN":{"model_id":23,"real_model_name":"GAT"},
               "MLP":{"model_id":4,"real_model_name":"GCN"},
               "GCN_Identity_features":{"model_id":24,"real_model_name":"GAT w/o features"}
            }
        },
        12:{
            "id":12,
            "name":"Cora(GAT_GCN_Identity_features)",
            "available_models":[8,23,24],
            "task":"node_classification",
            "graphlist":[
                [1, "Cora"]
            ],
            "bundle_info":{
               "GCN":{"model_id":23,"real_model_name":"GAT"},
               "MLP":{"model_id":8,"real_model_name":"GCN w/o features"},
               "GCN_Identity_features":{"model_id":24,"real_model_name":"GAT w/o features"}
            }
        },
        
        
        '''
DefaultNameMapping = {
    "GCN":"GCN",
    "MLP":"MLP",
    "GCN_Identity_features":"GCNWUF"
}
graphs_list = {
    "graphs":{
        4:{
            "id":4,
            "name":"Cora",
            "available_models":[4,5,6,7,8,12],
            "task":"node_classification",
            "graphlist":[
                [1, "Cora"]
            ],
            "bundle_info":{
               "GCN":{"model_id":4},
               "MLP":{"model_id":7},
               "GCN_Identity_features":{"model_id":8}
            }
        },
        5:{
            "id":5,
            "name":"Citeseer",
            "available_models":[9,10,11],
            "task":"node_classification",
            "graphlist":[
                [1, "Citeseer"]
            ],
            "bundle_info":{
               "GCN":{"model_id":9},
               "MLP":{"model_id":10},
               "GCN_Identity_features":{"model_id":11}
            }
        },
        6:{
            "id":6,
            "name":"PubMed",
            "available_models":[13,14,15],
            "task":"node_classification",
            "graphlist":[
                [1, "PubMed"]
            ],
            "bundle_info":{
               "GCN":{"model_id":13},
               "MLP":{"model_id":14},
               "GCN_Identity_features":{"model_id":15}
            }
        },
        7:{
            "id":7,
            "name":"Cora_ML",
            "available_models":[16,17,18],
            "task":"node_classification",
            "graphlist":[
                [1, "Cora_ML"]
            ],
            "bundle_info":{
               "GCN":{"model_id":16},
               "MLP":{"model_id":17},
               "GCN_Identity_features":{"model_id":18}
            }
        },
        9:{
            "id":9,
            "name":"Photo",
            "available_models":[20,21,22],
            "task":"node_classification",
            "graphlist":[
                [1, "Photo"]
            ],
            "bundle_info":{
               "GCN":{"model_id":20},
               "MLP":{"model_id":21},
               "GCN_Identity_features":{"model_id":22}
            }
        },
        
        13:{
            "id":13,
            "name":"Cora_ML(GAT)",
            "available_models":[25,26,27],
            "task":"node_classification",
            "graphlist":[
                [1, "Cora_ML"]
            ],
            "bundle_info":{
               "GCN":{"model_id":25,"real_model_name":"GAT"},
               "MLP":{"model_id":27,"real_model_name":"MLP"},
               "GCN_Identity_features":{"model_id":26,"real_model_name":"GATWUF"}
            }
        },
    }
}
## 7 MLP

explain_methods_list = {
    "explain_methods":{
        1:{
            "id":1,
            "name":"SA",
            "code":EXPLAIN_SA
        },
        2:{
            "id":2,
            "name":"GBP",
            "code":EXPLAIN_GBP
        },
        3:{
            "id":3,
            "name":"LRP",
            "code":EXPLAIN_LRP
        },
        4:{
            "id":4,
            "name":"MessagePassing",
            "code":EXPLAIIN_MESSAGEPASSING
        }
    }
}
model_keys = set(models_list["models"].keys())
dataset_keys = set(graphs_list["graphs"].keys())

def GetDatasetsList():
    datasets_released_list = [ { "id": key, "name": graphs_list["graphs"][key]["name"]} for key in graphs_list["graphs"].keys()]   
    return datasets_released_list

def GetModelsList(dataset_id):
    if dataset_id in dataset_keys:
        available_model = graphs_list["graphs"][dataset_id]["available_models"]
        models_released_list = [ { "id": key, "name": models_list["models"][key]["name"]} for key in available_model]
        return models_released_list
    else:
        return None

def GetExplainMethodList(model_id):
    if model_id in model_keys:
        available_method = models_list["models"][model_id]["available_explain_method"]
        explain_method_list = [{ "id":key, "name":explain_methods_list["explain_methods"][key]["name"] } for key in available_method]
        return explain_method_list
    else:
        return None

def GetGraphList(dataset_id):
    if dataset_id in dataset_keys:
        graphs_released_list = graphs_list["graphs"][dataset_id]["graphlist"]
        return graphs_released_list
    else:
        return None

def GetModel(model_id):
    model_path = models_list["models"][model_id]["path"]
    model_type = models_list["models"][model_id]["type"]
    experiment = Path(SERVER_ROOT+model_path)
    
    if model_type == "GCN":
        model_config = models_list["models"][model_id]["model_config"]
        net = load_GCN(experiment, model_config["args"], model_config["kwargs"])
        net_package = {
            "net":net
        }
    elif model_type == "GAT":
        model_config = models_list["models"][model_id]["model_config"]
        net = load_GAT(experiment, model_config["args"], model_config["kwargs"])
        net_package = {
            "net":net
        }
    else:
        return None
    return net_package


### SA

def SA_ExplainNode(net, graph_in, node_no):
    batch = tg.GraphBatch.collate([graph_in]).requires_grad_()
    graph_out = net(batch)[0]

    N = node_no
    node_relevance = torch.zeros_like(graph_out.node_features)
    node_relevance[N] = 1

    graph_in.zero_grad_()
    graph_out.node_features.backward(node_relevance)

    node_importance = batch.node_features.grad.pow(2).sum(dim=1)
    edge_importance = batch.edge_features.grad.pow(2).sum(dim=1)
    return node_importance, edge_importance

def SA_ExplainGraph(net, graph_in):
    batch = tg.GraphBatch.collate([graph_in]).requires_grad_()
    graph_out = net(batch)[0]

    out = graph_out.global_features

    graph_in.zero_grad_()
    out.backward(out)

    node_importance = batch.node_features.grad.pow(2).sum(dim=1)
    edge_importance = batch.edge_features.grad.pow(2).sum(dim=1)
    return node_importance, edge_importance


def GBP_ExplainNode(net_gp, graph_in, node_no):
    batch = tg.GraphBatch.collate([graph_in]).requires_grad_()
    batch.node_features.register_hook(lambda grad: grad.clamp(min=0))
    batch.edge_features.register_hook(lambda grad: grad.clamp(min=0))
    graph_out = net_gp(batch)[0]

    N = node_no
    node_relevance = torch.zeros_like(graph_out.node_features)
    node_relevance[N] = 1

    batch.zero_grad_()
    graph_out.node_features.backward(node_relevance)
    node_importance = batch.node_features.grad.pow(2).sum(dim=1)
    edge_importance = batch.edge_features.grad.pow(2).sum(dim=1)
    return node_importance, edge_importance

def LRP_ExplainNode(net_lrp, graph_in, node_no):
    batch = tg.GraphBatch.collate([graph_in]).requires_grad_()
    graph_out = net_lrp(batch)[0]

    N = node_no
    node_relevance = torch.zeros_like(graph_out.node_features)
    node_relevance[N] = graph_out.node_features[N]

    graph_in.zero_grad_()
    graph_out.node_features.backward(node_relevance)
    node_importance = batch.node_features.grad.pow(1).sum(dim=1)
    edge_importance = batch.edge_features.grad.pow(1).sum(dim=1)
    return node_importance, edge_importance

def LRP_ExplainGraph(net_lrp, graph_in):
    batch = tg.GraphBatch.collate([graph_in]).requires_grad_()
    graph_out = net_lrp(batch)[0]

    out = graph_out.global_features

    graph_in.zero_grad_()
    out.backward(out)

    node_importance = batch.node_features.grad.pow(1).sum(dim=1)
    edge_importance = batch.edge_features.grad.pow(1).sum(dim=1)
    return node_importance, edge_importance

def ExplainNode(ExplainMethod, models, graph_in, node_no):
    net = models["net"]
    net_gp = models["net_gp"]
    net_lrp = models["net_lrp"]
    if ExplainMethod == EXPLAIN_SA:
        if net is None:
            return None, None
        return SA_ExplainNode(net, graph_in,  node_no)
    elif ExplainMethod == EXPLAIN_GBP:
        if net_gp is None:
            return None, None
        return GBP_ExplainNode(net_gp, graph_in,  node_no)
    elif ExplainMethod == EXPLAIN_LRP:
        if net_lrp is None:
            return None, None
        return LRP_ExplainNode(net_lrp, graph_in,  node_no)
    else:
        print("Not implemented error")
        return None, None

def ExplainGraph(ExplainMethod, models, graph_in):
    net = models["net"]
    net_gp = models["net_gp"]
    net_lrp = models["net_lrp"]
    if ExplainMethod == EXPLAIN_SA:
        if net is None:
            return None, None
        return SA_ExplainGraph(net, graph_in)
    elif ExplainMethod == EXPLAIN_LRP:
        if net_lrp is None:
            return None, None
        return LRP_ExplainGraph(net_lrp, graph_in)
    else:
        print("Not implemented error")
        return None, None
    
    
def check_id(dataset_id, model_id, explain_id, graph_id):
    if dataset_id in dataset_keys:
        available_model = set(graphs_list["graphs"][dataset_id]["available_models"])
        if model_id in available_model:
            available_method = set(models_list["models"][model_id]["available_explain_method"])
            if explain_id in available_method:
                graphs_released_list = graphs_list["graphs"][dataset_id]["graphlist"]
                available_graph_id = set([item[0] for item in graphs_released_list])
                if graph_id in available_graph_id:
                    return True
    return False
    
def getGraphInfo(dataset_id, model_id, explain_id, graph_id):
    Explain_method = explain_methods_list["explain_methods"][explain_id]["code"]
    Explain_type = explain_methods_list["explain_methods"][explain_id]["name"]
    task = graphs_list["graphs"][dataset_id]["task"]
    
    models = GetModel(model_id)
    
    if models is None:
        return None
    config = models_list["models"][model_id]
    model_type = config["type"]
    graph_config = None
    if "graph_config" in config:
        graph_config = config["graph_config"]
    whole_graph = GetGraph(dataset_id, graph_id, graph_config)
    if whole_graph is None:
        return None
    
    data_type = whole_graph["type"]
    if data_type == 2:
        ### GCN for Cora
        features = whole_graph["features"]
        features_sparse, features_sparse_value = constructSparseFeature(features.cpu().numpy())
        L = whole_graph["L"]
        original_graph = whole_graph["graph"]
        labels = whole_graph["labels"]
        name = whole_graph["name"]
        graph_layout = whole_graph["graph_layout"]
        embedding = whole_graph["embedding"]
        mask = whole_graph["mask"]
        graph_additional_info = whole_graph["graph_additional_info"]
        data_package = whole_graph["data_package"]
        net = models["net"]
        
        if net is None:
            return None
        if model_type == "GAT":
            output = net(data_package)
        else: 
            output, hidden_vector = net(features, L)
        output_softmax = F.softmax(output, dim=1)
        preds = output.max(1)[1].type_as(labels)
        net_state_dict = net.state_dict()
        
        if task == "node_classification":
            
            '''
            return_object = {
                "dataset_id": dataset_id,
                "data_type_id": data_type,
                "model": model_id,
                "graph": graph_id,
                "explain_id": explain_id,
                "task": task,
                "graph_in": {
                    "feature":features_sparse,
                    "senders":original_graph._indices()[1].tolist(),
                    "receivers":original_graph._indices()[0].tolist()
                },
                "graph_target":{
                    "node_features":labels.tolist(),
                },
                "graph_out":{
                    "node_features":preds.tolist(),
                    "output_vector":output_softmax.tolist(),
                    "hidden_vector":hidden_vector.tolist()
                },
                "graph_explaination":
                {
                    "type":  Explain_type
                },
                "graph_layout":graph_layout, 
                "embedding":embedding,
                "message_passing":{
                    "senders":L._indices()[1].tolist(),
                    "receivers":L._indices()[0].tolist(),
                    "values":L._values().tolist()
                },
                "model_state_dict":{
                    "gc1.weight":net_state_dict["gc1.weight"].tolist(),
                    "gc1.bias":net_state_dict["gc1.bias"].tolist(),
                    "gc2.weight": net_state_dict["gc2.weight"].tolist(),
                    "gc2.bias":net_state_dict["gc2.bias"].tolist()
                },
                "mask":mask,
                "graph_additional_info":graph_additional_info,
                "name":name
            }
            '''
            ## Remove model_state_dict, embedding, graph_out.hidden_vector
            return_object = {
                "dataset_id": dataset_id,
                "data_type_id": data_type,
                "model": model_id,
                "graph": graph_id,
                "explain_id": explain_id,
                "task": task,
                "graph_in": {
                    "feature":features_sparse,
                    "feature_value":features_sparse_value,
                    "senders":original_graph._indices()[1].tolist(),
                    "receivers":original_graph._indices()[0].tolist()
                },
                "graph_target":{
                    "node_features":labels.tolist(),
                },
                "graph_out":{
                    "node_features":preds.tolist(),
                    "output_vector":output_softmax.tolist(),
                },
                "graph_explaination":
                {
                    "type":  Explain_type
                },
                "graph_layout":graph_layout, 
                "message_passing":{
                    "senders":L._indices()[1].tolist(),
                    "receivers":L._indices()[0].tolist(),
                    "values":L._values().tolist()
                },
                "mask":mask,
                "graph_additional_info":graph_additional_info,
                "name":name
            }
            return return_object
        else:
            print("Not implemented task : ", task)
            return None
    else:
        print("Not supported data type : ", data_type)
        return None
CACHE_DIR = SERVER_ROOT+"/Cache/"
VERSION = "V1_3"
ENABLE_COMPRESSED = False
ENABLE_CACHE = True
ENABLE_FAST_CACHE = False
Fast_Cache = {}

    




def getCacheGraphBundleFileName(dataset_id):
    if ENABLE_COMPRESSED:
        filename = "cache_compressed_bundle_{}_{}.pkl".format(dataset_id, VERSION)
    else:
        filename = "cache_bundle_{}_{}.pkl".format(dataset_id, VERSION)
    return filename
def getCacheGraphBundleInfo(dataset_id):
    filename = getCacheGraphBundleFileName(dataset_id)
    if not os.path.isdir(CACHE_DIR):
        os.mkdir(CACHE_DIR)
    if os.path.isfile(CACHE_DIR+filename):
        with open(CACHE_DIR+filename, "rb") as f:
            graph_bundle_obj = pkl.load(f)
        return True, graph_bundle_obj
    else:
        return False, None
def saveCacheGraphBundleInfo(dataset_id, obj):
    filename = getCacheGraphBundleFileName(dataset_id)
    if not os.path.isdir(CACHE_DIR):
        os.mkdir(CACHE_DIR)
    with open(CACHE_DIR+filename, "wb") as f:
        pkl.dump(obj,f)
def getFastCacheGraphBundleInfo(dataset_id):
    if dataset_id in Fast_Cache:
        return True, Fast_Cache[dataset_id]
    else:
        return False, None
def getGraphBundleInfo(dataset_id):
    if dataset_id in dataset_keys:
        if ENABLE_FAST_CACHE:
            success_flag, cache_content = getFastCacheGraphBundleInfo(dataset_id)
            if success_flag:
                return cache_content
        if ENABLE_CACHE:
            success_flag, cache_content = getCacheGraphBundleInfo(dataset_id)
            if success_flag:
                return cache_content
        graph_bundle_info = graphs_list["graphs"][dataset_id]["bundle_info"]
        explain_id = 4
        graph_id = 1
        return_package = {}
        common_flag = False
        common_package = {}
        individual_package = {}
        for key in graph_bundle_info:
            model_id = graph_bundle_info[key]["model_id"]
            real_model_name = graph_bundle_info[key].get("real_model_name", DefaultNameMapping[key])
            graph_info = getGraphInfo(dataset_id, model_id, explain_id, graph_id)
            return_package[key] = graph_info
            if not common_flag:
                '''
                common_package = {
                    "dataset_id": graph_info["dataset_id"],
                    "data_type_id": graph_info["data_type_id"],
                    "graph": graph_info["graph"],
                    "explain_id": graph_info["explain_id"],
                    "task": graph_info["task"],
                    "graph_in": graph_info["graph_in"],
                    "graph_target":graph_info["graph_target"],
                    "graph_explaination":graph_info["graph_explaination"],
                    "graph_layout":graph_info["graph_layout"], 
                    "embedding":graph_info["embedding"],
                    "mask":graph_info["mask"],
                    "graph_additional_info":graph_info["graph_additional_info"],
                    "name":graph_info["name"]
                }'''
                common_package = {
                    "dataset_id": graph_info["dataset_id"],
                    "data_type_id": graph_info["data_type_id"],
                    "graph": graph_info["graph"],
                    "explain_id": graph_info["explain_id"],
                    "task": graph_info["task"],
                    "graph_in": graph_info["graph_in"],
                    "graph_target":graph_info["graph_target"],
                    "graph_explaination":graph_info["graph_explaination"],
                    "graph_layout":graph_info["graph_layout"], 
                    "mask":graph_info["mask"],
                    "graph_additional_info":graph_info["graph_additional_info"],
                    "name":graph_info["name"]
                }
                common_flag = True
            else:
                pass
            '''
            local_individual_package = {
                "model": graph_info["model"],
                "graph_out":graph_info["graph_out"],
                "message_passing":graph_info["message_passing"],
                "model_state_dict":graph_info["model_state_dict"],
            }
            '''
            
            local_individual_package = {
                "model": graph_info["model"],
                "graph_out":graph_info["graph_out"],
                "real_model_name": real_model_name
            }
            if key == "GCN":
                local_individual_package["message_passing"] = graph_info["message_passing"]
            
            individual_package[key] = local_individual_package
        return_package = {
            "common": common_package,
            "individual": individual_package
        }
        #if ENABLE_COMPRESSED:
        #    return_package = compress_data(return_package)
        if ENABLE_CACHE:
            saveCacheGraphBundleInfo(dataset_id, return_package)
        return return_package
        
    else:
        print("Not found dataset id {}".format(dataset_id))
        return None

    
def getCacheRulesFileName(dataset_id):
    if ENABLE_COMPRESSED:
        filename = "cache_compressed_rules_{}_{}.pkl".format(dataset_id, VERSION)
    else:
        filename = "cache_rules_{}_{}.pkl".format(dataset_id, VERSION)
    return filename
def getCacheRulesInfo(dataset_id):
    filename = getCacheRulesFileName(dataset_id)
    if not os.path.isdir(CACHE_DIR):
        os.mkdir(CACHE_DIR)
    if os.path.isfile(CACHE_DIR+filename):
        with open(CACHE_DIR+filename, "rb") as f:
            rule_obj = pkl.load(f)
        return True, rule_obj
    else:
        return False, None
def saveCacheRulesInfo(dataset_id, obj):
    filename = getCacheRulesFileName(dataset_id)
    if not os.path.isdir(CACHE_DIR):
        os.mkdir(CACHE_DIR)
    with open(CACHE_DIR+filename, "wb") as f:
        pkl.dump(obj,f)    

def getRulesInfo(dataset_id):
    if dataset_id in dataset_keys:
        if ENABLE_CACHE:
            success_flag, cache_content = getCacheRulesInfo(dataset_id)
            if success_flag:
                return cache_content
        graph_obj = getGraphBundleInfo(dataset_id)
        return_package = extract_rule(graph_obj)
        if ENABLE_CACHE:
            saveCacheRulesInfo(dataset_id, return_package)
        return return_package
        
    else:
        print("Not found dataset id {}".format(dataset_id))
        return None
def initFastCache():
    print("initialize fast cache....")
    print("dataset\tduration time")
    dataset_list = GetDatasetsList()
    for data_package in dataset_list:
        data_id = data_package["id"]
        if data_id in Fast_Cache:
            continue
        start_time = time.time()
        graph_obj = getGraphBundleInfo(data_id)
        
        if graph_obj:
            Fast_Cache[data_id] = graph_obj
            print(graph_obj["common"]["name"], time.time()-start_time)
if ENABLE_FAST_CACHE:
    initFastCache()
    
    