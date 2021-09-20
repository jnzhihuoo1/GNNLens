import numpy as np
import scipy.sparse as sp
import torch
import torch.nn as nn
from torch.nn.modules.module import Module
from sklearn.model_selection import train_test_split
import scipy.sparse as sp
import numpy as np
from scipy.sparse.csgraph import connected_components
import json
import gzip
class Normalize(Module):
    def __init__(self):
        super(Normalize,self).__init__()
        
    def sym_normalized_tildeA(self,adj):
        '''
        \tildeD^{-1/2}\tildeA\tildeD^{-1/2}   #GCN
        '''
        adj = adj + sp.eye(adj.shape[0])  #\tildeA
        adj = sp.coo_matrix(adj)
        row_sum = np.array(adj.sum(1))
        d_inv_sqrt = np.power(row_sum, -0.5).flatten() #\tildeD^{-1/2}
        d_inv_sqrt[np.isinf(d_inv_sqrt)] = 0.
        d_mat_inv_sqrt = sp.diags(d_inv_sqrt)
        return d_mat_inv_sqrt.dot(adj).dot(d_mat_inv_sqrt).tocoo()   #\tildeD^{-1/2}\tildeA\tildeD^{-1/2}
    
    def row_normalized_tildeA(self,adj): 
        '''
        \tildeD^{-1}\tildeA
        '''
        adj = adj + sp.eye(adj.shape[0])    #\tildeA
        adj = sp.coo_matrix(adj)
        row_sum = np.array(adj.sum(1))
        d_inv = np.power(row_sum, -1).flatten()   #\tildeD^{-1}
        d_inv[np.isinf(d_inv)] = 0.
        d_mat_inv = sp.diags(d_inv)
        return d_mat_inv.dot(adj).tocoo()      #\tildeD^{-1}\tildeA
    
    def sym_normalized_A(self,adj):
        '''
        D^{-1/2}AD^{-1/2}   #GCN
        '''
        adj = sp.coo_matrix(adj)
        row_sum = np.array(adj.sum(1))
        d_inv_sqrt = np.power(row_sum, -0.5).flatten() #\tildeD^{-1/2}
        d_inv_sqrt[np.isinf(d_inv_sqrt)] = 0.
        d_mat_inv_sqrt = sp.diags(d_inv_sqrt)
        return d_mat_inv_sqrt.dot(adj).dot(d_mat_inv_sqrt).tocoo()   #\tildeD^{-1/2}\tildeA\tildeD^{-1/2}
    
    def identity(self, adj):
        return sp.eye(adj.shape[0])
    
    def forward(self,mx,type,alpha=0.8,scale=False):
        if type == 'SymNorm_tildeA':
            return self.sym_normalized_tildeA(mx)         #GCN
        elif type == 'SymNorm_A':
            return self.sym_normalized_A(mx)
        elif type == 'LeftNorm_tildeA':
            return self.row_normalized_tildeA(mx)
        elif type == 'Identity_L':
            return self.identity(mx)
        else:
            raise Expection("Invalid normalization technique:", type)


def accuracy(output, labels):
    preds = output.max(1)[1].type_as(labels)
    correct = preds.eq(labels).double()
    correct = correct.sum()
    return correct / len(labels)



def set_seed(seed, cuda=True):
    np.random.seed(seed)
    torch.manual_seed(seed)
    if cuda: torch.cuda.manual_seed(seed)

def constructSparseFeature(features):
    new_feature = []
    new_feature_values = []
    for i in range(features.shape[0]):
        new_feature_list = []
        new_feature_value = []
        for j in range(features.shape[1]):
            if features[i,j]:
                new_feature_list.append(j)                      
                new_feature_value.append(features.item(i,j))
        new_feature.append(new_feature_list)
        new_feature_values.append(new_feature_value)
    return new_feature, new_feature_values






