

import HCluster from './HCluster';
import {getLayoutMode, compareSelectedNodeIdList, getNodeStatisticStr, constructNeighborSet, getCoraNodeColor, getTrainColor} from '../../../helper';
const d3 = require("d3");
export default class ProjectionViewComputing{
    public CacheDataPackage:any = {

    }
    public filters:any = {};
    public PCPJson:any = {};
    public pie_name:any = [];
    public selectedNodeList:any = [];
    public initialize_flag: boolean = false;
    public cluster_selectedNodeIdIndex:any[] = [];
    public cluster_highlightNodeIdDict: any = {};
    public detail_highlightNodeIdList: any = [];
    public cluster_renderedLinesList: any[] = [];
    public detail_renderedLinesList: any[] = [];
    public cluster_rawHighlightNodeIdList:any = [];
    public detail_rawHighlightNodeIdList:any = [];
    public aggregationMode : number = 1;
    constructor(){
        this.getDistance = this.getDistance.bind(this);
        this.initialize = this.initialize.bind(this);
        this.checkinitialize = this.checkinitialize.bind(this);
        this.reset = this.reset.bind(this);
        this.getDataPackage = this.getDataPackage.bind(this);
        this.computeDistance = this.computeDistance.bind(this);
        this.computeDistanceMatrix = this.computeDistanceMatrix.bind(this);
        this.updateHighlightNodeIdList = this.updateHighlightNodeIdList.bind(this);
    }
    public updateAggregationMode(aggregationMode:number){
        this.aggregationMode = aggregationMode;
    }
    public getAggregationMode(){
        return this.aggregationMode;
    }


