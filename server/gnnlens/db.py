from gnnlens.__init__ import *
import pickle as pkl
import time
import os
import json
import os
from pathlib import Path

VERSION_ID = "V1_2"
def read_json(file_name):
    with open(file_name, "r") as f:
        obj = json.load(f)
    return obj

def getDatasetsList(logdir):
    filename = Path(logdir) / 'datasetlist_{}.json'.format(VERSION_ID)
    if not os.path.isfile(filename):
        print("{} is not existed".format(filename))
        return None
    else:
        datasets_released_list = read_json(filename)
        return datasets_released_list

def getGraphBundleInfo(logdir, dataset_id):
    filename = Path(logdir) / 'cache_bundle_{}_{}.json'.format(dataset_id, VERSION_ID)
    if not os.path.isfile(filename):
        print("{} is not existed".format(filename))
        return None
    else:
        graph_pkg = read_json(filename)
        return graph_pkg    

