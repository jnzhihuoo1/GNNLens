from __init__ import *
import pickle as pkl
import time
import os
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
        }   
    }
}

dataset_keys = set(graphs_list["graphs"].keys())

def GetDatasetsList():
    datasets_released_list = [ { "id": key, "name": graphs_list["graphs"][key]["name"]} for key in graphs_list["graphs"].keys()]   
    return datasets_released_list
CACHE_DIR = SERVER_ROOT+"/Cache/"
VERSION = "V1_1"
ENABLE_COMPRESSED = False
ENABLE_CACHE = True
ENABLE_FAST_CACHE = True
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
        
        print("Not found cache dataset, id is {}".format(dataset_id))
        return None
        
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