def load_npz(file_name):
    """Load a SparseGraph from a Numpy binary file.

    Parameters
    ----------
    file_name : str
        Name of the file to load.

    Returns
    -------
    sparse_graph : gust.SparseGraph
        Graph in sparse matrix format.

    """
    if not file_name.endswith('.npz'):
        file_name += '.npz'
    with np.load(file_name,allow_pickle=True) as loader:
        loader = dict(loader)
        adj_matrix = sp.csr_matrix((loader['adj_data'], loader['adj_indices'],
                                              loader['adj_indptr']), shape=loader['adj_shape'])

        if 'attr_data' in loader:
            attr_matrix = sp.csr_matrix((loader['attr_data'], loader['attr_indices'],
                                                   loader['attr_indptr']), shape=loader['attr_shape'])
        else:
            attr_matrix = None

        labels = loader.get('labels')
        graph = {}
        #idx_to_node = loader.get('idx_to_node')
        #if idx_to_node:
        #    idx_to_node = idx_to_node.tolist()
        #    graph['idx_to_node'] = idx_to_node

        idx_to_attr = loader.get('idx_to_attr')
        if idx_to_attr:
            idx_to_attr = idx_to_attr.tolist()
            idx_to_attr = {str(k):str(v) for k,v in idx_to_attr.items()}
            graph['idx_to_attr'] = idx_to_attr

        idx_to_class = loader.get('idx_to_class')
        if idx_to_class:
            idx_to_class = idx_to_class.tolist()
            idx_to_class = {str(k):str(v) for k,v in idx_to_class.items()}
            graph['idx_to_class'] = idx_to_class
    return adj_matrix, attr_matrix, labels, graph


def largest_connected_components(adj, n_components=1):
    """Select the largest connected components in the graph.

    Parameters
    ----------
    sparse_graph : gust.SparseGraph
        Input graph.
    n_components : int, default 1
        Number of largest connected components to keep.

    Returns
    -------
    sparse_graph : gust.SparseGraph
        Subgraph of the input graph where only the nodes in largest n_components are kept.

    """
    _, component_indices = connected_components(adj)
    component_sizes = np.bincount(component_indices)
    components_to_keep = np.argsort(component_sizes)[::-1][:n_components]  # reverse order to sort descending
    nodes_to_keep = [
        idx for (idx, component) in enumerate(component_indices) if component in components_to_keep


    ]
    #print("Selecting {0} largest connected components".format(n_components))
    return nodes_to_keep


def train_val_test_split_tabular(*arrays, train_size=0.5, val_size=0.3, test_size=0.2, stratify=None, random_state=None):

    """
    Split the arrays or matrices into random train, validation and test subsets.

    Parameters
    ----------
    *arrays : sequence of indexables with same length / shape[0]
            Allowed inputs are lists, numpy arrays or scipy-sparse matrices.
    train_size : float, default 0.5
        Proportion of the dataset included in the train split.
    val_size : float, default 0.3
        Proportion of the dataset included in the validation split.
    test_size : float, default 0.2
        Proportion of the dataset included in the test split.
    stratify : array-like or None, default None
        If not None, data is split in a stratified fashion, using this as the class labels.
    random_state : int or None, default None
        Random_state is the seed used by the random number generator;

    Returns
    -------
    splitting : list, length=3 * len(arrays)
        List containing train-validation-test split of inputs.

    """
    if len(set(array.shape[0] for array in arrays)) != 1:
        raise ValueError("Arrays must have equal first dimension.")
    idx = np.arange(arrays[0].shape[0])
    idx_train_and_val, idx_test = train_test_split(idx,
                                                   random_state=random_state,
                                                   train_size=(train_size + val_size),
                                                   test_size=test_size,
                                                   stratify=stratify)
    if stratify is not None:
        stratify = stratify[idx_train_and_val]
    idx_train, idx_val = train_test_split(idx_train_and_val,
                                          random_state=random_state,
                                          train_size=(train_size / (train_size + val_size)),
                                          test_size=(val_size / (train_size + val_size)),
                                          stratify=stratify)
    result = []
    for X in arrays:
        result.append(X[idx_train])
        result.append(X[idx_val])
        result.append(X[idx_test])
    return result

def preprocess_graph(adj):
    adj_ = adj + sp.eye(adj.shape[0])
    rowsum = adj_.sum(1).A1
    degree_mat_inv_sqrt = sp.diags(np.power(rowsum, -0.5))
    adj_normalized = adj_.dot(degree_mat_inv_sqrt).T.dot(degree_mat_inv_sqrt).tocsr()
    return adj_normalized


def compress_data(data):
    # Convert to JSON
    json_data = json.dumps(data, indent=2)
    # Convert to bytes
    encoded = json_data.encode('utf-8')
    # Compress
    compressed = gzip.compress(encoded)
    return compressed
def decompress_data(compressed):
    # Decompress
    encoded = gzip.decompress(compressed)
    # Convert to string
    json_data = encoded.decode('utf-8')
    # Convert to JSON
    data = json.loads(json_data)
    return data