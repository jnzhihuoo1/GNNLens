"""Dump data for GNNLens"""
import dgl.backend as F2
import json
import numpy as np
import os
from dgl import DGLError
from gnnlens.utils import constructSparseFeature, construct_mask
from gnnlens.metric import getSPDJson, getKFSJson, getLayoutJson
import time
class GNNLensWriter():
    """
    Parameters
    ----------
    logdir: str
        Path to create a new directory for dumping data files, which can 
        be either a relative path or an absolute path.
    """
    def __init__(self, logdir, exist_ok=True):
        os.makedirs(logdir, exist_ok=exist_ok)
        self.logdir = logdir
        self.graph_names = []
        self.graph_data = dict()
        self.graph_metrics_data = dict()
        self.VERSION_ID = "V1_2"
        
    def _get_graph_logdir(self, name):
        """Get logdir for the graph.
        
        Parameters
        ----------
        name : str
            Name of the graph.
        """
        return os.path.join(self.logdir, str(self.graph_data[name]["common"]['dataset_id']))
    
    def add_graph(self, name, graph, nlabels, num_nlabel_types, features, calculate_metrics=True, additional_info={}):
        """Add data for a graph.

        Parameters
        ----------
        name : str
            Name of the graph.
        graph : DGLGraph
            A homogeneous graph.
        nlabels : Tensor of integers, optional
            Node labels. The tensor can be reshaped as (N,) where N is the number of nodes.
            Each node should be associated with one label only.
        num_nlabel_types : int, optional
            Number of node label types. If not provided and nlabels is provided,
            this will be inferred then. num_nlabel_types should be no greater than 10.
        eweights : dict[str, tensor]
            Edge weights. The keys are the eweight names, e.g. confidence. The values are the
            tensors of edge weights. The tensors can be reshaped as (E,) where E is the number
            of edges.
        """
        if name in self.graph_names:
            raise ValueError('Graph name {} has already been used.'.format(name))

        num_nodes = graph.num_nodes()
        num_edges = graph.num_edges()
        mask = construct_mask(graph)

        srcs, dsts = graph.edges()
        srcs = F2.asnumpy(srcs).tolist()
        dsts = F2.asnumpy(dsts).tolist()

        # Handle nlabels
        if nlabels is None:
            nlabels = []
        else:
            nlabels = F2.asnumpy(nlabels)
            try:
                nlabels = np.reshape(nlabels, (num_nodes,))
            except:
                raise DGLError('Node labels should be able to be reshaped as (num_nodes,)')
            if num_nlabel_types is None:
                num_nlabel_types = int(nlabels.max()) + 1
            assert num_nlabel_types <= 10, \
                'Expect num_nlabel_types to be no greater than 10, got {:d}'.format(
                    num_nlabel_types)
            nlabels = nlabels.tolist()
        graph_id = len(self.graph_names) + 1
        graph_logdir = os.path.join(self.logdir, str(graph_id))
        os.makedirs(graph_logdir, exist_ok=True)
        
        
        dataset_id = graph_id
        data_type = 2
        graph_id = 1
        explain_id = 4
        task = "node_classification"
        
        ## graph_in
        features_sparse, features_sparse_value = constructSparseFeature(features.cpu().numpy())
        Explain_type = "MessagePassing"
        graph_layout = []
        graph_additional_info = {
            "num_class" : num_nlabel_types
        }
        for key in additional_info:
            graph_additional_info[key] = additional_info[key]
        graph_in = {
            "feature":features_sparse,
            "feature_value":features_sparse_value,
            "senders":srcs,
            "receivers":dsts,
            "node_num":num_nodes
        }
        common_package = {
                "dataset_id": dataset_id,
                "data_type_id": data_type,
                "graph": graph_id,
                "explain_id": explain_id,
                "task": task,
                "graph_in": graph_in,
                "graph_target":{
                    "node_features":nlabels,
                },
                "graph_explaination":
                {
                    "type":  Explain_type
                },
                "graph_layout":graph_layout, 
                "mask":mask,
                "graph_additional_info":graph_additional_info,
                "name":name
        }
        '''
        local_individual_package = {
            "model": graph_info["model"],
            "graph_out":graph_info["graph_out"],
            "real_model_name": real_model_name
        }

        individual_package[key] = local_individual_package
        '''
        individual_package = {}
        return_package = {
            "common": common_package,
            "individual": individual_package,
            "individual_model_names":[],
            "subgraph_list": [],
            'subgraphs': {},
            "feature_ranking_list":[],
            "feature_ranking":{}
        }
        # Register graph name
        self.graph_names.append(name)
        self.graph_data[name] = return_package
        self.graph_metrics_data[name] = {
            "features": features,
            "graph_in": graph_in,
            "idx_train": mask["train"],
            "labels": nlabels
        }
        if calculate_metrics:
            self.calculate_metrics(name)
        
    def calculate_metrics(self, name):
        ## Calculate metrics for the specific graph
        assert name in self.graph_names, \
            'Expect add_graph to be called first for graph {}'.format(name)
        graph_logdir = self._get_graph_logdir(name)
        dataf = graph_logdir
        graph_metrics_data = self.graph_metrics_data[name]
        graph_additional_info = self.graph_data[name]["common"]["graph_additional_info"]
        graph_in = graph_metrics_data["graph_in"]
        idx_train = graph_metrics_data["idx_train"]
        features = graph_metrics_data["features"]
        labels = graph_metrics_data["labels"]
        print("> Calculating SPD metrics for {}".format(name))
        start_time = time.time()
        SPD = getSPDJson(graph_in, idx_train, labels, dataf, name)
        print("Finished:", time.time() - start_time)
        print("> Calculating KFS metrics for {}".format(name))
        start_time = time.time()
        KFS = getKFSJson(features, idx_train, labels, dataf, name, 5)
        print("Finished:", time.time() - start_time)
        graph_additional_info["SPD"] = SPD
        graph_additional_info["KFS"] = KFS
        
        self.graph_data[name]["common"]["graph_additional_info"] = graph_additional_info
        print("> Calculating layout for {}".format(name))
        start_time = time.time()
        newPos = getLayoutJson(graph_in, dataf, name)
        print("Finished:", time.time() - start_time)

        self.graph_data[name]["common"]["graph_layout"] = newPos
        print("Finish calculating metrics for {}.".format(name))
        
    def add_model(self, graph_name, model_name, nlabels, output_vector):
        ## model_key 0 is main model.
        ## model_key 1 is main model without structure.
        ## model_key 2 is main model without features.
        """Add data for a model
        
        Parameters
        ----------
        graph_name : str
            Name of the graph.
        model_name : str
            Nmae of the model.
        nlabels : Tensor of integers, optional
            Node labels. The tensor can be reshaped as (N,) where N is the number of nodes.
            Each node should be associated with one label only.
        eweights : dict[str, tensor]
            Edge weights. The keys are the eweight names, e.g. confidence. The values are the
            tensors of edge weights. The tensors can be reshaped as (E,) where E is the number
            of edges. The edge weights should be in range [0, 1].
        """
        assert graph_name in self.graph_names, \
            'Expect add_graph to be called first for graph {}'.format(graph_name)
        if model_name in self.graph_data[graph_name]["individual_model_names"]:
            raise ValueError('Model name {} has already been used.'.format(model_name))
        # Handle nlabels
        nlabels = F2.asnumpy(nlabels)
        num_nodes = self.graph_data[graph_name]["common"]["graph_in"]['node_num']
        try:
            nlabels = np.reshape(nlabels, (num_nodes,))
        except:
            raise DGLError('Node labels should be able to be reshaped as (num_nodes,)')
        nlabels = nlabels.tolist()

        
        # Dump model data file
        num_models = len(self.graph_data[graph_name]['individual_model_names'])
        
        
        #individual_models_keys = ["GCN", "MLP", "GCN_Identity_features"]
        #if model_key<0 or model_key >= len(individual_models_keys):
        #    raise DGLError('model_key should be 0, 1, or 2.')
        output_vector = F2.asnumpy(output_vector)
        output_vector = output_vector.tolist()
        graph_out = {
            "node_features":nlabels,
            "output_vector": output_vector
        }
        local_individual_package = {
            "id": num_models,
            "graph_out":graph_out,
            "model_name": model_name
        }
        '''
        if model_key == 0:
            graph_metrics_data = self.graph_metrics_data[graph_name]
            graph_in = graph_metrics_data["graph_in"]
            message_passing = {
                "senders": graph_in["senders"],
                "receivers":graph_in["receivers"],
                "values": [1 for i in range(len(graph_in["senders"]))]
            }
            local_individual_package["message_passing"] = message_passing
        '''
        # model_key_name = individual_models_keys[model_key]
        # Register the model
        self.graph_data[graph_name]["individual_model_names"].append(model_name)
        self.graph_data[graph_name]["individual"][model_name] = local_individual_package
        
    def add_subgraph(self, graph_name, subgraph_name, node_id, subgraph_nids, subgraph_eids, 
                     subgraph_nweights=None, subgraph_eweights=None):
        """Add data for a subgraph associated with a node
        
        Parameters
        ----------
        graph_name : str
            Name of the graph.
        subgraph_name : str
            Name of the subgraph group.
        node_id : int
            The node id with which the subgraph is associated. For one subgraph group,
            a node can only be associated with a single subgraph.
        subgraph_nids : Tensor of integers
            Ids of the nodes in the subgraph. The tensor is of shape (N,), where N is
            the number of nodes in the subgraph.
        subgraph_eids : Tensor of integers
            Ids of the edges in the subgraph. The tensor is of shape (E,), where E is
            the number of edges in the subgraph.
        subgraph_nweights : Tensor of floats, optional
            Weights of the nodes in the subgraph, corresponding to subgraph_nids. The
            tensor can be reshaped as (N,), where N is the number of nodes in the
            subgraph. The weights should be in range [0, 1].
        subgraph_eweights : Tensor of floats, optional
            Weights of the edges in the subgraph, corresponding to subgraph_eids. The
            tensor can be reshaped as (E,), where E is the number of edges in the
            subgraph. The weights should be in range [0, 1].
        """
        assert graph_name in self.graph_names, \
            'Expect add_graph to be called first for graph {}'.format(graph_name)
        
        # Register the subgraph
        if subgraph_name not in self.graph_data[graph_name]['subgraph_list']:
            self.graph_data[graph_name]['subgraph_list'].append(subgraph_name)
            self.graph_data[graph_name]['subgraphs'][subgraph_name] = {
                "name": subgraph_name,
                "success": True,
                "node_subgraphs": dict()
            }
            '''
            num_nodes = self.graph_data[graph_name]['num_nodes']
            for i in range(num_nodes):
                self.graph_data[graph_name]['subgraphs'][subgraph_name]["node_subgraphs"][i] = {
                    "nodes": [],
                    "nweight": [],
                    "eids": [],
                    "eweight": []
                }
                '''
        
        # GNNVis assumes the node and edge IDs to be sorted
        subgraph_nids = F2.asnumpy(subgraph_nids)
        nid_order = np.argsort(subgraph_nids)
        subgraph_nids = subgraph_nids[nid_order]
        
        subgraph_eids = F2.asnumpy(subgraph_eids)
        eid_order = np.argsort(subgraph_eids)
        subgraph_eids = subgraph_eids[eid_order]
        
        # Handle nweights
        if subgraph_nweights is None:
            subgraph_nweights = np.ones(len(subgraph_nids))
        else:
            subgraph_nweights = F2.asnumpy(subgraph_nweights)
            subgraph_nweights = np.reshape(subgraph_nweights, (len(subgraph_nids),))
            subgraph_nweights = subgraph_nweights[nid_order]

        # Handle eweights
        if subgraph_eweights is None:
            subgraph_eweights = np.ones(len(subgraph_eids))
        else:
            subgraph_eweights = F2.asnumpy(subgraph_eweights)
            subgraph_eweights = np.reshape(subgraph_eweights, (len(subgraph_eids),))
            subgraph_eweights = subgraph_eweights[eid_order]
        
        self.graph_data[graph_name]['subgraphs'][subgraph_name]["node_subgraphs"][node_id] = {
            "nodes": subgraph_nids.tolist(),
            "nweight": subgraph_nweights.tolist(),
            "eids": subgraph_eids.tolist(),
            "eweight": subgraph_eweights.tolist()
        }
    def add_feature_ranking(self, graph_name, feature_ranking_name, node_id, feature_ranking_values):
        """Add data for a feature ranking associated with a node
        
        Parameters
        ----------
        graph_name : str
            Name of the graph.
        feature_ranking_name : str
            Name of the feature ranking.
        node_id : int
            The node id with which the subgraph is associated. For one subgraph group,
            a node can only be associated with a single subgraph.
        feature_ranking_values : Tensor of float
            The feature ranking values. It will automatically extract the ranking values for that node only.
        """
        assert graph_name in self.graph_names, \
            'Expect add_graph to be called first for graph {}'.format(graph_name)
        
        # Register the subgraph
        if feature_ranking_name not in self.graph_data[graph_name]['feature_ranking_list']:
            self.graph_data[graph_name]['feature_ranking_list'].append(feature_ranking_name)
            self.graph_data[graph_name]['feature_ranking'][feature_ranking_name] = {
                "name": feature_ranking_name,
                "success": True,
                "feature_rank_values": dict()
            }
        
        # GNNLens assumes the node and edge IDs to be sorted
        feature_ranking_values = F2.asnumpy(feature_ranking_values).tolist()
        feature_sparse_list = self.graph_data[graph_name]["common"]["graph_in"]["feature"]
        assert node_id>=0 and node_id < len(feature_sparse_list), 'Node id: {} is out of range [0,{}).'.format(node_id, len(feature_sparse_list))
        #assert len(feature_ranking_values) == len(feature_sparse_list), 'the length of feature_ranking_values {} is not equal to {}'.format(len(feature_ranking_values), len(feature_sparse_list))
        feature = feature_sparse_list[node_id]
        selected_feature_ranking_values = [feature_ranking_values[idx] for idx in feature]
        self.graph_data[graph_name]['feature_ranking'][feature_ranking_name]["feature_rank_values"][node_id] = selected_feature_ranking_values
        
        
    def flush(self):
        """Finish dumping data."""
        VERSION_ID = self.VERSION_ID
        # Dump data list (meta info)
        with open(self.logdir + '/datasetlist_{}.json'.format(VERSION_ID), 'w') as f:
            datasets = []
            for i, name in enumerate(self.graph_names):
                datasets.append({"id": i + 1, "name": name})
            json.dump({"datasets": datasets, "success": True}, f)
        
        for name in self.graph_names:
            graph_id = self.graph_data[name]['common']["dataset_id"]
            VERSION_ID = self.VERSION_ID
            # Dump model meta info
            with open(self.logdir + '/cache_bundle_{}_{}.json'.format(graph_id, VERSION_ID), 'w') as f:
                json.dump({"success": True, "graph_obj":self.graph_data[name]}, f)