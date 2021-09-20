import numpy as np
from rulematrix.surrogate import RuleList

def constructNeighborSet(graph_in):
    neighbor_set = {}
    senders = graph_in["senders"]
    receivers = graph_in["receivers"]
    for i in range(len(senders)):
        send_node = senders[i]
        if not send_node in neighbor_set:
            neighbor_set[send_node] = []
        neighbor_set[send_node].append(receivers[i])
    return neighbor_set
def constructDegreeList(neighbor_set, total_node_num):
    degree_list = []
    for i in range(total_node_num):
        if i in neighbor_set:
            degree = len(neighbor_set[i])
            degree_list.append(degree)
        else:
            degree_list.append(0)
    return degree_list
def constructCGTNGTList(ground_truth,neighbor_set,total_node_num):
    CGTNGT_list = []
    for i in range(total_node_num):
        if i in neighbor_set:
            neighbors = neighbor_set[i]
            center_label = ground_truth[i]
            total = len(neighbors)
            count = 0
            for neighbor_index in neighbors:
                neighbor_label = ground_truth[neighbor_index]
                if neighbor_label == center_label:
                    count = count + 1
            if total > 0:
                CGTNGT = count / total
            else:
                CGTNGT = 0
        else:
            CGTNGT = 0
        CGTNGT_list.append(CGTNGT)
    return CGTNGT_list

def customized_print_rule(rule, feature_names=None, category_names=None, label="label", support=None):
    # type: (Rule, List[Union[str, None]], List[Union[List[str], None]], str, List[int]) -> str
    """
    print the rule in a nice way
    :param rule: An instance of Rule
    :param feature_names: a list of n_features feature names,
    :param category_names: the names of the categories of each feature.
    :param label: Can take two values, 'label': just print the label as output, or 'prob': print the prob distribution.
    :param support: optional values of the data that support the rule
    :return: str
    """
    pred_label = np.argmax(rule.output)
    if label == "label":
        output = str(pred_label) + " ({})".format(rule.output[pred_label])
    elif label == "prob":
        output = "[{}]".format(", ".join(["{:.4f}".format(prob) for prob in rule.output]))
    else:
        raise ValueError("Unknown label {}".format(label))
    output = "{}: ".format(label) + output

    default = rule.is_default()
    if default:
        s = "DEFAULT"
        #s = "DEFAULT " + output
    else:
        if feature_names is None:
            _feature_names = ["X" + str(idx) for idx, _ in rule.clauses]
        else:
            _feature_names = [feature_names[idx] for idx, _ in rule.clauses]

        categories = []
        for feature_idx, category in rule.clauses:
            if category_names is None:
                _category_names = None
            else:
                _category_names = category_names[feature_idx]
            if _category_names is None:
                categories.append(" = " + str(category))
            else:
                categories.append(" in " + str(_category_names[category]))

        #s = "IF "
        # conditions
        conditions = ["({}{})".format(feature, category) for feature, category in zip(_feature_names, categories)]
        s = " AND ".join(conditions)
        # results
        # s += " THEN " + output

    if support is not None:
        support_list = [("+" if i == pred_label else "-") + str(supp) for i, supp in enumerate(support)]
        s += " [" + "/".join(support_list) + "]"
    return s


def extract_rule(graph_obj):
    ## Loading Data
    dataset_name = graph_obj["common"]["name"]
    common = graph_obj["common"]
    individual = graph_obj["individual"]
    SPD = common["graph_additional_info"]["SPD"]
    total_node_num = len(SPD)
    ground_truth = common["graph_target"]["node_features"]
    GCN_output = individual['GCN']["graph_out"]["node_features"]
    #GCNWF_output = individual['GCN_Identity_features']["graph_out"]["node_features"]
    #MLP_output = individual["MLP"]["graph_out"]["node_features"]
    KFS = common["graph_additional_info"]["KFS"]
    GCN_name = individual["GCN"]["real_model_name"]
    #GCNWF_name = individual['GCN_Identity_features']["real_model_name"]
    #MLP_name = individual['MLP']["real_model_name"]
    graph_in = common["graph_in"]
    neighbor_set = constructNeighborSet(graph_in)
    degree_list = constructDegreeList(neighbor_set, total_node_num)
    CGTNGT_list = constructCGTNGTList(ground_truth, neighbor_set, total_node_num)


    ## Control Output
    output = GCN_output
    #output = GCNWF_output
    #output = MLP_output

    ## Features: Degree + Distance + CGTNGT + SPD + KFS + Ground_Truth --> Label: Error (0), Correct (1)
    Feature_List = []
    Output_List = []
    feature_names = []
    is_categorical = []
    is_continuous = []
    is_integer = []
    ## Degree
    feature_names.append("Degree")
    is_categorical.append(False)
    is_continuous.append(False)
    is_integer.append(True)

    ## Distance
    feature_names.append("Distance")
    is_categorical.append(False)
    is_continuous.append(False)
    is_integer.append(True)

    ## CGTNGT 
    feature_names.append("CGTNGT")
    is_categorical.append(False)
    is_continuous.append(True)
    is_integer.append(False)
    for i in range(len(SPD[0]['train_nodes'])):
        feature_names.append("SPD_"+str(i))
        is_categorical.append(False)
        is_continuous.append(True)
        is_integer.append(False)
    for i in range(len(KFS[0]['train_nodes'])):
        feature_names.append("KFS_"+str(i))
        is_categorical.append(False)
        is_continuous.append(True)
        is_integer.append(False)
    feature_names.append("GT")
    is_categorical.append(True)
    is_continuous.append(False)
    is_integer.append(False)
    target_names = ["Error", "Correct"]
    for i in range(total_node_num):
        dis = SPD[i]['dis']
        if dis == 'inf':
            dis = -1
        node_features = [degree_list[i], dis, CGTNGT_list[i]]

        node_features = node_features + SPD[i]['train_nodes'] + KFS[i]['train_nodes'] + [ground_truth[i]]
        label = 1 if ground_truth[i] == output[i] else 0
        Feature_List.append(node_features)
        Output_List.append(label)
    train_x = np.asarray(Feature_List)
    train_y = np.asarray(Output_List)

    
    ## Fit Rule List
    rlargs = {'feature_names': feature_names, 'verbose': 2}
    rl = RuleList(numeric_features=np.logical_not(is_categorical), **rlargs)
    rl.fit(train_x, train_y)
    
    ## Rule Name Deduction
    rule_list = rl.rule_list
    rule_name = []
    for i, rule in enumerate(rule_list):
        is_last = rule.is_default()
        s = str(i)+":"+customized_print_rule(rule, rl.feature_names, rl.category_names)
        rule_name.append(s)
    
    ## Satisfied Rule Id Deduction
    results = rl.decision_path(train_x)
    satisfied_rule_id_list = []
    for j in range(len(results[0])):
        itemindex = np.argwhere(results[:,j] == False)
        if len(itemindex)>0:
            itemindex = np.min(itemindex)
        else:
            itemindex = len(results)
        satisfied_rule_id_list.append(int(itemindex-1))
    
    ## Output Rule Mining Results
    rm_package = {
        "rule_name":rule_name,
        "satisfied_rule_id":satisfied_rule_id_list
    }
    return rm_package