    public getRawHighlightNodeIdList(){
        if(this.aggregationMode === 1){
            return this.cluster_rawHighlightNodeIdList;
        }else if(this.aggregationMode === 2){
            return this.detail_rawHighlightNodeIdList;
        }
    }
    public updateNodeStatistic(changeSelectedNodeNum:any, changeTotalNodeNum:any){
        if(this.aggregationMode === 1){
            let selectedNodeNum = this.cluster_rawHighlightNodeIdList.length;
            let totalNodeNum = this.selectedNodeList.length;
            changeSelectedNodeNum(selectedNodeNum);
            changeTotalNodeNum(totalNodeNum);
        }else if(this.aggregationMode === 2){
            let totalNodeNum = this.cluster_rawHighlightNodeIdList.length;
            if(totalNodeNum === 0){
                totalNodeNum = this.selectedNodeList.length;
            }
            let selectedNodeNum = this.detail_rawHighlightNodeIdList.length;
            changeSelectedNodeNum(selectedNodeNum);
            changeTotalNodeNum(totalNodeNum);
        }
    }
    public calculateHighlightNodeIdList(highlightNodeIdList:any, showMode:number = 1){
        if(this.aggregationMode === 1){
            //this.cluster_highlightNodeIdDict[""+showMode] = highlightNodeIdList;
            let all_data_package:any = {};
            let all_inverted_index:any = {};
            let local_cluster_highlightNodeIdDict : any ={};
            for(let id = 1;id<=4;id++){
                all_data_package[""+id]=this.getDataPackage(id,1);
                all_inverted_index[""+id]=all_data_package[""+id]["invertedIndex"];
                local_cluster_highlightNodeIdDict[""+id] = [];
            }
            //let invertedIndex = all_data_package[""+showMode]["invertedIndex"];
            let selectedNodeList = all_data_package[""+showMode]["selectedNodeList"];
            let selectedNodeIdList:any = [];
            for(let i = 0; i<highlightNodeIdList.length;i++){
                let id_list = selectedNodeList[highlightNodeIdList[i]]["id_list"];
                selectedNodeIdList = selectedNodeIdList.concat(id_list);
            }
            
            let renderedLinesCollection:any = {};
            for(let i = 0; i<selectedNodeIdList.length; i++){
                let node_id = selectedNodeIdList[i];
                let line_package:any = {
                    "size":1
                }
                let line_name:any = "LINE_";
                for(let id=1; id<=4;id++){
                    let cluster_id = all_inverted_index[""+id][node_id];
                    line_package[""+id]=cluster_id;
                    line_name = line_name+cluster_id+"_";
                }
                line_package["name"] = line_name;
                if(Object.keys(renderedLinesCollection).indexOf(line_name)>=0){
                    renderedLinesCollection[line_name]["size"] = renderedLinesCollection[line_name]["size"] + 1;
                }else{
                    renderedLinesCollection[line_name] = line_package;
                }
            }
            let renderedLinesList = Object.keys(renderedLinesCollection).map((d:any)=>{
                return renderedLinesCollection[d];
            });
            for(let i = 0; i<renderedLinesList.length; i++){
                for(let id=1;id<=4;id++){
                    let corr_id = renderedLinesList[i][""+id];
                    if(local_cluster_highlightNodeIdDict[""+id].indexOf(corr_id)>=0){

                    }else{
                        local_cluster_highlightNodeIdDict[""+id].push(corr_id);
                    }
                }
                
            }
            this.cluster_selectedNodeIdIndex = selectedNodeIdList;
            this.cluster_highlightNodeIdDict = local_cluster_highlightNodeIdDict;
            this.cluster_renderedLinesList = renderedLinesList;
            console.log("cluster_highlightNodeIdDict, renderedLinesList, showMode, selectedNodeIdList", this.cluster_highlightNodeIdDict, this.cluster_renderedLinesList, showMode, selectedNodeIdList);
        }else if(this.aggregationMode === 2){
            this.detail_highlightNodeIdList = highlightNodeIdList;
            let renderedLinesList:any [] = [];
            for(let i = 0; i<highlightNodeIdList.length; i++){
                let linepackage:any = {
                    "size":1
                }
                let line_name:any = "LINE_";
                for(let id = 1;id<=4;id++){
                    linepackage[""+id] = highlightNodeIdList[i];
                    line_name = line_name+highlightNodeIdList[i]+"_";
                }
                linepackage["name"] = line_name;
                renderedLinesList.push(linepackage);
            }
            this.detail_renderedLinesList = renderedLinesList;
            console.log("detail_highlightNodeIdList, renderedLinesList", this.detail_highlightNodeIdList, this.detail_renderedLinesList);
        }
        
    }
    public updateFullHighlightStatus(){
        for(let id=1;id<=4;id++){
            this.updateSingleHighlightStatus(id);
        }
    }
    public updateSingleHighlightStatus(id:number){
        if(this.aggregationMode === 1){
            if(this.cluster_highlightNodeIdDict[""+id]){

            }else{
                this.cluster_highlightNodeIdDict[""+id]=[];
            }
            this.updateHighlightStatus(this.cluster_highlightNodeIdDict[""+id], id);
            
        }else if(this.aggregationMode === 2){
            this.updateHighlightStatus(this.detail_highlightNodeIdList, id);
        }
    }
    public updateHighlightNodeIdList(highlightNodeIdList:any, showMode:number=1, rawHighlightNodeIdList:any=[]){
        if(this.aggregationMode === 1){
            this.cluster_rawHighlightNodeIdList = rawHighlightNodeIdList;
            this.detail_rawHighlightNodeIdList = [];
            this.detail_highlightNodeIdList = [];
            this.detail_renderedLinesList = [];
        }else if(this.aggregationMode === 2){
            this.detail_rawHighlightNodeIdList = rawHighlightNodeIdList;
        }
        this.calculateHighlightNodeIdList(highlightNodeIdList, showMode);
        this.updateFullHighlightStatus();
        
    }
    public initialize(filters:any, PCPJson:any){
        this.reset();
        this.filters = filters;
        this.PCPJson = PCPJson;
        //let {filters, PCPJson} = this.props;
        this.selectedNodeList = this.constructSelectedNodeList(filters, PCPJson);
        this.pie_name = PCPJson["pie_name"];
        for(let i = 1; i<=4; i++){
            //this.getDataPackage(i);
            this.CacheDataPackage[""+i] = this.computeDistance(i);
        }
        this.initialize_flag = true;
    }
    public checkinitialize(){
        return this.initialize_flag;
    }
    public reset(){
        this.CacheDataPackage = {};
        this.filters = {};
        this.PCPJson = {};
        this.pie_name = [];
        this.selectedNodeList = [];
        this.initialize_flag = false;

        this.cluster_selectedNodeIdIndex = [];
        this.cluster_highlightNodeIdDict = {};
        this.detail_highlightNodeIdList = [];
        this.cluster_renderedLinesList = [];
        this.detail_renderedLinesList = [];
        this.cluster_rawHighlightNodeIdList = [];
        this.detail_rawHighlightNodeIdList = [];
        this.aggregationMode = 1;
    }
    public reconstructDataPackage(datapackage:any){
        let new_selectedNodeIdIndex = this.cluster_selectedNodeIdIndex;
        let matrix = datapackage["matrix"];
        let selectedNodeList = datapackage["selectedNodeList"];
        let new_selectedNodeList = new_selectedNodeIdIndex.map((d:any)=>{
            return selectedNodeList[d];
        })
        let new_matrix = new_selectedNodeIdIndex.map((i:any)=>{
            return new_selectedNodeIdIndex.map((j:any)=>{
                return matrix[i][j];
            })
        })
        let new_package = {
            ...datapackage,
            "matrix":new_matrix,
            "selectedNodeList":new_selectedNodeList
        }
        return new_package;
    }
    public getDataPackage(showMode:number, aggregationMode:number){
        if(Object.keys(this.CacheDataPackage).indexOf(""+showMode)>=0){
            let aggregation : string = "cluster";
            if(aggregationMode === 1){
                aggregation = "cluster";
                return this.CacheDataPackage[""+showMode][aggregation];
            }else if(aggregationMode === 2){
                aggregation = "detail";
                let cluster_rawNodeNum = this.cluster_selectedNodeIdIndex.length;
                if(cluster_rawNodeNum <= 0){
                    return this.CacheDataPackage[""+showMode][aggregation];
                }else{
                    return this.reconstructDataPackage(this.CacheDataPackage[""+showMode][aggregation])
                }
            }
            
        }else{
            //this.CacheDataPackage[""+showMode] = this.computeDistance(showMode);
            //return this.CacheDataPackage[""+showMode];
            return {}
        }
    }
    public getSquareDistance(array1:any, array2:any){
        let dis = 0;
        for(let i = 0; i < array1.length; i++){
            dis = dis +  Math.pow(Math.abs(array1[i]-array2[i]),2);
        }
        return dis;
    }
    public transformCNtoList(cn:any){
        return [cn.cgt_ngt, cn.cgt_npt, cn.cpt_ngt, cn.cpt_npt];

    }
    public getDistance(selected_node_info_a:any, selected_node_info_b:any, additional_info:any, showMode:number){
        // 1 -> ground truth label / prediction label
        // 2 -> shortest path distance / center neighbor consistency rate.
        // 3 -> shortest path distance train nodes label distribution
        // 4 -> topkfs train nodes label distribution
        let getSquareDistance = this.getSquareDistance;
        let transformCNtoList = this.transformCNtoList;
        let dis:number = 0;
        if(showMode=== 1){
            let columns = ["Ground_Truth_Label", "GCN_Prediction_Label", "GCN(w/o_adj)_Prediction_Label", "GCN(w/o_features)_Prediction_Label"];
        
            for(let i =0 ;i<columns.length; i++){
                if(selected_node_info_a[columns[i]]===selected_node_info_b[columns[i]]){

                }else{
                    dis = dis + 1;
                }
            }

            let conf_a = selected_node_info_a.GCN_Confidence;
            let conf_b = selected_node_info_b.GCN_Confidence;
            dis = dis + Math.pow(Math.abs(conf_a-conf_b), 2);

        }else if(showMode === 2){
            let columns = ["Ground_Truth_Label"];
        
            for(let i =0 ;i<columns.length; i++){
                if(selected_node_info_a[columns[i]]===selected_node_info_b[columns[i]]){

                }else{
                    dis = dis + 1;
                }
            }
           let degree_a = selected_node_info_a.Real_Degree;
           let degree_b = selected_node_info_b.Real_Degree;
           let max_degree = additional_info["max_degree"];
           degree_a = degree_a / max_degree;
           degree_b = degree_b / max_degree;
           dis = dis + Math.pow(Math.abs(degree_a-degree_b), 2);
            let cn_diff = getSquareDistance(transformCNtoList(selected_node_info_a.CN_consistency)
            , transformCNtoList(selected_node_info_b.CN_consistency));
            dis = dis + cn_diff;
        }else if(showMode === 3){
            let columns = ["GCN_Prediction_Label"];
        
            for(let i =0 ;i<columns.length; i++){
                if(selected_node_info_a[columns[i]]===selected_node_info_b[columns[i]]){

                }else{
                    dis = dis + 1;
                }
            }
            let spd_label_diff = getSquareDistance(selected_node_info_a.Spd_node_info, selected_node_info_b.Spd_node_info);
            dis = dis + spd_label_diff;

            /*let distance_a = selected_node_info_a.Shortest_Path_Distance_to_Train_Nodes;
            let distance_b = selected_node_info_b.Shortest_Path_Distance_to_Train_Nodes;
            if(distance_a === "inf"){
                distance_a = 0;
            }else{
                distance_a = 1/(1+distance_a);
            }
            if(distance_b === "inf"){
                distance_b = 0;
            }else{
                distance_b = 1/(1+distance_b);
            }
            dis = dis + (distance_a-distance_b)*(distance_a-distance_b);*/
            let transformed_distance_a = selected_node_info_a.Transformed_Distance;
            let transformed_distance_b = selected_node_info_b.Transformed_Distance;
            dis = dis + (transformed_distance_a-transformed_distance_b)*(transformed_distance_a-transformed_distance_b);



        }else if(showMode === 4){
            let columns = ["GCN_Prediction_Label"];
        
            for(let i =0 ;i<columns.length; i++){
                if(selected_node_info_a[columns[i]]===selected_node_info_b[columns[i]]){

                }else{
                    dis = dis + 1;
                }
            }
            let topk_label_diff = getSquareDistance(selected_node_info_a.Topkfs_node_info, selected_node_info_b.Topkfs_node_info);
            dis = dis + topk_label_diff;
        }
        
        
        
        return Math.sqrt(dis);
    }
    public constructSelectedNodeList(filters:any, PCPJson:any){
        let data = PCPJson.PSData.slice();
        let filterData:any[] = [];
        
        let filters_key = Object.keys(filters);
        const selected = (d:any)=>{
            if(filters_key.length>0){
                for(let i = 0; i< filters_key.length;i ++){
                    if(filters[filters_key[i]].indexOf(d[filters_key[i]])<0){
                        return false;
                    }
                }
                return true;
            }else{
                return true;
            }
        }
        data.forEach((d:any,index:number)=>{
            if(selected(d)){
                let dataInstance = d;
                filterData.push(dataInstance);
            }
        })
        return filterData;
    }
    public aggregateSelectedNodeList(filter_selectedNodeList:any, columns:any, vector_type:any){
        let data_package:any = {};
        if(filter_selectedNodeList.length>=1){
            for(let i = 0; i<columns.length; i++){
                
                let type = vector_type[i];
                let name = columns[i];
                if(type === "categorical"){
                    let distribution :any = {};
                    for(let j = 0; j<filter_selectedNodeList.length; j++){
                        let key = filter_selectedNodeList[j][name];
                        if(Object.keys(distribution).indexOf(key)>=0){
                            distribution[key] = distribution[key] + 1;
                        }else{
                            distribution[key] = 1;
                        }    
                    }
                    let keys = Object.keys(distribution);
                    let max_key = keys[0];
                    let max_num = distribution[max_key];
                    for(let k=1; k<keys.length;k++){
                        if(max_num<distribution[keys[k]]){
                            max_num = distribution[keys[k]];
                            max_key = keys[k];
                        }
                    }
                    data_package[name] = max_key;
                }else if(type === "continuous"){
                    let summation:any = 0;
                    for(let j = 0; j<filter_selectedNodeList.length; j++){
                        let value = filter_selectedNodeList[j][name];
                        summation = summation + value;
                    }
                    let mean = summation / filter_selectedNodeList.length;
                    data_package[name] = mean;
                }else if(type === "dict_continuous"){
                    let new_columns = Object.keys(filter_selectedNodeList[0][name]);

                    let new_vector_type:any[] = [];//["continuous"]
                    for(let j = 0; j<new_columns.length;j++){
                        new_vector_type.push("continuous");
                    }
                    let new_node_list:any = [];
                    for(let j = 0; j<filter_selectedNodeList.length; j++){
                        new_node_list.push(filter_selectedNodeList[j][name]);
                    }
                    //console.log("running filter_selectedNodeList new_vector_type new_columns new_node_list", filter_selectedNodeList, new_vector_type, new_columns, new_node_list);

                    let result_package = this.aggregateSelectedNodeList(new_node_list, new_columns, new_vector_type);
                    data_package[name] = result_package;
                }else if(type === "vector_continuous"){
                    let vector_summation : any[] = [];
                    let vector_length : number = filter_selectedNodeList[0][name].length;
                    for(let j = 0; j<vector_length; j++){
                        vector_summation[j] = 0;
                    }
                    for(let k = 0; k<filter_selectedNodeList.length; k++){
                        for(let j = 0; j<vector_length; j++){
                            vector_summation[j] = vector_summation[j] + filter_selectedNodeList[k][name][j];
                        }
                    }
                    for(let j = 0; j<vector_length; j++){
                        vector_summation[j] = vector_summation[j] / filter_selectedNodeList.length;
                    }
                    data_package[name] = vector_summation;
                }

    
            }
            return data_package;
        }else{
            return data_package;
        }
        
    }
    public transformClusterRoot(root:any, selectedNodeList:any, showMode:any){
        let filter_selectedNodeList:any[] = [];
        let id_list = root.id_list;
        let raw_id_list:any[] = [];
        for(let i = 0; i<id_list.length; i++){
            filter_selectedNodeList.push(selectedNodeList[id_list[i]]);
        }
        for(let i = 0; i<id_list.length; i++){
            raw_id_list.push(filter_selectedNodeList[i]["Data_id"]);
        }
        if(showMode === 1){
            let columns = ["Ground_Truth_Label", "GCN_Prediction_Label", "GCN(w/o_adj)_Prediction_Label", "GCN(w/o_features)_Prediction_Label", "GCN_Confidence"];
            let vector_type = ["categorical", "categorical", "categorical", "categorical", "continuous"];
            
            let data_package:any = {};
            data_package = this.aggregateSelectedNodeList(filter_selectedNodeList, columns, vector_type);
            let color:any = [getCoraNodeColor(data_package["Ground_Truth_Label"], 2), 
                getCoraNodeColor(data_package["GCN_Prediction_Label"],3),
                getCoraNodeColor(data_package["GCN(w/o_adj)_Prediction_Label"],3),
                getCoraNodeColor(data_package["GCN(w/o_features)_Prediction_Label"],3),
                "#fff"
            ]; 
            data_package["Color"]=color;
            data_package["id_list"] = id_list;
            data_package["raw_id_list"] = raw_id_list;
            data_package["size"] = id_list.length;
            return data_package;
        }else if(showMode === 2){
            // Ground truth, real degree, cn_1, cn_2, cn_3, cn_4
            let columns = ["Ground_Truth_Label", "Real_Degree", "CN_consistency"];
            let vector_type = ["categorical", "continuous", "dict_continuous"];
            let data_package:any = {};
            data_package = this.aggregateSelectedNodeList(filter_selectedNodeList, columns, vector_type);
            let color:any = [getCoraNodeColor(data_package["Ground_Truth_Label"], 2), 
                "#fff",
                "#fff",
                "#fff",
                "#fff"
            ]; 
            data_package["Color"]=color;
            data_package["id_list"] = id_list;
            data_package["raw_id_list"] = raw_id_list;
            data_package["size"] = id_list.length;
            return data_package;
            //this.vector_type = ["categorical", "continuous", "continuous", "continuous", "continuous", "continuous"];
        }else if(showMode === 3){
            // prediction label, SPD INFO
            let columns = ["GCN_Prediction_Label", "Spd_node_info","Transformed_Distance"];
            let vector_type = ["categorical",  "vector_continuous","continuous"];
            let data_package:any = {};
            data_package = this.aggregateSelectedNodeList(filter_selectedNodeList, columns, vector_type);
            let color:any = ["#fff", 
                getCoraNodeColor(data_package["GCN_Prediction_Label"], 3),
                "#fff",
                "#fff",
                "#fff"
            ]; 
            data_package["Color"]=color;
            data_package["id_list"] = id_list;
            data_package["raw_id_list"] = raw_id_list;
            data_package["size"] = id_list.length;
            return data_package;
        }else if(showMode === 4){
            // predication label, topkfs
            //this.vector_type = ["categorical"];
            let columns = ["GCN_Prediction_Label","Topkfs_node_info"];
            let vector_type = ["categorical", "vector_continuous"];
            let data_package:any = {};
            data_package = this.aggregateSelectedNodeList(filter_selectedNodeList, columns, vector_type);
            // ** Problematic
            if(filter_selectedNodeList.length>=1){
                let total_topkfs_nodes:any[] = [];
                for(let i = 0; i<filter_selectedNodeList.length; i++){
                    total_topkfs_nodes = total_topkfs_nodes.concat(filter_selectedNodeList[i]["Topkfs_nodes"]);
                }
                total_topkfs_nodes.sort((a:any,b:any)=>{
                    return a.anchor_similarity>b.anchor_similarity?-1:1
                })
                let topkfs_nodes = total_topkfs_nodes.slice(0,5);
                topkfs_nodes.sort((a:any,b:any)=>{
                    return a.anchor_label<b.anchor_label?-1:1
                })
                data_package["Topkfs_nodes"] = topkfs_nodes;

            }
            let color:any = ["#fff", 
                getCoraNodeColor(data_package["GCN_Prediction_Label"], 3),
                "#fff",
                "#fff",
                "#fff"
            ]; 
            data_package["Color"]=color;
            data_package["id_list"] = id_list;
            data_package["raw_id_list"] = raw_id_list;
            data_package["size"] = id_list.length;
            return data_package;
        }
        return {}
    }
    public computeDistanceMatrix(selectedNodeList:any, additional_info:any, showMode:any){
        let matrix : any [] = [];
        let getDistance = this.getDistance;
        for(let i = 0; i<selectedNodeList.length; i++){
            let matrix_row:any[] = [];
            for(let j = 0; j<selectedNodeList.length; j++){
                matrix_row.push(getDistance(selectedNodeList[i], selectedNodeList[j], additional_info, showMode));
            }
            matrix.push(matrix_row);
        }
        return matrix;
    }



