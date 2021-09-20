import math
from collections import OrderedDict

import torch
from torch import nn
import torch.nn.functional as F
import torch_geometric as pyg
import torchgraphs as tg
import relevance
import guidedbackprop as guidedbp

import yaml
import pandas as pd
from pathlib import Path
from munch import munchify
from collections import OrderedDict
from layer import GCN_layer

class GCN_hook(nn.Module):
    def __init__(self, num_feature,num_hidden,num_class,dropout,bias=True):
        super(GCN_hook,self).__init__()

        self.gc1 = GCN_layer(num_feature, num_hidden)
        self.gc2 = GCN_layer(num_hidden, num_class)
        self.dropout = dropout

    def forward(self, x, adj):
        x = F.relu(self.gc1(x, adj))
        x1 = F.dropout(x, self.dropout, training=self.training)
        x2 = self.gc2(x1, adj)
        return F.log_softmax(x2, dim=1), x1
    
class GCN(nn.Module):
    def __init__(self, num_feature,num_hidden,num_class,dropout,bias=True):
        super(GCN,self).__init__()

        self.gc1 = GCN_layer(num_feature, num_hidden)
        self.gc2 = GCN_layer(num_hidden, num_class)
        self.dropout = dropout

    def forward(self, x, adj):
        x = F.relu(self.gc1(x, adj))
        x = F.dropout(x, self.dropout, training=self.training)
        x = self.gc2(x, adj)
        return F.log_softmax(x, dim=1)
    
class tgGAT(torch.nn.Module):
    def __init__(self, input_dim, feature_dim, hidden_dim, output_dim,heads, dropout=0.6, **kwargs):
        super(tgGAT, self).__init__()
        self.heads = heads
        self.dropout = dropout
        self.attentions = [pyg.nn.GATConv(input_dim, hidden_dim, dropout=dropout, concat=True) for _ in range(8)]
        for i, attention in enumerate(self.attentions):
            self.add_module('attention_{}'.format(i), attention)
        self.conv_first = pyg.nn.GATConv(input_dim, hidden_dim,8,dropout=0.6,concat=True, negative_slope=0.2, bias=True)
        self.conv_out = pyg.nn.GATConv(8*hidden_dim, output_dim,heads,concat=False,dropout=0.6,negative_slope=0.2, bias=True)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = F.dropout(x, training=self.training)
        x = torch.cat([att(x, edge_index) for att in self.attentions], dim=1)
        #x = self.conv_first(x, edge_index)
        x = F.dropout(x, training=self.training)
        x = self.conv_out(x, edge_index)
        
        x = F.elu(x)
        x = F.log_softmax(x, dim=1)
        return x    
    
class InfectionGN(nn.Module):
    def __init__(self, aggregation, bias):
        super().__init__()
        self.encoder = nn.Sequential(OrderedDict({
            'edge': tg.EdgeLinear(4, edge_features=2, bias=bias),
            'edge_relu': tg.EdgeReLU(),
            'node': tg.NodeLinear(8, node_features=4, bias=bias),
            'node_relu': tg.NodeReLU(),
        }))
        self.hidden = nn.Sequential(OrderedDict({
            'edge': tg.EdgeLinear(8, edge_features=4, sender_features=8, bias=bias),
            'edge_relu': tg.EdgeReLU(),
            'node': tg.NodeLinear(8, node_features=8, incoming_features=8, aggregation=aggregation, bias=bias),
            'node_relu': tg.NodeReLU()
        }))
        self.readout_nodes = tg.NodeLinear(1, node_features=8, bias=True)
        self.readout_globals = tg.GlobalLinear(1, node_features=8, aggregation='sum', bias=bias)

    def forward(self, graphs):
        graphs = self.encoder(graphs)
        graphs = self.hidden(graphs)
        nodes = self.readout_nodes(graphs).node_features
        globals = self.readout_globals(graphs).global_features

        return graphs.evolve(
            node_features=nodes,
            num_edges=0,
            num_edges_by_graph=None,
            edge_features=None,
            global_features=globals,
            senders=None,
            receivers=None
        )


class InfectionGNRelevance(InfectionGN):
    def __init__(self, aggregation, bias):
        super(InfectionGN, self).__init__()
        self.encoder = torch.nn.Sequential(OrderedDict({
            'edge': relevance.EdgeLinearRelevance(4, edge_features=2, bias=bias),
            'edge_relu': relevance.EdgeReLURelevance(),
            'node': relevance.NodeLinearRelevance(8, node_features=4, bias=bias),
            'node_relu': relevance.NodeReLURelevance(),
        }))
        self.hidden = torch.nn.Sequential(OrderedDict({
            'edge': relevance.EdgeLinearRelevance(8, edge_features=4, sender_features=8, bias=bias),
            'edge_relu': relevance.EdgeReLURelevance(),
            'node': relevance.NodeLinearRelevance(8, node_features=8, incoming_features=8, aggregation=aggregation, bias=bias),
            'node_relu': relevance.NodeReLURelevance()
        }))
        self.readout_nodes = relevance.NodeLinearRelevance(1, node_features=8, bias=True)
        self.readout_globals = relevance.GlobalLinearRelevance(1, node_features=8, aggregation='sum', bias=bias)

