import numpy as np
import scipy.sparse as sp
import torch
import sys
import os
import pickle as pkl
import networkx as nx
from time import perf_counter
from torch.utils import data
from utils import Normalize, load_npz, largest_connected_components, train_val_test_split_tabular
from torch_geometric.data import Data, DataLoader
import torch
import torch_geometric as tg
import torch_geometric.datasets
from torch_geometric.datasets import Planetoid, Amazon, Coauthor

Norm = Normalize()

def parse_index_file(filename):
    """Parse index file."""
    index = []
    for line in open(filename):
        index.append(int(line.strip()))
    return index

def row_normalize(mx):
    """Row-normalize sparse matrix"""
    rowsum = np.array(mx.sum(1))
    r_inv = np.power(rowsum, -1).flatten()
    r_inv[np.isinf(r_inv)] = 0.
    r_mat_inv = sp.diags(r_inv)
    mx = r_mat_inv.dot(mx)
    return mx

def sparse_mx_to_torch_sparse_tensor(sparse_mx):
    """Convert a scipy sparse matrix to a torch sparse tensor."""
    sparse_mx = sparse_mx.tocoo().astype(np.float32)
    indices = torch.from_numpy(
        np.vstack((sparse_mx.row, sparse_mx.col)).astype(np.int64))
    values = torch.from_numpy(sparse_mx.data)
    shape = torch.Size(sparse_mx.shape)
    return torch.sparse.FloatTensor(indices, values, shape)


def load_citation(dataf, dataset_str="cora",norm_type='SymNorm_tildeA',cuda=True, shuffle=False, identity_features=False):
    """
    Load Citation Networks Datasets.
    """
    names = ['x', 'y', 'tx', 'ty', 'allx', 'ally', 'graph']
    objects = []
    for i in range(len(names)):
        with open(dataf+"gcn/ind.{}.{}".format(dataset_str.lower(), names[i]), 'rb') as f:
            if sys.version_info > (3, 0):
                objects.append(pkl.load(f, encoding='latin1'))
            else:
                objects.append(pkl.load(f))

    x, y, tx, ty, allx, ally, graph = tuple(objects)
    test_idx_reorder = parse_index_file(dataf+"gcn/ind.{}.test.index".format(dataset_str))
    test_idx_range = np.sort(test_idx_reorder)

    if dataset_str == 'citeseer':
        # Fix citeseer dataset (there are some isolated nodes in the graph)
        # Find isolated nodes, add them as zero-vecs into the right position
        test_idx_range_full = range(min(test_idx_reorder), max(test_idx_reorder)+1)
        tx_extended = sp.lil_matrix((len(test_idx_range_full), x.shape[1]))
        tx_extended[test_idx_range-min(test_idx_range), :] = tx
        tx = tx_extended
        ty_extended = np.zeros((len(test_idx_range_full), y.shape[1]))
        ty_extended[test_idx_range-min(test_idx_range), :] = ty
        ty = ty_extended

    features = sp.vstack((allx, tx)).tolil()
    features[test_idx_reorder, :] = features[test_idx_range, :]
    #features = row_normalize(features)
    if identity_features:
        num_node = features.shape[0]
        features = sp.eye(num_node)
    
    
    adj = nx.adjacency_matrix(nx.from_dict_of_lists(graph))
    originai_graph = sparse_mx_to_torch_sparse_tensor(adj)
    #adj2 = adj + adj.T.multiply(adj.T > adj) - adj.multiply(adj.T > adj)
    #print(np.sum(np.abs(adj2 - adj)))
    adj = Norm(adj,norm_type)

    labels = np.vstack((ally, ty))
    labels[test_idx_reorder, :] = labels[test_idx_range, :]

    idx_test = test_idx_range.tolist()
    idx_train = range(len(y))
    idx_val = range(len(y), len(y)+500)

    if shuffle:
        n = len(idx_test) + len(idx_train) + len(idx_val)
        ids = [*range(n)]
        random.shuffle(ids)
        nidx_test = ids[:len(idx_test)]
        nidx_train = ids[len(idx_test):len(idx_test)+len(idx_train)]
        nidx_val = ids[len(idx_test)+len(idx_train):]

        idx_test = nidx_test
        idx_train = nidx_train
        idx_val = nidx_val
    
    
    # porting to pytorch
    features = torch.FloatTensor(np.array(features.todense())).float()
    labels = torch.LongTensor(labels)
    labels = torch.max(labels, dim=1)[1]
    adj = sparse_mx_to_torch_sparse_tensor(adj).float()
    idx_train = torch.LongTensor(idx_train)
    idx_val = torch.LongTensor(idx_val)
    idx_test = torch.LongTensor(idx_test)

    if cuda:
        features = features.cuda()
        adj = adj.cuda()
        labels = labels.cuda()
        idx_train = idx_train.cuda()
        idx_val = idx_val.cuda()
        idx_test = idx_test.cuda()

    return originai_graph, adj, features, labels, idx_train, idx_val, idx_test



