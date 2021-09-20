import collections 
import time
import pickle as pkl
import os
import torch
def constructNeighborSet(graph_in):
    neighbor_set = {}
    senders = graph_in["senders"]
    receivers = graph_in["receivers"]
    for i in range(graph_in["node_num"]):
        neighbor_set[i] = []
    for i in range(len(senders)):
        send_node = senders[i]
        if not send_node in neighbor_set:
            neighbor_set[send_node] = []
        neighbor_set[send_node].append(receivers[i])
    return neighbor_set

def normalized(dist):
    total = sum(dist)
    if total == 0:
        return dist
    else:
        dist = [value / total for value in dist]
        return dist
def getShortestPathDistanceNodes(node_num, neighbor_set, anchor_list, labels):
    shortest_path_list = []
    anchor_set = set(anchor_list)
    num_class = max(labels)+1
    #print(anchor_set)
    for i in range(node_num):
        de = collections.deque([[i,0]])
        shortest_path_distance = "inf"
        shortest_path_train_nodes = []
        mask = [False for i in range(node_num)]
        class_distribution = [0 for i in range(num_class)]
        while len(de)>0:
            curr = de.popleft()
            mask[curr[0]] = True
            if curr[0] in anchor_set:
                if shortest_path_distance == "inf":
                    #shortest_path_train_nodes = [curr[0]]
                    class_distribution[labels[curr[0]]] = class_distribution[labels[curr[0]]] + 1
                    shortest_path_distance = curr[1]
                elif curr[1] == shortest_path_distance:
                    class_distribution[labels[curr[0]]] = class_distribution[labels[curr[0]]] + 1
                    #shortest_path_train_nodes.append(curr[0])
                else:
                    break
            else:
                #if curr[1]+1<=2:
                neighbors = neighbor_set[curr[0]]
                for j in neighbors:
                    if not mask[j]:
                        de.append([j, curr[1]+1])
        shortest_path_list.append({
            "dis":shortest_path_distance,
            "train_nodes":normalized(class_distribution)
        })    
    return shortest_path_list
def getShortestPathDistance(original_graph, idx_train, labels):
    graph_in = {
        "node_num":original_graph.size()[0],
        "senders":original_graph._indices()[1].tolist(),
        "receivers":original_graph._indices()[0].tolist()
    }
    node_num = graph_in["node_num"]
    cora_gcn_neighbor_set = constructNeighborSet(graph_in)
    shortest_path_list = getShortestPathDistanceNodes(node_num, cora_gcn_neighbor_set, idx_train.tolist(), labels.tolist())
    return shortest_path_list
def getSavePath(dataf, data_name):
    return dataf+"{}/{}_SPD.pkl".format(data_name, data_name)
def saveJson(obj, savePath):
    with open(savePath, "wb") as f:
        pkl.dump(obj, f)
def loadJson(savePath):
    with open(savePath, "rb") as f:
        obj = pkl.load(f)
    return obj
def getSPDJson(original_graph, idx_train, labels, dataf, data_name):
    savePath = getSavePath(dataf, data_name)
    existence = os.path.isfile(savePath)
    if existence:
        return loadJson(savePath)
    else:
        SPD = getShortestPathDistance(original_graph, idx_train, labels)
        saveJson(SPD, savePath)
        return SPD
    
def calculateJaccardDistance(a,b):
    intersection = a*b
    union = 1-(1-a)*(1-b)
    inter_sum = intersection.sum()
    union_sum = union.sum()
    return inter_sum / union_sum
def calculateCosDistance(a, b, eps=1e-8):
    """
    added eps for numerical stability
    """
    a_n = a.norm()
    b_n = b.norm()
    a_norm = a/ torch.max(a_n, eps * torch.ones(1))
    b_norm = b/ torch.max(b_n, eps * torch.ones(1))
    sim_mt_1 = a_norm * b_norm
    sim_mt = sim_mt_1.sum()
    return sim_mt
def getTopkFeatureSimilaritySet(features, anchor_list, labels, k=5):
    node_num = features.shape[0]
    feature_sim_set = []
    num_class = max(labels)+1
    for i in range(node_num):
        feature_similarity_list = []
        
        for anchor in anchor_list:
            jd = calculateCosDistance(features[i], features[anchor])
            feature_similarity_list.append({
                "anchor_id": anchor,
                "anchor_label": labels[anchor],
                "anchor_similarity": jd.item()
            })
        feature_similarity_list = sorted(feature_similarity_list, key=lambda ele: ele["anchor_similarity"], reverse=True)
        #print(feature_similarity_list)
        #break
        feature_similarity_list = feature_similarity_list[:k]
        class_distribution = [0 for i in range(num_class)]
        for item in feature_similarity_list:
            label = item["anchor_label"]
            class_distribution[label] = class_distribution[label] + 1
        feature_sim_set.append({
            "train_nodes":normalized(class_distribution),
            "details":feature_similarity_list
        })
        #print(feature_sim_set)
    return feature_sim_set
def getKFSSavePath(dataf, data_name):
    return dataf+"{}/{}_KFS_V1.pkl".format(data_name, data_name)
def getKFSJson(features, idx_train, labels, dataf, data_name, k=5):
    savePath = getKFSSavePath(dataf, data_name)
    existence = os.path.isfile(savePath)
    if existence:
        return loadJson(savePath)
    else:
        KFS = getTopkFeatureSimilaritySet(features, idx_train.tolist(), labels.tolist(), k)
        saveJson(KFS, savePath)
        return KFS