class InfectionGNGuidedBP(InfectionGN):
    def __init__(self, aggregation, bias):
        super(InfectionGN, self).__init__()
        self.encoder = torch.nn.Sequential(OrderedDict({
            'edge': guidedbp.EdgeLinearGuidedBP(4, edge_features=2, bias=bias),
            'edge_relu': guidedbp.EdgeReLUGuidedBP(),
            'node': guidedbp.NodeLinearGuidedBP(8, node_features=4, bias=bias),
            'node_relu': guidedbp.NodeReLUGuidedBP(),
        }))
        self.hidden = torch.nn.Sequential(OrderedDict({
            'edge': guidedbp.EdgeLinearGuidedBP(8, edge_features=4, sender_features=8, bias=bias),
            'edge_relu': guidedbp.EdgeReLUGuidedBP(),
            'node': guidedbp.NodeLinearGuidedBP(8, node_features=8, incoming_features=8, aggregation=aggregation, bias=bias),
            'node_relu': guidedbp.NodeReLUGuidedBP()
        }))
        self.readout_nodes = guidedbp.NodeLinearGuidedBP(1, node_features=8, bias=True)
        self.readout_globals = guidedbp.GlobalLinearGuidedBP(1, node_features=8, aggregation='sum', bias=bias)

        

class SolubilityGN(nn.Module):
    def __init__(self, num_layers, hidden_bias, hidden_node, dropout, aggregation):
        super().__init__()

        hidden_edge = hidden_node // 4
        hidden_global = hidden_node // 8
        
        self.encoder = nn.Sequential(OrderedDict({
            'edge': tg.EdgeLinear(hidden_edge, edge_features=6),
            'edge_relu': tg.EdgeReLU(),
            'node': tg.NodeLinear(hidden_node, node_features=47),
            'node_relu': tg.NodeReLU(),
            'global': tg.GlobalLinear(hidden_global, node_features=hidden_node,
                                      edge_features=hidden_edge, aggregation=aggregation),
            'global_relu': tg.GlobalReLU(),
        }))
        if dropout:
            self.hidden = nn.Sequential(OrderedDict({
                f'hidden_{i}': nn.Sequential(OrderedDict({
                    'edge': tg.EdgeLinear(hidden_edge, edge_features=hidden_edge,
                                          sender_features=hidden_node, bias=hidden_bias),
                    'edge_relu': tg.EdgeReLU(),
                    'edge_dropout': tg.EdgeDroput(),
                    'node': tg.NodeLinear(hidden_node, node_features=hidden_node, incoming_features=hidden_edge,
                                          aggregation=aggregation, bias=hidden_bias),
                    'node_relu': tg.NodeReLU(),
                    'node_dropout': tg.EdgeDroput(),
                    'global': tg.GlobalLinear(hidden_global, node_features=hidden_node, edge_features=hidden_edge,
                                              global_features=hidden_global, aggregation=aggregation, bias=hidden_bias),
                    'global_relu': tg.GlobalReLU(),
                    'global_dropout': tg.EdgeDroput(),
                }))
                for i in range(num_layers)
            }))
        else:
            self.hidden = nn.Sequential(OrderedDict({
                f'hidden_{i}': nn.Sequential(OrderedDict({
                    'edge': tg.EdgeLinear(hidden_edge, edge_features=hidden_edge,
                                          sender_features=hidden_node, bias=hidden_bias),
                    'edge_relu': tg.EdgeReLU(),
                    'node': tg.NodeLinear(hidden_node, node_features=hidden_node, incoming_features=hidden_edge,
                                          aggregation=aggregation, bias=hidden_bias),
                    'node_relu': tg.NodeReLU(),
                    'global': tg.GlobalLinear(hidden_global, node_features=hidden_node, edge_features=hidden_edge,
                                              global_features=hidden_global, aggregation=aggregation, bias=hidden_bias),
                    'global_relu': tg.GlobalReLU(),
                }))
                for i in range(num_layers)
            }))
        self.readout_globals = tg.GlobalLinear(1, global_features=hidden_global, bias=True)

    def forward(self, graphs):
        graphs = self.encoder(graphs)
        graphs = self.hidden(graphs)
        globals = self.readout_globals(graphs).global_features

        return graphs.evolve(
            num_nodes=0,
            node_features=None,
            num_nodes_by_graph=None,
            num_edges=0,
            num_edges_by_graph=None,
            edge_features=None,
            global_features=globals,
            senders=None,
            receivers=None
        )

