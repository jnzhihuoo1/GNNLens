from __init__ import *
import math
from collections import OrderedDict

import torch
from torch import nn

import pickle as pkl

from pathlib import Path
from typing import Tuple

import pandas as pd
from pandas.api.types import CategoricalDtype

from dataloader import load_citation, load_new_data, load_citation_v2, load_citation_v3
from metric import getSPDJson, getKFSJson

dataf = SERVER_ROOT+'/data/'


def GetGraph(dataset_id, graph_no, config=None):
    
    if dataset_id in set([4,5,6,7,8,9,10, 11, 12, 13]):
        if graph_no == 1:
            ## Cora / Citeseer / PubMed / Cora_ML
            if config is None:
                norm_type = 'SymNorm_tildeA'
                identity_features = False
            else:
                norm_type = config["norm_type"]
                identity_features = config["identity_features"]
                load_version = config.get("load_version","v1")
            if dataset_id == 4:
                data_name = "cora"
            elif dataset_id == 5:
                data_name = "citeseer"
            elif dataset_id == 6:
                data_name = "pubmed"
            elif dataset_id == 7 or dataset_id == 13:
                data_name = "cora_ml"
            elif dataset_id == 8:
                data_name = "polblogs"
            elif dataset_id == 9:
                data_name = "Photo"
            elif dataset_id == 10 or dataset_id == 11 or dataset_id == 12:
                data_name = "cora"
                load_data_name = "Cora"
            data_package = None
            if dataset_id in set([4,5,6]):
                graph, L, features, labels, idx_train,idx_val, idx_test = load_citation(dataf,data_name,cuda=False,                                  norm_type=norm_type,identity_features=identity_features)
                graph_additional_info = {}
            elif dataset_id in set([7,8,13]):
                graph, L, features, labels, idx_train,idx_val, idx_test, graph_additional_package, data_package = load_new_data(dataf,data_name,cuda=False,norm_type=norm_type,identity_features=identity_features)
                graph_additional_info = {}
                if not identity_features:
                    idx_to_attr = graph_additional_package.get("idx_to_attr")
                    if idx_to_attr:
                        graph_additional_info["idx_to_attr"] = idx_to_attr
                idx_to_class = graph_additional_package.get("idx_to_class")
                if idx_to_class:
                    graph_additional_info["idx_to_class"] = idx_to_class
            elif dataset_id in set([9]):
                graph, L, features, labels, idx_train,idx_val, idx_test = load_citation_v2(dataf,data_name,cuda=False,                                  norm_type=norm_type,identity_features=identity_features)
                graph_additional_info = {}
                if dataset_id == 9:
                    graph_additional_info["idx_to_class"] = ['Film Photography','Digital Cameras','Binoculars & Scopes','Lenses'
, 'Tripods & Monopods', 'Video Surveillance' ,'Lighting & Studio', 'Flashes']
            elif dataset_id in set([10, 11, 12]):
                graph, L, features, labels, idx_train,idx_val, idx_test, data_package = load_citation_v3(dataf,load_data_name,cuda=False,                                  norm_type=norm_type,identity_features=identity_features)
                graph_additional_info = {}
            num_class = labels.max().item()+1
            graph_additional_info["num_class"] = num_class
            with open(dataf+"{}/{}_layout.pkt".format(data_name,data_name),"rb") as f:
                Pos = pkl.load(f)
            ### Embedding only for model 4 gcn_cora
            with open(dataf+"{}/{}_tsne_input.pkt".format(data_name,data_name),"rb") as f:
                InputPos = pkl.load(f).tolist()
            with open(dataf+"{}/{}_tsne_hidden.pkt".format(data_name,data_name),"rb") as f:
                HiddenPos = pkl.load(f).tolist()
            with open(dataf+"{}/{}_tsne_output.pkt".format(data_name,data_name),"rb") as f:
                OutputPos = pkl.load(f).tolist()
            #print(type(InputPos))
            #print(type(HiddenPos))
            #print(type(OutputPos))
            SPD = getSPDJson(graph, idx_train, labels, dataf, data_name)
            KFS = getKFSJson(features, idx_train, labels, dataf, data_name, 5)
            graph_additional_info["SPD"] = SPD
            graph_additional_info["KFS"] = KFS
            name = data_name
            
        else:
            print("Not Found Graphs")
            return None
        whole_graph = {
            "dataset_id": dataset_id,
            "data_package":data_package,
            "graph_layout":Pos,
            "graph_additional_info": graph_additional_info,
            "graph": graph,
            "L" : L,
            "features" : features,
            "labels": labels,
            "embedding": {
                "input":InputPos,
                "hidden":HiddenPos,
                "output":OutputPos
            },
            "mask":{
                "train":idx_train.tolist(),
                "test":idx_test.tolist(),
                "valid":idx_val.tolist()
            },
            "name" : name,
            "type" : 2
        }
        return whole_graph
    else:
        print("Not Found Datasets")
        return None

    
    