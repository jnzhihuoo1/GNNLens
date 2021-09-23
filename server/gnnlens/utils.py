import numpy as np
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

def construct_mask(graph):
    train_mask = graph.ndata['train_mask']
    test_mask = graph.ndata['test_mask']
    valid_mask = graph.ndata['val_mask']
    
    train_idx = np.where(train_mask)[0].tolist()
    test_idx = np.where(test_mask)[0].tolist()
    valid_idx = np.where(valid_mask)[0].tolist()
    return {
        "train":train_idx,
        "test":test_idx,
        "valid":valid_idx
    }