    public renderLines(enableLines:any,  width:number, height:number){
        if(enableLines){
            //let highlightNodeIdList = this.highlightNodeIdList;
            //let highlightNodeIdList = this.state.highlightNodeIdList;
            let data_list = [];
            
            let all_data = [];
            
            for(let id = 1; id<=4; id++){
                let highlightNodeIdList:any; 
                if(this.aggregationMode === 1){
                    highlightNodeIdList = this.cluster_highlightNodeIdDict[""+id];
                }else{
                    highlightNodeIdList = this.detail_highlightNodeIdList;
                }
                
                var top_svg = d3.select("#"+"ScatterPlot_sub_"+id);
                var svg = top_svg.select("g");
                var nodes = svg.selectAll("g.nodes");
                var point_array_data:any = {};
                nodes.data().forEach((d:any)=>{
                    if(highlightNodeIdList.indexOf(d.data.Data_id)>=0){
                        point_array_data[d.data.Data_id] = {
                            "x":d.x,
                            "y":d.y
                        }
                    }else{
                    }
                })
                all_data.push({
                    "id":id,
                    "point_array":point_array_data
                });
            }
            
            let marginLeft = 20, marginRight = 20;
            let marginTop = 20, marginBottom = 62;
            let projectionHeight = height - marginBottom - marginTop;
            let gap = 10;
            let projectionWidth = (width - marginLeft - marginRight) / 4  - gap;
            let successflag = true;
            let renderedLinesList:any[] = [];
            if(this.aggregationMode === 1){
                renderedLinesList = this.cluster_renderedLinesList;
            }else if(this.aggregationMode === 2){
                renderedLinesList = this.detail_renderedLinesList;
            }
            for(let i = 0; i<renderedLinesList.length; i++){
                //let node_id = highlightNodeIdList[i];
                let line_package = renderedLinesList[i];
                let coords = [];
                for(let j = 0 ; j<all_data.length; j++){
                    let id = j+1;
                    let node_id = line_package[""+id];
                    if(all_data[j]["point_array"][node_id]){
                        let startX = marginLeft + (j)*(projectionWidth+gap);
                        let startY = marginTop;
                        let new_x = all_data[j]["point_array"][node_id]["x"] + startX;
                        let new_y = all_data[j]["point_array"][node_id]["y"] + startY;
                        let new_coords = [new_x, new_y];
                        coords.push(new_coords);
                    }else{
                        successflag = false;
                        break;
                    }
                    
                }
                if(!successflag){
                    break;
                }
                data_list.push({
                    "line_package":line_package,
                    "coords": coords
                })
            }
            
            
            if(!successflag){
                data_list = [];
            }
            //console.log("data list", data_list);
            
            var connectionPath = d3.select("#connectionPath");
            if(connectionPath){
                var lines = connectionPath.selectAll("path")
                .data(data_list, function(d:any){
                    return d.line_package.name;
                })
                //console.log("line enter, update, exit", lines.enter(), lines, lines.exit());
                //var lineGenerator = d3.line().curve(d3.curveMonotoneY)
                var lineGenerator = d3.line().curve(d3.curveNatural);
                let constructPointStr = (d:any)=>{
                    /*let str = "";
                    for(let i = 0 ; i<d.coords.length; i++){
                        let point = d.coords[i];
                        str = str + point[0]+","+point[1]+" ";
                    }
                    return str;*/
                    return lineGenerator(d.coords.slice());
                }
               
                var line_enter = lines.enter().append("path");
                var line_enter_update = line_enter.merge(lines);
                lines.exit().remove();
                line_enter_update.attr("d", constructPointStr)
                .style("fill","none")
                .style("stroke","#999")
                .style("stroke-width",(d:any)=>{
                    return 1.5*Math.sqrt(d.line_package.size)
                })
                .style("opacity", 0.5)
                ;
            }
           
        }
        
    }