class SolubilityRelevance(SolubilityGN):
    def __init__(self, num_layers, hidden_bias, hidden_node, dropout, aggregation):
        super(SolubilityGN, self).__init__()

        hidden_edge = hidden_node // 4
        hidden_global = hidden_node // 8
        
        self.encoder = torch.nn.Sequential(OrderedDict({
            'edge': relevance.EdgeLinearRelevance(hidden_edge, edge_features=6),
            'edge_relu': relevance.EdgeReLURelevance(),
            'node': relevance.NodeLinearRelevance(hidden_node, node_features=47),
            'node_relu': relevance.NodeReLURelevance(),
            'global': relevance.GlobalLinearRelevance(hidden_global, node_features=hidden_node,
                                      edge_features=hidden_edge, aggregation=aggregation),
            'global_relu': relevance.GlobalReLURelevance(),
        }))
        if dropout:
            self.hidden = torch.nn.Sequential(OrderedDict({
                f'hidden_{i}': torch.nn.Sequential(OrderedDict({
                    'edge': relevance.EdgeLinearRelevance(hidden_edge, edge_features=hidden_edge,
                                          sender_features=hidden_node, bias=hidden_bias),
                    'edge_relu': relevance.EdgeReLURelevance(),
                    'edge_dropout': tg.EdgeDroput(),
                    'node': relevance.NodeLinearRelevance(hidden_node, node_features=hidden_node, incoming_features=hidden_edge,
                                          aggregation=aggregation, bias=hidden_bias),
                    'node_relu': relevance.NodeReLURelevance(),
                    'node_dropout': tg.EdgeDroput(),
                    'global': relevance.GlobalLinearRelevance(hidden_global, node_features=hidden_node, edge_features=hidden_edge,
                                              global_features=hidden_global, aggregation=aggregation, bias=hidden_bias),
                    'global_relu': relevance.GlobalReLURelevance(),
                    'global_dropout': tg.EdgeDroput(),
                }))
                for i in range(num_layers)
            }))
        else:
            self.hidden = torch.nn.Sequential(OrderedDict({
                f'hidden_{i}': torch.nn.Sequential(OrderedDict({
                    'edge': relevance.EdgeLinearRelevance(hidden_edge, edge_features=hidden_edge,
                                          sender_features=hidden_node, bias=hidden_bias),
                    'edge_relu': relevance.EdgeReLURelevance(),
                    'node': relevance.NodeLinearRelevance(hidden_node, node_features=hidden_node, incoming_features=hidden_edge,
                                          aggregation=aggregation, bias=hidden_bias),
                    'node_relu': relevance.NodeReLURelevance(),
                    'global': relevance.GlobalLinearRelevance(hidden_global, node_features=hidden_node, edge_features=hidden_edge,
                                              global_features=hidden_global, aggregation=aggregation, bias=hidden_bias),
                    'global_relu': relevance.GlobalReLURelevance(),
                }))
                for i in range(num_layers)
            }))
        self.readout_globals = relevance.GlobalLinearRelevance(1, global_features=hidden_global, bias=True)
        
        
        
def load_infection_nets(experiment, default_aggregation = "max", default_bias = False):    
    with experiment.joinpath('experiment.latest.yaml').open('r') as f:
        model = munchify(yaml.safe_load(f)['model'])

    if 'aggregation' not in model.kwargs:
        model.kwargs.aggregation=default_aggregation
    if 'bias' not in model.kwargs:
        model.kwargs.bias=default_bias        

    net = InfectionGN(*model.args, **model.kwargs)
    net.load_state_dict(torch.load(experiment / 'model.latest.pt', map_location='cpu'))

    net_gp = InfectionGNGuidedBP(*model.args, **model.kwargs)
    net_gp.load_state_dict(torch.load(experiment / 'model.latest.pt', map_location='cpu'))
    
    net_lrp = InfectionGNRelevance(*model.args, **model.kwargs)
    net_lrp.load_state_dict(torch.load(experiment / 'model.latest.pt', map_location='cpu'))

    return net, net_gp, net_lrp

def load_solubility_nets(experiment, default_aggregation = "mean", default_bias = False):    
    with experiment.joinpath('experiment.latest.yaml').open('r') as f:
        model = munchify(yaml.safe_load(f)['model'])

    if 'aggregation' not in model.kwargs:
        model.kwargs.aggregation=default_aggregation
      

    net = SolubilityGN(*model.args, **model.kwargs)
    net.load_state_dict(torch.load(experiment / 'model.latest.pt', map_location='cpu'))
    net.eval()
    #net_gp = InfectionGNGuidedBP(*model.args, **model.kwargs)
    #net_gp.load_state_dict(torch.load(experiment / 'model.latest.pt', map_location='cpu'))
    
    net_lrp = SolubilityRelevance(*model.args, **model.kwargs)
    net_lrp.load_state_dict(torch.load(experiment / 'model.latest.pt', map_location='cpu'))
    net_lrp.eval()
    return net, None, net_lrp
def load_GCN(model_path,args=[1433,16,7,0.5],kwargs={'bias':True}):
    #args = [1433,16,7,0.5]
    #kwargs = {
    #    "bias": True,
    #}
    model = GCN_hook(*args,**kwargs)
    model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()
    return model
def load_GAT(model_path,args=[1433,1433,8,7,1],kwargs={'bias':True}):
    model = tgGAT(*args,**kwargs)
    model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()
    return model