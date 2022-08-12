import json
import time
from pathlib import Path
import argparse
import numpy as np
from sklearn.metrics import f1_score
import dgl
from dgl.nn import GraphConv
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from captum.attr import IntegratedGradients
from functools import partial
from torch_geometric.data import Data
from dataloader import load_citation, load_new_data, load_new_data_2, load_citation_v2, load_citation_v3
from models import *
from explain_utils import *


def accuracy(output, labels):
    preds = output.max(1)[1].type_as(labels)
    correct = preds.eq(labels).double()
    correct = correct.sum()
    return correct / len(labels)

def set_seed(seed, cuda=True):
    np.random.seed(seed)
    torch.manual_seed(seed)
    if cuda: torch.cuda.manual_seed(seed)

def load_json(path):
    with open(path, "r") as f:
        obj = json.load(f)
    return obj

def load_cora_ml_data(dataf, config):
    ## dataf = root_path+'/data/'
    ## config = models_list[25]["graph_config"]

    data_name = "cora_ml"
    ## Cora / Citeseer / PubMed / Cora_ML
    if config is None:
        norm_type = 'SymNorm_tildeA'
        identity_features = False
    else:
        norm_type = config["norm_type"]
        identity_features = config["identity_features"]
        load_version = config.get("load_version","v1")
    graph, L, features, labels, idx_train,idx_val, idx_test, graph_additional_package, data_package = load_new_data_2(dataf,data_name,cuda=False,norm_type=norm_type,identity_features=identity_features)
    graph_additional_info = {}
    if not identity_features:
        idx_to_attr = graph_additional_package.get("idx_to_attr")
        if idx_to_attr:
            graph_additional_info["idx_to_attr"] = idx_to_attr
    idx_to_class = graph_additional_package.get("idx_to_class")
    if idx_to_class:
        graph_additional_info["idx_to_class"] = idx_to_class
    #idx_to_node = graph_additional_package.get("idx_to_node")
    #if idx_to_node:
    #    graph_additional_info["idx_to_node"] = idx_to_node
    num_classes = int(labels.max()) + 1
    with open(dataf+"/cora_ml_node_title_2.json", "r") as f:
        idx_to_node_title = json.load(f)
    graph_additional_info["idx_to_node_title"] = idx_to_node_title
    graph_additional_info["idx_to_node_title"]["2010"] = "Equivalence of Linear Boltzmann Chains and Hidden Markov Models sequence"  ## Post Fix
    return data_package, graph, labels, num_classes, features, idx_train, graph_additional_info


def convert_data_package_to_dgl_graph(data_package):
    dgl_graph = dgl.graph((data_package["edge_index"][0], data_package["edge_index"][1]))
    dgl_graph.ndata["train_mask"] = data_package["train_mask"]
    dgl_graph.ndata["val_mask"] = data_package["val_mask"]
    dgl_graph.ndata["test_mask"] = data_package["test_mask"]
    return dgl_graph


def GetModel(root_path, models_list, model_id):
    model_path = models_list[model_id]["path"]
    model_type = models_list[model_id]["type"]
    experiment = Path(root_path+model_path)
    
    if model_type == "GCN":
        model_config = models_list[model_id]["model_config"]
        net = load_GCN(experiment, model_config["args"], model_config["kwargs"])
        net_package = {
            "net":net
        }
    elif model_type == "GAT":
        model_config = models_list[model_id]["model_config"]
        net = load_GAT(experiment, model_config["args"], model_config["kwargs"])
        net_package = {
            "net":net
        }
    else:
        return None
    return net_package


def infer_data(models_list, model_id, root_path, data_package, labels):
    net = GetModel(root_path, models_list, model_id)['net']
    net.eval()
    output = net(data_package)
    output_softmax = F.softmax(output, dim=1)
    preds = output.max(1)[1].type_as(labels)
    print((preds == labels).sum().item() / len(labels))
    return preds, output_softmax