    public updateHighlightStatus(highlightNodeIdList:any, id:number){
        /**
         * Description:
         * According to the this.props.highlightNodeIdList, it will update the style of the corresponding nodes.
         * HighlightNodes : 
         * Style: 
         *      lasso_selected -> true,
         *      lasso_unsekected -> false
         * OtherNodes: 
         * Style:
         *      lasso_not_possible -> false,
         *      lasso_possible -> false,
         *      lasso_selected -> false,
         *      If there are highlight nodes, lasso_unselected -> true,
         *      else: lasso_unselected -> false
         */
        //let highlightNodeIdList = this.props.highlightNodeIdList;
        var top_svg = d3.select("#"+"ScatterPlot_sub_"+id);
        var svg = top_svg.select("g");
        var nodes = svg.selectAll("g.nodes")
        var selectedNodes = nodes.filter((d:any)=>{
            if(highlightNodeIdList.indexOf(d.data.Data_id)>=0){
                d.selected = true;
                return true;
            }else{
                d.selected = false;
                return false;
            }
        })
        nodes
            .classed("lasso_not_possible",false)
            .classed("lasso_possible",false)
            .classed("lasso_selected",false)
            ;
        if(highlightNodeIdList.length>0){
            nodes.classed("lasso_unselected", true);
        }else{
            nodes.classed("lasso_unselected",false);
        }
        // Style the selected dots
        selectedNodes
            .classed("lasso_unselected", false)
            .classed("lasso_selected",true)
            
        
    }