def load_new_data(dataf, dataset_str="cora",norm_type='SymNorm_tildeA',cuda=True, shuffle=False, identity_features=False):
    """
    Load Citation Networks Datasets.
    """
    file_name = dataf+"g2g/"+dataset_str+".npz"
    _A_obs, _X_obs, _z_obs, graph_additional_package = load_npz(file_name)
    _A_obs = _A_obs + _A_obs.T
    _A_obs[_A_obs > 1] = 1
    lcc = largest_connected_components(_A_obs)

    _A_obs = _A_obs[lcc][:,lcc]

    assert np.abs(_A_obs - _A_obs.T).sum() == 0, "Input graph is not symmetric"
    assert _A_obs.max() == 1 and len(np.unique(_A_obs[_A_obs.nonzero()].A1)) == 1, "Graph must be unweighted"
    assert _A_obs.sum(0).A1.min() > 0, "Graph contains singleton nodes"

    if identity_features:
        num_node = _A_obs.shape[0]
        _X_obs = sp.eye(num_node)
    else:
        _X_obs = _X_obs[lcc].astype('float32')
    
    _z_obs = _z_obs[lcc]
    _N = _A_obs.shape[0]
    _K = _z_obs.max()+1
    _Z_obs = np.eye(_K)[_z_obs]
    originai_graph = sparse_mx_to_torch_sparse_tensor(_A_obs)
    edge_index = adj_to_edge_index(_A_obs)
    _An = Norm(_A_obs,norm_type)    
    if norm_type == 'Identity_L':
        edge_index = torch.LongTensor([[],[]])
    sizes = [16, _K]
    degrees = _A_obs.sum(0).A1

    seed = 15
    unlabeled_share = 0.8
    val_share = 0.1
    train_share = 1 - unlabeled_share - val_share
    np.random.seed(seed)
    
    split_train, split_val, split_unlabeled = train_val_test_split_tabular(np.arange(_N),
                                                       train_size=train_share,
                                                       val_size=val_share,
                                                       test_size=unlabeled_share,
                                                       stratify=_z_obs)
    train_mask = [False]*_N
    val_mask = [False]*_N
    test_mask = [False]*_N
    for i in split_unlabeled:
        test_mask[i] = True
    for i in split_val:
        val_mask[i] = True
    for i in split_train:
        train_mask[i] = True
    # porting to pytorch
    features = torch.FloatTensor(np.array(_X_obs.todense())).float()
    labels = torch.LongTensor(_Z_obs)
    labels = torch.max(labels, dim=1)[1]
    adj = sparse_mx_to_torch_sparse_tensor(_An).float()
    idx_train = torch.LongTensor(split_train)
    idx_val = torch.LongTensor(split_val)
    idx_test = torch.LongTensor(split_unlabeled)
    
    idx_to_class = graph_additional_package.get("idx_to_class")
    if idx_to_class:
        for key in idx_to_class:
            class_name = idx_to_class[key]
            new_class_name = class_name.split("/")[-1]
            idx_to_class[key] = new_class_name
        graph_additional_package["idx_to_class"] = idx_to_class
    
    
    if cuda:
        features = features.cuda()
        adj = adj.cuda()
        labels = labels.cuda()
        idx_train = idx_train.cuda()
        idx_val = idx_val.cuda()
        idx_test = idx_test.cuda()
    data = Data(x=features,y=labels,edge_index=edge_index)
    data.train_mask = torch.tensor(train_mask)
    data.val_mask = torch.tensor(val_mask)
    data.test_mask = torch.tensor(test_mask)
    return originai_graph, adj, features, labels, idx_train, idx_val, idx_test, graph_additional_package, data

def get_dataset(path, name):
    if name in ['Cora', 'Citeseer', 'Pubmed']:
        dataset = Planetoid(path+name, name)
    elif name in ['Computers', 'Photo']:
        dataset = Amazon(path+name, name)
    elif name == 'CoauthorCS':
        dataset = Coauthor(path+name, 'CS')
    else:
        raise Exception('Unknown dataset.')
    return dataset