def infer_pipeline(models_list, model_id, root_path, dataf, data_name):
    config = models_list[model_id]["graph_config"]
    ## Cora / Citeseer / PubMed / Cora_ML
    if config is None:
        norm_type = 'SymNorm_tildeA'
        identity_features = False
    else:
        norm_type = config["norm_type"]
        identity_features = config["identity_features"]
        load_version = config.get("load_version","v1")
    graph, L, features, labels, idx_train,idx_val, idx_test, graph_additional_package, data_package = load_new_data_2(dataf,data_name,cuda=False,norm_type=norm_type,identity_features=identity_features)
    preds, output = infer_data(models_list, model_id, root_path, data_package, labels)
    return preds, output



def extract_subgraph(g, node):
    seed_nodes = [node]
    sg = dgl.in_subgraph(g, seed_nodes)
    src, dst = sg.edges()
    seed_nodes = torch.cat([src, dst]).unique()
    sg = dgl.in_subgraph(g, seed_nodes, relabel_nodes=True)
    return sg
def wrap_up_func(model, data_package, node_id):
    def forward_replace(h):
        data_package["x"] = h.squeeze(0)
        output = model(data_package)
        return_output = output[node_id].unsqueeze(0)
        return return_output
    return forward_replace
def calculate_subgraph(writer, net, data_package, node_id, predicted_classes, graph_name, dgl_graph):
    start_time = time.time()
    h = data_package["x"].clone().requires_grad_(True).unsqueeze(0)
    ig = IntegratedGradients(wrap_up_func(net, data_package, node_id))
    # Attribute the predictions for node class 0 to the input features
    feat_attr = ig.attribute(h, target=predicted_classes[node_id], internal_batch_size=1, n_steps=50)
    print("Attribution Time: ", time.time() - start_time)
    node_weights = feat_attr[0].abs().sum(dim=1)
    node_weights = (node_weights - node_weights.min()) / node_weights.max()
    dgl_graph.ndata['weight'] = node_weights
    dgl_graph.edata['weight'] = torch.ones(dgl_graph.num_edges(),)
    first_subgraph = extract_subgraph(dgl_graph, node_id)
    writer.add_subgraph(graph_name=graph_name, subgraph_name='IntegratedGradients', node_id=node_id,
                                      subgraph_nids=first_subgraph.ndata[dgl.NID],
                                      subgraph_eids=first_subgraph.edata[dgl.EID],
                                      subgraph_nweights=first_subgraph.ndata['weight'],
                                      subgraph_eweights=first_subgraph.edata['weight'])
    writer.add_feature_ranking(graph_name=graph_name, feature_ranking_name='IntegratedGradients', node_id=node_id,
                                      feature_ranking_values=feat_attr[0][node_id])
    
class WrapUpGATModel(nn.Module):
    def __init__(self, net):
        super(WrapUpGATModel,self).__init__()
        self.net = net
    def forward(self, x, adj):
        edge_index, edge_attr = dense_to_sparse(adj)
        new_package = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
        return self.net(new_package)
    
def filter_adj(adj,threshold=0.8):
    filt_adj = adj.copy()
    filt_adj[adj<threshold] = 0
    return filt_adj
def constructNewNeighborDict(node_list, neighbor_dict):
    new_neighbor_dict = {}
    node_ids = []
    for node_id in node_list:
        new_neighbor_dict[node_id] = neighbor_dict[node_id]
        node_ids.append(neighbor_dict[node_id])
    return new_neighbor_dict, node_ids
def GNNExplainer_explain(dgl_graph, explainer, prog_args, explain_node_idx, writer, graph_name, features, percent=25):
    masked_adj = explainer.explain_nodes_gnn_stats(
        [explain_node_idx], prog_args
    )
    masked_adj_0 = masked_adj[0][0]
    masked_feature_0 = masked_adj[0][1]
    clone_features = features[explain_node_idx].clone()
    clone_features[clone_features>0]=1
    feature_importance = torch.Tensor(masked_feature_0)*clone_features
    thresh = np.percentile(np.unique(masked_adj_0), percent)
    f = filter_adj(masked_adj_0, thresh)
    G = nx.from_numpy_array(f)
    G.remove_nodes_from(list(nx.isolates(G)))
    node_idx_new, sub_adj, sub_feat, sub_label, neighbors = explainer.extract_neighborhood(explain_node_idx)
    neighbors_dict = {}
    for i in range(len(neighbors)):
        neighbors_dict[i] = neighbors[i]
    real_label, node_ids = constructNewNeighborDict(G.nodes,neighbors_dict)
    edge_ids = []
    for (src, tgt) in G.edges():
        edge_id = dgl_graph.edge_ids(real_label[src], real_label[tgt])
        edge_ids.append(edge_id)
    writer.add_subgraph(graph_name=graph_name, subgraph_name='GNNExplainer', node_id=explain_node_idx,
                                      subgraph_nids=torch.LongTensor(node_ids),
                                      subgraph_eids=torch.LongTensor(edge_ids))
    writer.add_feature_ranking(graph_name=graph_name, feature_ranking_name='GNNExplainer', node_id=explain_node_idx,
                                      feature_ranking_values=feature_importance)  
    