    public constructInvertedIndex(selectedNodeList:any){
        let invertedIndex : any = {

        }
        for(let i = 0; i<selectedNodeList.length; i++){
            let id = selectedNodeList[i]["Data_id"];
            let corresponding_id_list = selectedNodeList[i]["id_list"];
            for(let j = 0; j<corresponding_id_list.length; j++){
                invertedIndex[corresponding_id_list[j]] = id;
            }
        }
        return invertedIndex;
    }

    public computeDistance(showMode:any){
        /*if(!this.checkinitialize()){
            console.log("not initialized");
            return {}
        }*/
        let getDistance = this.getDistance;
        let transformCNtoList = this.transformCNtoList;
        //let filters = this.filters;
        //let PCPJson = this.PCPJson;
        let pie_name = this.pie_name;
        let selectedNodeList = this.selectedNodeList;
        //let {filters, PCPJson} = this.props;
        //let selectedNodeList = this.constructSelectedNodeList(filters, PCPJson);
        //if(selectedNodeList.length>=300){
        //    return ;
        //}
        var matrix:any[] = [];
        var cluster_matrix:any[] = [];
        var vectors:any[] = [];
        var cluster_selectedNodeList:any[] = [];
        
        let max_shortest_path_distance = 0;
        let max_degree = 1;
        let additional_info:any = {}
        for(let i = 0; i<selectedNodeList.length; i++){
            // Statistics
            let spd:any = selectedNodeList[i].Shortest_Path_Distance_to_Train_Nodes;
            if(spd!== "inf"){
                if(spd>max_shortest_path_distance){
                    max_shortest_path_distance=spd;
                }
            }
            let degree = selectedNodeList[i].Real_Degree;
            if(degree>max_degree){
                max_degree = degree;
            }

            // Augmented
            selectedNodeList[i]["size"]=1;
            selectedNodeList[i]["id_list"] = [selectedNodeList[i]["Data_id"]];
            selectedNodeList[i]["raw_id_list"] = [selectedNodeList[i]["Data_id"]];
        }
        additional_info["max_shortest_path_distance"] = max_shortest_path_distance;
        additional_info["max_degree"] = max_degree;
        additional_info["pie_name"] = pie_name;
        matrix = this.computeDistanceMatrix(selectedNodeList, additional_info, showMode);
        
        if(showMode === 1){
            let columns = ["Ground_Truth_Label", "GCN_Prediction_Label", "GCN(w/o_adj)_Prediction_Label", "GCN(w/o_features)_Prediction_Label", "GCN_Confidence"];
            for(let i = 0; i<selectedNodeList.length; i++){
                let vector = [];
                let selectednode = selectedNodeList[i];
                for(let j = 0; j<columns.length; j++){
                    vector.push(selectednode[columns[j]]);
                }
                vectors.push(vector);
            }
        }else if(showMode === 2){
            let columns = ["Ground_Truth_Label"];
            for(let i = 0; i<selectedNodeList.length; i++){
                let vector:any = [];
                let selectednode = selectedNodeList[i];
                vector.push(selectednode[columns[0]]);
                vector.push(selectednode.Real_Degree);
                vector = vector.concat(transformCNtoList(selectednode.CN_consistency));
                vectors.push(vector);
            }
        }else if(showMode === 3){
            let columns = ["GCN_Prediction_Label"];
            for(let i = 0; i<selectedNodeList.length; i++){
                let vector:any = [];
                let selectednode = selectedNodeList[i];
                
                vector.push(selectednode[columns[0]]);
                vector = vector.concat(selectednode.Spd_node_info);
                vectors.push(vector);
            }
        }else if(showMode === 4){
            let columns = ["GCN_Prediction_Label"];
            for(let i = 0; i<selectedNodeList.length; i++){
                let vector:any = [];
                let selectednode = selectedNodeList[i];
                
                vector.push(selectednode[columns[0]]);
                vector = vector.concat(selectednode.Topkfs_node_info);
                vectors.push(vector);
            }
            
        }
        let limit_distance = 0.5;
        let hcluster = new HCluster(showMode);
        hcluster.setlinkage("complete");
        hcluster.setDistMatrix(matrix);
        let root = hcluster.cluster(vectors,limit_distance);
        let FilterData:any = [];
        for(let i = 0; i<root.length; i++){
            let data_package = this.transformClusterRoot(root[i], selectedNodeList, showMode);
            data_package["Data_id"] = i;
            FilterData.push(data_package);
        }
        cluster_selectedNodeList = FilterData;
        cluster_matrix = this.computeDistanceMatrix(cluster_selectedNodeList, additional_info, showMode);
        let invertedIndex :any = this.constructInvertedIndex(cluster_selectedNodeList);
        return {
            "cluster":{
                "mode": "cluster",
                "additional_info":additional_info,
                "matrix":cluster_matrix,
                "selectedNodeList":cluster_selectedNodeList,
                "highlightNodeIdList":[],
                "invertedIndex":invertedIndex
            },
            "detail":{
                "mode": "detail",
                "additional_info":additional_info,
                "matrix":matrix,
                "selectedNodeList":selectedNodeList,
                "highlightNodeIdList":[]
            }
            
        }

    }
}