def adj_to_edge_index(adj):
    r1 = []
    r2 = []
    for i,k in enumerate(adj.tocsc()):
        for j in list(k.indices):
            r1.append(i)
            r2.append(j)
    #print(r1,r2)
    edge_index = torch.LongTensor([r1,r2])
    return edge_index
label_rate = {'Cora':0.052,'Citeseer':0.036,'Pubmed':0.003,'CoauthorCS':0.016,'Computers':0.015,'Photo':0.021}

def load_citation_v2(dataf, dataset_str="cora",norm_type='SymNorm_tildeA',cuda=True, shuffle=False, identity_features=False):
    """
    Load Citation Networks Datasets.
    """
    label_r = label_rate[dataset_str]
    dataset = get_dataset(dataf, dataset_str)
    labels = dataset.data.y
    e = dataset.data.edge_index
    data = np.array([1]*len(e[0]))
    adj = sp.csr_matrix((data, (e[0].numpy(), e[1].numpy())))
    if identity_features:
        features = np.eye(labels.shape[0])
    else:
        features = dataset.data.x.numpy()
    originai_graph = sparse_mx_to_torch_sparse_tensor(adj)
    adj = Norm(adj,norm_type)
    ids = [*range(int(len(labels)*label_r)+1500)]
    if shuffle:
        random.shuffle(ids)
    nidx_test = ids[-1000:]
    nidx_val = ids[int(len(labels)*label_r):int(len(labels)*label_r)+500]
    nidx_train = ids[:int(len(labels)*label_r)]
        
    
    features = torch.FloatTensor(features).float()
    labels = torch.LongTensor(labels)
    adj = sparse_mx_to_torch_sparse_tensor(adj).float()
    idx_train = torch.LongTensor(nidx_train)
    idx_val = torch.LongTensor(nidx_val)
    idx_test = torch.LongTensor(nidx_test)

    if cuda:
        features = features.cuda()
        adj = adj.cuda()
        labels = labels.cuda()
        idx_train = torch.tensor(nidx_train).cuda()
        idx_val = torch.tensor(nidx_val).cuda()
        idx_test = torch.tensor(nidx_test).cuda()
    
    return originai_graph, adj, features, labels,idx_train, idx_val, idx_test


def load_citation_v3(dataf, dataset_str="cora",norm_type='SymNorm_tildeA',cuda=True, shuffle=False, identity_features=False):
    """
    Load Citation Networks Datasets.
    """
    label_r = label_rate[dataset_str]
    dataset = get_dataset(dataf,dataset_str)
    features = dataset.data.x.numpy()
    labels = dataset.data.y
    e = dataset.data.edge_index
    data = np.array([1]*len(e[0]))
    adj = sp.csr_matrix((data, (e[0].numpy(), e[1].numpy())))
    if norm_type == 'Identity_L':
        edge_index = torch.LongTensor([[],[]])
    else:
        edge_index = adj_to_edge_index(adj)
    originai_graph = sparse_mx_to_torch_sparse_tensor(adj)
    adj = Norm(adj,norm_type)    
    ids = [*range(int(len(labels)))]
    if shuffle:
        random.shuffle(ids)
    nidx_test = ids[-1000:]
    nidx_val = ids[int(len(labels)*label_r):int(len(labels)*label_r)+500]
    nidx_train = ids[:int(len(labels)*label_r)]

    train_mask = [False]*len(labels)
    val_mask = [False]*len(labels)
    test_mask = [False]*len(labels)
    for i in nidx_test:
        test_mask[i] = True
    for i in nidx_val:
        val_mask[i] = True
    for i in nidx_train:
        train_mask[i] = True
        
    if identity_features:
        num_node = features.shape[0]
        features = np.eye(num_node)
    features = torch.FloatTensor(features).float()
    labels = torch.LongTensor(labels)
    adj = sparse_mx_to_torch_sparse_tensor(adj).float()
    idx_train = torch.LongTensor(nidx_train)
    idx_val = torch.LongTensor(nidx_val)
    idx_test = torch.LongTensor(nidx_test)
    if cuda:
        features = features.cuda()
        adj = adj.cuda()
        labels = labels.cuda()
        idx_train = torch.tensor(nidx_train).cuda()
        idx_val = torch.tensor(nidx_val).cuda()
        idx_test = torch.tensor(nidx_test).cuda()
    data = Data(x=features,y=labels,edge_index=edge_index)
    data.train_mask = torch.tensor(train_mask)
    data.val_mask = torch.tensor(val_mask)
    data.test_mask = torch.tensor(test_mask)
    return originai_graph, adj, features, labels,idx_train, idx_val, idx_test, data