def initialize_cora_ml_explainer(net, data_package, labels, graph, features, idx_train):
    output = net(data_package)
    #loss_test = F.nll_loss(output[idx_test],labels[idx_test])
    #acc_test = accuracy(output[idx_test],labels[idx_test])
    #print(loss_test.item(), acc_test.item())
    
    original_graph = graph
    model = net
    # Load a configuration
    prog_args = arg_parse()
    cg_dict = {}
    cg_dict["adj"] = original_graph.to_dense().unsqueeze(0).detach().numpy()
    cg_dict["feat"] = features.unsqueeze(0).detach().numpy()
    cg_dict["label"] = labels.unsqueeze(0).detach().numpy()
    cg_dict["train_idx"] = idx_train.unsqueeze(0).detach().numpy()
    cg_dict["pred"] = output.unsqueeze(0).detach().numpy()
    print(cg_dict["adj"].shape, cg_dict["feat"].shape, cg_dict["label"].shape, cg_dict["train_idx"].shape, cg_dict["pred"].shape)

    # Create explainer
    explainer = explain.Explainer(
        model=WrapUpGATModel(model),
        adj=cg_dict["adj"],
        feat=cg_dict["feat"],
        label=cg_dict["label"],
        pred=cg_dict["pred"],
        train_idx=cg_dict["train_idx"],
        args=prog_args,
        writer=None,
        print_training=False,
        graph_mode=False,
        graph_idx=0,
    )
    print(prog_args)
    return prog_args, explainer

def load_photo_data(dataf, config):
    # dataf = root_path+'/data/'
    # config = models_list[20]["graph_config"]

    data_name = "Photo"
    ## Cora / Citeseer / PubMed / Cora_ML
    if config is None:
        norm_type = 'SymNorm_tildeA'
        identity_features = False
    else:
        norm_type = config["norm_type"]
        identity_features = config["identity_features"]
        load_version = config.get("load_version","v1")
    graph, L, features, labels, idx_train,idx_val, idx_test, data_package_2 = load_citation_v3(dataf,data_name,cuda=False, norm_type=norm_type,identity_features=identity_features)
    graph_additional_info = {}
    graph_additional_info["idx_to_class"] = ['Film Photography','Digital Cameras','Binoculars & Scopes','Lenses'
    , 'Tripods & Monopods', 'Video Surveillance' ,'Lighting & Studio', 'Flashes']
    num_classes = int(labels.max()) + 1
    return data_package_2, graph, labels, num_classes, features, L, graph_additional_info


def infer_data_2(models_list, model_id, root_path, features, L, labels):
    net = GetModel(root_path, models_list, model_id)['net']
    net.eval()
    output, hidden_vector = net(features, L)
    output_softmax = F.softmax(output, dim=1)
    preds = output.max(1)[1].type_as(labels)
    print((preds == labels).sum().item() / len(labels))
    return preds, output_softmax


def infer_pipeline_2(models_list, model_id, root_path, dataf, data_name):
    config = models_list[model_id]["graph_config"]
    ## Cora / Citeseer / PubMed / Cora_ML
    if config is None:
        norm_type = 'SymNorm_tildeA'
        identity_features = False
    else:
        norm_type = config["norm_type"]
        identity_features = config["identity_features"]
        load_version = config.get("load_version","v1")
    graph, L, features, labels, idx_train,idx_val, idx_test, data_package = load_citation_v3(dataf,data_name,cuda=False,norm_type=norm_type,identity_features=identity_features)
    preds, output = infer_data_2(models_list, model_id, root_path, features, L, labels)
    return preds, output


