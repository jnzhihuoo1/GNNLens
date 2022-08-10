import math
from collections import OrderedDict

import torch
from torch import nn
import torch.nn.functional as F
import torch_geometric as pyg

#import yaml
#import pandas as pd
#from pathlib import Path
#from munch import munchify
#from collections import OrderedDict
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