def extract_subgraph(g, node):
    seed_nodes = [node]
    sg = dgl.in_subgraph(g, seed_nodes)
    src, dst = sg.edges()
    seed_nodes = torch.cat([src, dst]).unique()
    sg = dgl.in_subgraph(g, seed_nodes, relabel_nodes=True)
    return sg
#model = GCN(h.shape[1], num_classes)
def wrap_up_func_2(model, L, node_id):
    def forward_replace(h):
        h = h.squeeze(0)
        output, hidden_vector = model(h, L)
        return_output = output[node_id].unsqueeze(0)
        return return_output
    return forward_replace
def calculate_subgraph_2(writer, net, data_package, features, L, node_id, predicted_classes, graph_name, dgl_graph):
    start_time = time.time()
    h = data_package["x"].clone().requires_grad_(True).unsqueeze(0)
    ig = IntegratedGradients(wrap_up_func_2(net, L, node_id))
    # Attribute the predictions for node class 0 to the input features
    feat_attr = ig.attribute(h, target=predicted_classes[node_id], internal_batch_size=1, n_steps=50)
    print("Attribution Time: ", time.time() - start_time)
    node_weights = feat_attr[0].abs().sum(dim=1)
    node_weights = (node_weights - node_weights.min()) / node_weights.max()
    dgl_graph.ndata['weight'] = node_weights
    dgl_graph.edata['weight'] = torch.ones(dgl_graph.num_edges(),)
    first_subgraph = extract_subgraph(dgl_graph, node_id)
    writer.add_subgraph(graph_name=graph_name, subgraph_name='IntegratedGradients', node_id=node_id,
                                      subgraph_nids=first_subgraph.ndata[dgl.NID],
                                      subgraph_eids=first_subgraph.edata[dgl.EID],
                                      subgraph_nweights=first_subgraph.ndata['weight'],
                                      subgraph_eweights=first_subgraph.edata['weight'])
    writer.add_feature_ranking(graph_name=graph_name, feature_ranking_name='IntegratedGradients', node_id=node_id,
                                      feature_ranking_values=feat_attr[0][node_id])
    
class WrapUpGCNModel(nn.Module):
    def __init__(self, net):
        super(WrapUpGCNModel,self).__init__()
        self.net = net
    def forward(self, x, adj):
        output, hidden_vector = self.net(x, adj)
        return output
    
def initialize_photo_explainer(net, data_package, labels, graph, features, L, idx_train):
    output, hidden_vector = net(features, L)
    #loss_test = F.nll_loss(output[idx_test],labels[idx_test])
    #acc_test = accuracy(output[idx_test],labels[idx_test])
    #print(loss_test.item(), acc_test.item())
    
    original_graph = graph
    model = net
    # Load a configuration
    prog_args = arg_parse()
    cg_dict = {}
    cg_dict["adj"] = original_graph.to_dense().unsqueeze(0).detach().numpy()
    cg_dict["feat"] = features.unsqueeze(0).detach().numpy()
    cg_dict["label"] = labels.unsqueeze(0).detach().numpy()
    cg_dict["train_idx"] = idx_train.unsqueeze(0).detach().numpy()
    cg_dict["pred"] = output.unsqueeze(0).detach().numpy()
    print(cg_dict["adj"].shape, cg_dict["feat"].shape, cg_dict["label"].shape, cg_dict["train_idx"].shape, cg_dict["pred"].shape)

    # Create explainer
    explainer = explain.Explainer(
        model=WrapUpGCNModel(model),
        adj=cg_dict["adj"],
        feat=cg_dict["feat"],
        label=cg_dict["label"],
        pred=cg_dict["pred"],
        train_idx=cg_dict["train_idx"],
        args=prog_args,
        writer=None,
        print_training=False,
        graph_mode=False,
        graph_idx=0,
    )
    print(prog_args)
    return prog_args, explainer