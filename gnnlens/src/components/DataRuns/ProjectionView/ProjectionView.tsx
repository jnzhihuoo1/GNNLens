import * as React from 'react';
import { Select} from 'antd';
import "./ProjectionView.css";
import {getCoraNodeColor, compareSelectedNodeIdList} from '../../../helper';
import { UMAP } from 'umap-js';
import { min } from 'd3-array';


//import { SELECTED_MESSAGE_PASSING_NODE_ID_LIST_CHANGE } from '../../../constants';
//import reorder from '../FeatureMatrixView/reorder.v1';
const d3 = require("d3");
//const mds = require("./mdsjs.js");
const d3_lasso = require("./d3-lasso.js");
const tsnejs = require("./tsne.js");

const Option = Select.Option;

const legend_line_style = {
    "stroke":"#bbb",
    "stroke-width":2,
    "stroke-dasharray":"2,3"
} 

export interface ProjectionViewProps {
    id:number,
    refreshnumber:number,
    filters:any,
    PCPJson:any,
    changeSelectedNodeIdList: any,
    width:number,
    height: number,
    showSource:boolean,
    changeShowSource:any,
    selectedNodeIdList:any,
    showMode:number,
    x:number,
    y:number,
    name:string,
    onChangeHighLightNodeIdList:any,
    onChangeHoveredNodeIdList:any,
    renderLines:any,
    dataPackage:any,
    updateSingleHighlightNodeStatus:any,
    enableLegends:boolean,
    layoutMode:number
}

export interface ProjectionViewState {
    

}

export default class ProjectionView extends React.Component<ProjectionViewProps, ProjectionViewState> {
    public point_array:any[] = [];
    public additional_info:any = {};
    public model:any = {};
    //public showMode: number = 1; 
    // 1 -> ground truth label / prediction label
    // 2 -> shortest path distance / center neighbor consistency rate.
    // 3 -> shortest path distance train nodes label distribution
    // 4 -> topkfs train nodes label distribution
    constructor(props: ProjectionViewProps) {
        super(props);
        this.mappingGraph = this.mappingGraph.bind(this);
        this.onSelectedNodeListChange = this.onSelectedNodeListChange.bind(this);
        this.onShowModeChange = this.onShowModeChange.bind(this);
        this.handleTitleMouseOut = this.handleTitleMouseOut.bind(this);
        this.handleTitleMouseMove = this.handleTitleMouseMove.bind(this);
        this.handleGlyphMouseMove = this.handleGlyphMouseMove.bind(this);
        this.handleGlyphMouseOut = this.handleGlyphMouseOut.bind(this);
        this.state = {
            showMode: 1
        };
    }
    componentDidMount(){
        this.renderD3();
    }
    componentDidUpdate(prevProps:ProjectionViewProps, prevState:ProjectionViewState){
        if(!compareSelectedNodeIdList(prevProps.selectedNodeIdList,this.props.selectedNodeIdList) || 
                prevProps.dataPackage["mode"]!==this.props.dataPackage["mode"] ){
            //this.onSelectedNodeListChange(this.props.selectedNodeIdList);
            this.renderD3();
            return;
        }else{
            if( prevProps.showMode !== this.props.showMode || prevProps.layoutMode !== this.props.layoutMode){
                this.renderD3();
                return;
            }
        }
        if(prevProps.enableLegends !== this.props.enableLegends){
            this.renderInViewLegend();
            return;
        }
        //if(!compareSelectedNodeIdList(prevProps.highlightNodeIdList, this.props.highlightNodeIdList)){
            //this.updateHighlightStatus();
        //}
        
    }
    
    public onSelectedNodeListChange(selectedNodeList:any, highlightNodeIdList:any, showMode:number){
        this.props.onChangeHighLightNodeIdList(selectedNodeList, highlightNodeIdList, showMode);
    } 
    public onHoveredNodeListChange(rawNodeList:any, hoveredNodeIdList:any, showMode:number){
        this.props.onChangeHoveredNodeIdList(rawNodeList, hoveredNodeIdList, showMode);
    } 
    public hiddenTooltip(){
        d3.select("#tooltip_proj").style('opacity', 0);
    }
    public handleTitleMouseOut(e:any){
       this.hiddenTooltip();
    }
    public handleGlyphMouseOut(e:any){
       this.hiddenTooltip();
       let showMode = this.props.showMode;
       this.onHoveredNodeListChange([], [], showMode);

    }
    public constructPathOnNodeList(nodelist:any){
        let path = "";
        for(let i = 0; i<nodelist.length;i++){
            let note = "M";
            if(i>0){
                note = "L"
            }
            path = path+note+nodelist[i][0]+" "+nodelist[i][1]+" ";
        }
        return path;

    }
    public getArc(radius:number){
        return d3.arc()
        .innerRadius(radius)
        .outerRadius(radius*2);
    }
    
    public getVariableArc(radius:number, outer_radius:number){
        return d3.arc()
        .innerRadius(radius)
        .outerRadius(outer_radius);
    }
    public getArcConf(radius:number, stroke_width:number){
        return d3.arc()
        .innerRadius(radius)
        .outerRadius(stroke_width+radius);
    }
    public getSizeScale(size:number){
        return Math.sqrt(1+Math.log(size)) ; 
    }
    /**
     * Render Glyph GT+3PT
     * @param nodes 
     * @param node_enter 
     * @param radius_gap 
     * @param radius 
     * @param scale 
     */
    public renderGlyphGT3PT(nodes:any,node_enter:any,radius_gap:number,radius:number,additional_info:any,scale:number=1,enable_size:boolean=false){
        // 1 -> ground truth label / prediction label
        let getArc = this.getArc;
        let getArcConf = this.getArcConf;
        let getSizeScale = this.getSizeScale;
        let inner_radius = radius - radius_gap;
        var outer_circles_enter = node_enter.append("circle").attr("class","proj_outer_circle");
        var outer_circles = nodes.select("circle.proj_outer_circle");
        var outer_circles_enter_update = outer_circles_enter.merge(outer_circles);
        let pie_name = additional_info["pie_name"];
        let key_model_name = pie_name[0];
        let fill_color_index = pie_name.length + 1;
        let models_length = pie_name.length;
        // TODOS:
        outer_circles_enter_update//.transition(trans)
                    .attr("r", function(d:any){
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                        return radius*scale*s_scale*2;
                    })
                    .attr("fill", function(d:any) { return d.data.Color[fill_color_index]; });
        /*
        var arc_data = [{
            "index":0,
            "value":1/3
        }, {
            "index":1,
            "value":1/3
        }, {
            "index":2,
            "value":1/3
        }];*/
        var arc_data:any = [];
        for(let i = 0; i<models_length; i++){
            arc_data.push({
                "index":i,
                "value":1/models_length
            })
        }
        let startAngle = -180 / models_length;
        var ori_arcs = d3.pie()
        .startAngle((startAngle/180) * Math.PI)
        .endAngle((2+startAngle/180) * Math.PI)
        .value(function(a:any){
            return a.value;
        })
        .sort(function(a:any, b:any) {
            return a.index<b.index;
        });
        var arcs = ori_arcs(arc_data);
        let overall_background = [];
        for (let i = 0; i < models_length; i++){
            let background_enter = node_enter.append("path").attr("class","arc_"+i)
            let background = nodes.select("path.arc_"+i);
            let background_enter_update  = background_enter.merge(background);
            background_enter_update
            .style("fill", function(d:any){
                return d.data.Color[i+1]
            })
            .style("stroke","#bbb")
            .style("stroke-width",1)
            .attr("d", function(d:any){
                let s_scale = 1;
                if(enable_size){
                    s_scale = getSizeScale(d.data.size);
                }
                return getArc(radius*scale*s_scale)(arcs[i])
            });
            overall_background.push(background_enter_update);

        }

        var ori_arcs_conf = d3.pie()
        .startAngle((0/180) * Math.PI)
        .endAngle((2-0/180) * Math.PI)
        .value(function(a:any){
            return a.value;
        })
        .sort(function(a:any, b:any) {
            return a.index<b.index;
        });

        let overall_background_conf = [];
        let outer_radius = 2*radius + 2;
        let stroke_width = 1;
        for (let i = 3; i < 5; i++){
            let background_enter = node_enter.append("path").attr("class","carc_"+i)
            let background = nodes.select("path.carc_"+i);
            let background_enter_update  = background_enter.merge(background);
            background_enter_update
            .style("fill", function(d:any){
                if(i===3){
                    return "#000";
                }else if(i===4){
                    return "#fff";
                }
                //return getCoraNodeColor(i,2);
            })
            .attr("d", function(d:any){
                var arc_data =[
                    {
                        "index":0,
                        "value":d.data[key_model_name+"_Confidence"]
                    },
                    {
                        "index":1,
                        "value":1 - d.data[key_model_name+"_Confidence"]
                    }
                ] ;
                
                
                var arcs = ori_arcs_conf(arc_data);
                let s_scale = 1;
                if(enable_size){
                    s_scale = getSizeScale(d.data.size);
                }
                return getArcConf(outer_radius*scale*s_scale, stroke_width*scale*s_scale)(arcs[i-3])
            });
            overall_background_conf.push(background_enter_update);

        }
        var inner_circles_enter = node_enter.append("circle").attr("class","inner_circle");
        var inner_circles = nodes.select("circle.inner_circle");
        var inner_circles_enter_update = inner_circles_enter.merge(inner_circles);
        
        inner_circles_enter_update//.transition(trans)
        .attr("r", function(d:any){
            let s_scale = 1;
            if(enable_size){
                s_scale = getSizeScale(d.data.size);
            }
            return inner_radius*scale*s_scale;
        })
        .attr("fill", function(d:any) { return d.data.Color[0]; });
        
    }
    /**
     * Render Legend GT + 3PT
     * @param legend_svg 
     * @param refresh_number 
     * @param radius_gap 
     * @param radius 
     */
    public renderLegendGT3PT(legend_svg:any, refresh_number:number, radius_gap:number, radius:number, legend_configuration:any, additional_info:any){
        let constructPathOnNodeList = this.constructPathOnNodeList;
        let pie_name = additional_info["pie_name"];
        let key_model_name = pie_name[0]
        // Define Variable
        let legend_x = legend_configuration["legend_x"];
        let legend_y = legend_configuration["legend_y"];
        let legned_scale = legend_configuration["legend_scale"];
        let legend_Color = legend_configuration["legend_Color"];
        
        let legend_conf = legend_configuration["legend_conf"];
        let key_model_confidence = key_model_name+"_Confidence";
        
        let models_length = pie_name.length;
        let last_fill_index = models_length + 1;
        let legend_data_point:any = {
            "data":{
                "Color": legend_Color,
                "Data_id": refresh_number
            }
        }
        legend_data_point["data"][key_model_confidence] = legend_conf;
        let legend_text_setting = legend_configuration["legend_text_setting"]
        
        let outer_radius = 2*radius + 2;
        let stroke_width = 1;
        
        let legend_pie_all = legend_svg.selectAll("g.legend_pie")
                        .data([legend_data_point], function(d:any){
                            return d.data.Data_id;
                        });
            legend_pie_all.exit().remove();
        let legend_pie = legend_pie_all.enter().append("g")
                        .attr("class", "legend_pie")
                        .attr("transform", "translate("+legend_x+","+legend_y+")")
        this.renderGlyphGT3PT(legend_pie_all, legend_pie, radius_gap, radius, additional_info, legned_scale);
        

        // ----- Render Legend Text
        for(let i = 0; i<models_length; i++){
            //overall_background.push(background_enter_update);

            let start_point = [1.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 1.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))]
            let middle_point = [1.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 4.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]

            if(i===1){
                middle_point= [4.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 4.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]
            }else{

            }
            let end_point = [4.5*legned_scale*radius*Math.sin((+60)/180*Math.PI) ,4.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]

            legend_pie.append("path")
                .attr("stroke", legend_line_style["stroke"])
                .attr("stroke-width", legend_line_style["stroke-width"])
                .style("stroke-dasharray",legend_line_style["stroke-dasharray"])
                .attr("d", constructPathOnNodeList([start_point,middle_point, end_point]))
                .attr("fill", "none")
            legend_pie.append("text")
                .attr("x", end_point[0])
                .attr("y", end_point[1])
                .attr("text-anchor", legend_text_setting[i+1]["text-anchor"])
                .attr("dominant-baseline", legend_text_setting[i+1]["dominant-baseline"])
                .text(legend_text_setting[i+1]["text"])
        }
        
    
        let gt_x = 4.5*legned_scale*radius*Math.sin((+60)/180*Math.PI);
        let gt_y = 4.5*legned_scale*radius*(-Math.cos((+60)/180*Math.PI))+legend_text_setting[0]["y_offset"];
        legend_pie.append("line")
                .attr("stroke", legend_line_style["stroke"])
                .attr("stroke-width", legend_line_style["stroke-width"])
                .style("stroke-dasharray",legend_line_style["stroke-dasharray"])
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", gt_x)
                .attr("y2", gt_y);
        legend_pie.append("text")
                .attr("x", gt_x)
                .attr("y", gt_y)
                .attr("text-anchor", legend_text_setting[0]["text-anchor"])
                .attr("dominant-baseline", legend_text_setting[0]["dominant-baseline"])
                .text(legend_text_setting[0]["text"])
        gt_x = 3.5*legned_scale*radius*Math.sin((+90)/180*Math.PI);
        gt_y = 3.5*legned_scale*radius*(-Math.cos((+90)/180*Math.PI))+legend_text_setting[last_fill_index]["y_offset"];
        legend_pie.append("line")
                .attr("stroke", legend_line_style["stroke"])
                .attr("stroke-width", legend_line_style["stroke-width"])
                .style("stroke-dasharray",legend_line_style["stroke-dasharray"])
                .attr("x1", outer_radius*legned_scale + (stroke_width/2)*legned_scale)
                .attr("y1", 0)
                .attr("x2", gt_x)
                .attr("y2", gt_y);
        legend_pie.append("text")
                .attr("x", gt_x)
                .attr("y", gt_y)
                .attr("text-anchor", legend_text_setting[last_fill_index]["text-anchor"])
                .attr("dominant-baseline", legend_text_setting[last_fill_index]["dominant-baseline"])
                .text(legend_text_setting[last_fill_index]["text"])
        
    }
    public renderGlyphDEGCN(nodes:any,node_enter:any,radius:number,additional_info:any, scale:number=1,enable_size:boolean=false){
        //let max_shortest_path_distance = additional_info["max_shortest_path_distance"] + 1;
        let getSizeScale = this.getSizeScale;
        let max_degree = additional_info["max_degree"];
        function getXY(value:number, i:number, nclass:number, polyradius:number){
            return [value*polyradius*Math.sin(i/nclass*Math.PI*2), -value*polyradius*Math.cos(i/nclass*Math.PI*2)];
        }
        function constructPointStrFromData(dataValues:any, polyradius:number){
            let coordinates:any[] = [];
            let nclass = dataValues.length;
            for(let i = 0 ; i<nclass; i ++){
                coordinates.push(getXY(dataValues[i], i, nclass, polyradius));
            }
            let pointstr = "";
            for(var pti=0;pti<coordinates.length;pti++){
                pointstr=pointstr+coordinates[pti][0]+","+coordinates[pti][1]+" ";
              }
            return pointstr;
        }
        function constructPointStr(d:any){
            let dataValues:any[] = [];
           let degree = d.data.Real_Degree;
            dataValues.push(degree / max_degree);
            dataValues.push(d.data.CN_consistency.cgt_ngt);
            dataValues.push(d.data.CN_consistency.cgt_npt);
            dataValues.push(d.data.CN_consistency.cpt_ngt);
            dataValues.push(d.data.CN_consistency.cpt_npt);
            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
            let polyradius = radius * 2 * scale*s_scale;

            return constructPointStrFromData(dataValues, polyradius);
        }
        var outer_circles_enter = node_enter.append("circle").attr("class","proj_outer_circle");
        var outer_circles = nodes.select("circle.proj_outer_circle");
        var outer_circles_enter_update = outer_circles_enter.merge(outer_circles);
        outer_circles_enter_update//.transition(trans)
                    .attr("r", function(d:any){
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                        return radius*2*scale*s_scale
                    })
                    .attr("fill", function(d:any) { return d.data.Color[d.data.Color.length-1]; });
        /*var outer_polygon_enter = node_enter.append("polygon").attr("class", "sp_polygon_outer");
        var outer_polygons = nodes.select("polygon.sp_polygon_outer");
        var outer_polygon_enter_update = outer_polygon_enter.merge(outer_polygons);
        outer_polygon_enter_update
        .attr("points",function(d:any){return constructPointStrFromData([1,1,1,1,1])})
        .style("fill", function(d:any){return d.data.Color[4];})
        .style("stroke-width","1.5px")
        .style("stroke","#bbb");*/
        
        for(let i = 0; i<5; i++){
            
            var bg_line_enter = node_enter.append("line").attr("class","background_line_"+i);
            var bg_lines = nodes.select("line.background_line_"+i);
            var bg_line_enter_update = bg_line_enter.merge(bg_lines);
            bg_line_enter_update//.transition(trans)
                        .attr("x1", 0)
                        .attr("y1", 0)
                        .attr("x2", (d:any)=>{
                            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                            let polyradius = radius * 2 * scale * s_scale;
                            let XY = getXY(1,i,5,polyradius);
                            return XY[0];
                        })
                        .attr("y2", (d:any)=>{
                            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                            let polyradius = radius * 2 * scale * s_scale;
                            let XY = getXY(1,i,5,polyradius);
                            return XY[1];
                        })
                        .style("stroke", "#bbb")
                        .style("stroke-width", 2)
                        .style("stroke-dasharray","1,1");
        }
        var polygon_enter = node_enter.append("polygon").attr("class","sp_polygon");
        var polygons = nodes.select("polygon.sp_polygon");
        var polygon_enter_update = polygon_enter.merge(polygons);
        polygon_enter_update
        .attr("points",constructPointStr)
        .style("fill", function(d:any){return d.data.Color[0]})
    }
    public renderLegendDEGCN(legend_svg:any, refresh_number:number, radius:number, additional_info:any, legend_configuration:any){
        let constructPathOnNodeList = this.constructPathOnNodeList;
        let legend_x = legend_configuration["legend_x"];
        let legend_y = legend_configuration["legend_y"];
        let legend_scale = legend_configuration["legend_scale"];
        let legend_Color = legend_configuration["legend_Color"];
        let legend_text_setting = legend_configuration["legend_text_setting"];
        let legend_data_point:any = {
            "data":{
                "Color": legend_Color,
                "Data_id": refresh_number,
                "Real_Degree": legend_configuration["legend_degree"],
                "CN_consistency": legend_configuration["legend_CN_consistency"]
            }
        }
        let legend_pie_all = legend_svg.selectAll("g.legend_pie")
                        .data([legend_data_point], function(d:any){
                            return d.data.Data_id;
                        });
            legend_pie_all.exit().remove();
        let legend_pie = legend_pie_all.enter().append("g")
                        .attr("class", "legend_pie")
                        .attr("transform", "translate("+legend_x+","+legend_y+")")
        
        
        this.renderGlyphDEGCN(legend_pie_all, legend_pie, radius, additional_info, legend_scale);

        // ----- Render Legend Text
        for(let i = 0; i<5; i++){
            let start_point = [2*legend_scale*radius*Math.sin((+72*i)/180*Math.PI), 2*legend_scale*radius*(-Math.cos((+72*i)/180*Math.PI))]
            let middle_point = [2*legend_scale*radius*Math.sin((+72*i)/180*Math.PI), 4.5*legend_scale*radius*(-Math.cos((+72*i)/180*Math.PI))+legend_text_setting[i]["y_offset"]]
            let end_point = [4.5*legend_scale*radius*Math.sin((+72)/180*Math.PI) ,4.5*legend_scale*radius*(-Math.cos((+72*i)/180*Math.PI))+legend_text_setting[i]["y_offset"]]
            legend_pie.append("path")
                .attr("stroke", legend_line_style["stroke"])
                .attr("stroke-width", legend_line_style["stroke-width"])
                .style("stroke-dasharray",legend_line_style["stroke-dasharray"])
                .attr("d", constructPathOnNodeList([start_point,middle_point, end_point]))
                .attr("fill", "none");
            legend_pie.append("text")
                .attr("x", end_point[0])
                .attr("y", end_point[1])
                .attr("text-anchor", legend_text_setting[i]["text-anchor"])
                .attr("dominant-baseline", legend_text_setting[i]["dominant-baseline"])
                .text(legend_text_setting[i]["text"])
        }

    }

    public renderGlyphP1SPD(nodes:any,node_enter:any,radius:number,rect_scale:number,num_class:number, scale:number=1,enable_size:boolean=false){
        let rect_width = radius*rect_scale/2*scale;
        let rect_height = radius*rect_scale*scale;
        let getSizeScale = this.getSizeScale;
        let constructPathOnNodeList = this.constructPathOnNodeList;
        var outer_rects_enter = node_enter.append("rect").attr("class","gnn_outer_rects");
        var outer_rects = nodes.select("rect.gnn_outer_rects");
        var outer_rects_enter_update = outer_rects_enter.merge(outer_rects);
        outer_rects_enter_update//.transition(trans)
                    .attr("x",(d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                        return -rect_width*s_scale;
                    })
                    .attr("y",(d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                        return -rect_height / 2 * s_scale;
                    } )
                    .attr("width", (d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                        return s_scale * rect_width * 2
                    })
                    .attr("height", (d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                        return rect_height * s_scale;
                    })
                    .attr("fill", function(d:any) { 
                        return d.data.Color[d.data.Color.length-1]; });
                    //.style("stroke","#bbb")
                    //.style("stroke-width",1);
        let rect_gap = 0.25;
        let gnnrect_enter = node_enter.append("rect").attr("class","gnnrect");
        let gnnrects = nodes.select("rect.gnnrect");
        let gnnrect_enter_update = gnnrect_enter.merge(gnnrects);
        gnnrect_enter_update
        .attr("x",(d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
            return -rect_width*s_scale;
        })
        .attr("y",(d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
            return -rect_height / 2 * s_scale;
        } )
        .attr("width", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return s_scale * rect_width - rect_gap;
        })
        .attr("height", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return rect_height * s_scale;
        })
        .attr("fill", function(d:any){return d.data.Color[1]});



        //.style("stroke","#bbb")
        //.style("stroke-width",1);
        for(let i = 0; i<num_class; i++){
            let rect_enter = node_enter.append("rect").attr("class","rect_"+i);
            let rects = nodes.select("rect.rect_"+i);
            let rect_enter_update = rect_enter.merge(rects);
            rect_enter_update
            .attr("x", function(d:any){
                return rect_gap
            })
            .attr("y", function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                let culmulative_proportion = 0;
                for(let j= 0 ; j<i; j++){
                    culmulative_proportion = culmulative_proportion + d.data.Spd_node_info[j];
                }
                return s_scale*(culmulative_proportion*rect_height-rect_height / 2)
            })
            .attr("width",function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                return rect_width*s_scale-rect_gap;
            })
            .attr("height", function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                return s_scale*rect_height*d.data.Spd_node_info[i];
            })
            .attr("fill", function(d:any){return getCoraNodeColor(i,2);})
            ;
        }
        let line_enter = node_enter.append("path").attr("class","line_distance");
        let lines = nodes.select("path.line_distance");
        let line_enter_update = line_enter.merge(lines);
        line_enter_update.attr("stroke", "#000")
                .attr("stroke-width", "2")
                .attr("d", function(d:any){
                    let dis:any = d.data.Transformed_Distance;
                    let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                    let left = -(rect_width)*s_scale;
                    let top = -(rect_height) / 2 * s_scale - 4;
                    let width = 2*rect_width*s_scale
                    let start_point = [left , top]
                    if(dis>1){
                        dis = 1;
                    }else if(dis<0){
                        dis = 0;
                    }
                    let end_point = [left + width * dis ,top];
                    return constructPathOnNodeList([start_point,end_point])
                })
                .attr("fill", "none")
        let gnngap_enter = node_enter.append("rect").attr("class","gnngap");
        let gnngaps = nodes.select("rect.gnngap");
        let gnngap_enter_update = gnngap_enter.merge(gnngaps);
        gnngap_enter_update
        .attr("x",(d:any)=>{
            return -rect_gap;
        })
        .attr("y",(d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
            return -rect_height / 2 * s_scale;
        } )
        .attr("width", (d:any)=>{
            return rect_gap*2;
        })
        .attr("height", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return rect_height * s_scale;
        })
        .attr("fill", function(d:any){return "#bbb"});
    }

    /**
     * Render Legend P1+SPD
     * @param legend_svg 
     * @param refresh_number 
     * @param radius 
     */
    public renderLegendP1SPD(legend_svg:any, refresh_number:number, radius:number, legend_configuration:any){
        let constructPathOnNodeList = this.constructPathOnNodeList;
        let legend_x = legend_configuration["legend_x"];
        let legend_y = legend_configuration["legend_y"];
        let legned_scale = legend_configuration["legend_scale"];
        let legend_spd_info = legend_configuration["legend_spd_info"];
        let legend_transformed_distance = legend_configuration["legend_transformed_distance"];
        let legend_num_class = legend_spd_info.length;
        let legend_rect_scale = 3;
        let legend_Color = legend_configuration["legend_Color"];
        let legend_text_setting = legend_configuration["legend_text_setting"];
        let legend_data_point:any = {
            "data":{
                "Color": legend_Color,
                "Data_id": refresh_number,
                "Spd_node_info": legend_spd_info,
                "Transformed_Distance":legend_transformed_distance
            }
        }
        let legend_pie_all = legend_svg.selectAll("g.legend_pie")
                .data([legend_data_point], function(d:any){
                    return d.data.Data_id;
                });
        legend_pie_all.exit().remove();
        let legend_pie = legend_pie_all.enter().append("g")
            .attr("class", "legend_pie")
            .attr("transform", "translate("+legend_x+","+legend_y+")")
        this.renderGlyphP1SPD(legend_pie_all, legend_pie, radius, legend_rect_scale, legend_num_class, legned_scale);
        let rect_width = radius*legend_rect_scale/2*legned_scale;
        let rect_height = radius*legend_rect_scale*legned_scale;
        
        
        // ----- Render Legend Text
        for(let i = 0; i<3; i++){
            let start_point:any=[], middle_point:any=[], end_point:any=[];
            let point_list:any[] = [];
            if(i===0){
                let middle_point_2:any = [];
                start_point = [-0.5*rect_width, 0];
                middle_point = [-1.3*rect_width, 0];
                middle_point_2 = [-1.3*rect_width, -1.5*rect_height]
                end_point = [1.5*rect_width,-1.5*rect_height];
                
                point_list = [start_point,middle_point, middle_point_2, end_point];
            }else if(i===1){
                start_point = [+0.5*rect_width, 0];
                middle_point = [+0.5*rect_width, +0.1*rect_height];
                end_point = [1.5*rect_width,+0.1*rect_height];
                point_list = [start_point,middle_point, end_point];
            }else if(i===2){
                start_point = [0, -0.5*rect_height-1];
                middle_point = [0, -0.5*rect_height-4];
                end_point = [1.5*rect_width,-0.5*rect_height-4];
                point_list = [start_point,middle_point, end_point];
            }

            legend_pie.append("path")
                .attr("stroke", legend_line_style["stroke"])
                .attr("stroke-width", legend_line_style["stroke-width"])
                .style("stroke-dasharray",legend_line_style["stroke-dasharray"])
                .attr("d", constructPathOnNodeList(point_list))
                .attr("fill", "none")
            let text = legend_pie.append("text")
                .attr("x", end_point[0])
                .attr("y", end_point[1])
                .attr("text-anchor", legend_text_setting[i]["text-anchor"])
                .attr("dominant-baseline", legend_text_setting[i]["dominant-baseline"])
                .text(legend_text_setting[i]["text"]);
            this.wrapLines(text);
        }
    }
    /*public renderGlyphP1KFS(nodes:any,node_enter:any,radius:number,rect_scale:number, scale:number=1,enable_size:boolean=false){
        let rect_width = radius*rect_scale / 2* scale;
        let rect_height = radius*rect_scale*scale;
        let getSizeScale = this.getSizeScale;
        var outer_rects_enter = node_enter.append("rect").attr("class","gnn_outer_rects");
        var outer_rects = nodes.select("rect.gnn_outer_rects");
        var outer_rects_enter_update = outer_rects_enter.merge(outer_rects);
        outer_rects_enter_update//.transition(trans)
                    .attr("x",(d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                        return -rect_width*s_scale;
                    })
                    .attr("y", (d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                        return -rect_height / 2 *s_scale
                    })
                    .attr("width", (d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                        return rect_width * 2*s_scale
                    })
                    .attr("height", (d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                        return rect_height*s_scale
                    })
                    .attr("fill", function(d:any) { return d.data.Color[4]; })
                    .style("stroke","#bbb")
                    .style("stroke-width",1);
        


        let gnnrect_enter = node_enter.append("rect").attr("class","gnnrect");
        let gnnrects = nodes.select("rect.gnnrect");
        let gnnrect_enter_update = gnnrect_enter.merge(gnnrects);
        gnnrect_enter_update
        .attr("x",(d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return -rect_width*s_scale;
        })
        .attr("y", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return -rect_height / 2 *s_scale
        })
        .attr("width", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return rect_width*s_scale
        })
        .attr("height", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return rect_height*s_scale
        })
        .attr("fill", function(d:any){return d.data.Color[1]})
        .style("stroke","#bbb")
        .style("stroke-width",1);
        let topk = 5;
        let individual_proportion = 1/ topk;
        for(let i = 0; i<topk; i++){
            let rect_enter = node_enter.append("rect").attr("class","rect_"+i);
            let rects = nodes.select("rect.rect_"+i);
            let rect_enter_update = rect_enter.merge(rects);
            rect_enter_update
            .attr("x", function(d:any){
                return 0
            })
            .attr("y", function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                let culmulative_proportion = individual_proportion*(i);
                return s_scale*(culmulative_proportion*rect_height-rect_height / 2)
            })
            .attr("width",function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                let max_feature_similarity = 0;

                for(let j = 0; j<topk;j++){
                    let sim = d.data.Topkfs_nodes[j].anchor_similarity;
                    if(max_feature_similarity<sim){
                        max_feature_similarity = sim;
                    }
                }
                let target_sim = d.data.Topkfs_nodes[i].anchor_similarity;
                if(max_feature_similarity>0){
                    target_sim = target_sim / max_feature_similarity;
                }
                //return rect_width*d.data.Spd_node_info[i];
                return rect_width * target_sim * s_scale;
            })
            .attr("height", function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                return rect_height*individual_proportion*s_scale;
            })
            .attr("fill", function(d:any){
                let node_info = d.data.Topkfs_nodes;
                let label = node_info[i].anchor_label;
                return getCoraNodeColor(label,2);
            });
        }
    }*/

    public renderGlyphP1KFS(nodes:any,node_enter:any,radius:number,rect_scale:number,num_class:number, scale:number=1,enable_size:boolean=false){
        let rect_width = radius*rect_scale/2*scale;
        let rect_height = radius*rect_scale*scale;
        let getSizeScale = this.getSizeScale;

        var outer_rects_enter = node_enter.append("rect").attr("class","gnn_outer_rects");
        var outer_rects = nodes.select("rect.gnn_outer_rects");
        var outer_rects_enter_update = outer_rects_enter.merge(outer_rects);
        outer_rects_enter_update//.transition(trans)
                    .attr("x",(d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                        return -rect_width*s_scale;
                    })
                    .attr("y",(d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1;
                        return -rect_height / 2 * s_scale;
                    } )
                    .attr("width", (d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                        return s_scale * rect_width * 2
                    })
                    .attr("height", (d:any)=>{
                        let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                        return rect_height * s_scale;
                    })
                    .attr("fill", function(d:any) { 
                        
                        return d.data.Color[d.data.Color.length - 1]; });
                   // .style("stroke","#bbb")
                   // .style("stroke-width",1);

        let gnnrect_enter = node_enter.append("rect").attr("class","gnnrect");
        let gnnrects = nodes.select("rect.gnnrect");
        let gnnrect_enter_update = gnnrect_enter.merge(gnnrects);
        gnnrect_enter_update
        .attr("x",(d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
            return -rect_width*s_scale;
        })
        .attr("y",(d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
            return -rect_height / 2 * s_scale;
        } )
        .attr("width", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return s_scale * rect_width
        })
        .attr("height", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return rect_height * s_scale;
        })
        .attr("fill", function(d:any){return d.data.Color[1]});
        //.style("stroke","#bbb")
        //.style("stroke-width",1);
        for(let i = 0; i<num_class; i++){
            let rect_enter = node_enter.append("rect").attr("class","rect_"+i);
            let rects = nodes.select("rect.rect_"+i);
            let rect_enter_update = rect_enter.merge(rects);
            rect_enter_update
            .attr("x", function(d:any){
                return 0
            })
            .attr("y", function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                let culmulative_proportion = 0;
                for(let j= 0 ; j<i; j++){
                    culmulative_proportion = culmulative_proportion + d.data.Topkfs_node_info[j];
                }
                return s_scale*(culmulative_proportion*rect_height-rect_height / 2)
            })
            .attr("width",function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                return rect_width*s_scale;
            })
            .attr("height", function(d:any){
                let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
                return s_scale*rect_height*d.data.Topkfs_node_info[i];
            })
            .attr("fill", function(d:any){return getCoraNodeColor(i,2);})
            ;
        }
        let rect_gap = 0.25;
        let gnngap_enter = node_enter.append("rect").attr("class","gnngap");
        let gnngaps = nodes.select("rect.gnngap");
        let gnngap_enter_update = gnngap_enter.merge(gnngaps);
        gnngap_enter_update
        .attr("x",(d:any)=>{
            return -rect_gap;
        })
        .attr("y",(d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1;
            return -rect_height / 2 * s_scale;
        } )
        .attr("width", (d:any)=>{
            return rect_gap*2;
        })
        .attr("height", (d:any)=>{
            let s_scale = (enable_size)?getSizeScale(d.data.size):1; 
            return rect_height * s_scale;
        })
        .attr("fill", function(d:any){return "#bbb"});


    }
    public wrapLines(text:any) {
            
        var words = text.text().split("\n").reverse(),
          word,
          lineNumber = 0,
          lineHeight = text.node().getBoundingClientRect().height,
          x = +text.attr('x'),
          y = +text.attr('y'), tspan;
          text.text(null)
        //console.log("words", words)
        while (word = words.pop()) {
          tspan = text.append('tspan').attr('x', x).attr('y', lineNumber * lineHeight + y).text(word);
          lineNumber = lineNumber + 1;
        }
               
      }
    /**
     * Render Legend P1+KFS
     * @param legend_svg 
     * @param refresh_number 
     * @param radius 
     */
    public renderLegendP1KFS(legend_svg:any, refresh_number:number, radius:number, legend_configuration:any){
        let constructPathOnNodeList = this.constructPathOnNodeList;
        let legend_x = legend_configuration["legend_x"];
        let legend_y =  legend_configuration["legend_y"];
        let legned_scale =  legend_configuration["legend_scale"];
        let legend_rect_scale = 3;
        let legend_Color =  legend_configuration["legend_Color"];
        let legend_kfs_info = legend_configuration["legend_Topkfs_node_info"];
        let legend_num_class = legend_kfs_info.length;
        let legend_data_point:any = {
            "data":{
                "Color": legend_Color,
                "Data_id": refresh_number,
                "Topkfs_nodes": legend_configuration["legend_Topkfs_nodes"],
                "Topkfs_node_info": legend_kfs_info
            }
        }
        let legend_text_setting = legend_configuration["legend_text_setting"];
        let legend_pie_all = legend_svg.selectAll("g.legend_pie")
                        .data([legend_data_point], function(d:any){
                            return d.data.Data_id;
                        });
            legend_pie_all.exit().remove();
        //console.log("Refreshnumber",this.refresh_number,pieName);

        let legend_pie = legend_pie_all.enter().append("g")
            .attr("class", "legend_pie")
            .attr("transform", "translate("+legend_x+","+legend_y+")");
        this.renderGlyphP1KFS(legend_pie_all, legend_pie, radius, legend_rect_scale, legend_num_class, legned_scale);
        let rect_width = radius*legend_rect_scale / 2*legned_scale;
        let rect_height = radius*legend_rect_scale*legned_scale;
        
        // Render Circle
        
        function wrapWord(text:any, width:any) {
            
              var words = text.text().split('').reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = text.node().getBoundingClientRect().height,
                x = +text.attr('x'),
                y = +text.attr('y'),
                tspan = text.text(null).append('tspan').attr('x', x).attr('y', y);
              while (word = words.pop()) {
                line.push(word);
                const dash = lineNumber > 0 ? '-' : '';
                tspan.text(dash + line.join(''));
                if (tspan.node().getComputedTextLength() > width) {
                  line.pop();
                  tspan.text(line.join(''));
                  line = [word];
                  tspan = text.append('tspan').attr('x', x).attr('y', ++lineNumber * lineHeight + y).text(word);
                }
              }
                     
            }
            
        // ----- Render Legend Text
        for(let i = 0; i<2; i++){
            let start_point:any=[], middle_point:any=[], end_point:any=[];
            if(i===0){
                start_point = [-0.5*rect_width, 0]
                middle_point = [-0.5*rect_width, -rect_height]
                end_point = [1.5*rect_width,-rect_height]
            }else if(i===1){
                start_point = [+0.5*rect_width, 0]
                middle_point = [+0.5*rect_width, 0]
                end_point = [1.5*rect_width,0]
            }

            legend_pie.append("path")
                .attr("stroke", legend_line_style["stroke"])
                .attr("stroke-width", legend_line_style["stroke-width"])
                .style("stroke-dasharray",legend_line_style["stroke-dasharray"])
                .attr("d", constructPathOnNodeList([start_point,middle_point, end_point]))
                .attr("fill", "none")
            let text = legend_pie.append("text")
                .attr("x", end_point[0])
                .attr("y", end_point[1])
                .attr("text-anchor", legend_text_setting[i]["text-anchor"])
                .attr("dominant-baseline", legend_text_setting[i]["dominant-baseline"])
                .text(legend_text_setting[i]["text"])
            this.wrapLines(text);
        }
    }
    public renderLegend(data_package:any){
        let configuration = data_package["configuration"];
        let tooltip_svg = data_package["tooltip_svg"];
        let additional_info = data_package["additional_info"];
        let e = data_package["e"];
        let showMode = data_package["showMode"];
        let legendMode = data_package["legendMode"]; // 1 - hovering, 2 - static
        // ---------------------- Render Glyph -------------------------- //
        var radius = configuration["radius"];
        var radius_gap = 0.3;
        var inner_radius = radius - radius_gap;
        let legend_pie_x = 0;
        let legend_pie_y = 0;
        var top_svg = tooltip_svg;
        var legend_svg = top_svg.append("g")
                .attr("width", 100)
                .attr("height", 70)
                .attr("transform","translate("+legend_pie_x+","+legend_pie_y+")")
        e.refresh_number = e.refresh_number + 1;
        var pie_name = additional_info["pie_name"];
        var key_model_name = pie_name[0];
        //var P2_name = pie_name[1];
        //var P3_name = pie_name[2];
        if(showMode === 1){
            let legend_x = 30;
            let legend_y = 50;
            if(legendMode === 2){
                legend_x = 30;
                legend_y = 50;
            }
            let legned_scale = 2;
            let legend_Color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#fff"];
            let legend_conf = 0.66;
            let legend_text_setting = [
                {
                    "text":"Label",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+1
                }
            ]
            let y_offset_list = [-7.5, 0, +19]
            for(let i =0; i<pie_name.length; i++){
                legend_text_setting.push({
                    "text":pie_name[i],
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":y_offset_list[i]
                })
            }
            legend_text_setting.push({
                "text":"Conf.",
                "text-anchor":"begin",
                "dominant-baseline":"central",
                "y_offset":0
            })

            /** "text":"Confidence" */
            let legend_configuration = {
                "legend_x":legend_x,
                "legend_y":legend_y,
                "legend_scale":legned_scale,
                "legend_Color":legend_Color,
                "legend_conf":legend_conf,
                "legend_text_setting":legend_text_setting
            }
            this.renderLegendGT3PT(legend_svg, e.refresh_number, radius_gap, radius, legend_configuration, additional_info);
        }else if(showMode === 2){
            let legend_x = 30;
            let legend_y = 45;
            let legend_scale = 2;
            let legend_Color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#fff"];
            let legend_degree = 8;
            let legend_CN_consistency = {
                "cgt_ngt":0.8,
                "cgt_npt":0.8,
                "cpt_ngt":0.8,
                "cpt_npt":0.8
            }
            let legend_additional_info = {
                "max_degree":10
            }
            let legend_text_setting = [
                {
                    "text":"DEG",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+16
                },
                {
                    "text":"Label cons.",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+16
                },
                {
                    "text":"L. - p. cons.",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+0
                },
                {
                    "text":"P. - l. cons.",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+18
                },
                {
                    "text":"Pred. cons.",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":-22
                },
            ];
            /**
             * "text":"DEG"
             * "text":"Label consistency"
             * "text":"Label - prediction consistency",
             * "text":"Prediction - label consistency",
             * "text":"Prediction consistency",
             */
            let legend_configuration = {
                "legend_x":legend_x,
                "legend_y":legend_y,
                "legend_scale":legend_scale,
                "legend_Color":legend_Color,
                "legend_text_setting":legend_text_setting,
                "legend_degree":legend_degree,
                "legend_CN_consistency":legend_CN_consistency
            }
            this.renderLegendDEGCN(legend_svg, e.refresh_number, radius, legend_additional_info, legend_configuration);
        }else if(showMode === 3){
            let legend_x = 20;
            let legend_y = 40;
            if(legendMode === 2){
                legend_x = 30;
                legend_y = 50;
            }
            let legend_scale = 2;
            let legend_spd_info = [0, 0.7, 0.2, 0.1];
            let legend_transformed_distance = 0.5;
            let legend_Color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#fff"];
            let legend_text_setting = [
                {
                    "text":key_model_name,
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                },
                {
                    "text":"Near. train. \n label dist.",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                },
                {
                    "text":"Closeness",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                }
            ];
            /**
             * Nearest training nodes \n label distribution
             * "text":"Closeness",
             */
            let legend_configuration = {
                "legend_x":legend_x,
                "legend_y":legend_y,
                "legend_scale":legend_scale,
                "legend_Color":legend_Color,
                "legend_text_setting":legend_text_setting,
                "legend_spd_info":legend_spd_info,
                "legend_transformed_distance":legend_transformed_distance

            }
            this.renderLegendP1SPD(legend_svg, e.refresh_number, radius, legend_configuration);
        }else if(showMode === 4){
            let legend_x = 20;
            let legend_y = 30;
            if(legendMode === 2){
                legend_x = 30;
                legend_y = 50;
            }
            let legend_scale = 2;
            let legend_Color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728","#fff"];
            let legend_Topkfs_nodes = [
                {
                    "anchor_label":0,
                    "anchor_similarity":1
                },
                {
                    "anchor_label":1,
                    "anchor_similarity":0.9
                },
                {
                    "anchor_label":2,
                    "anchor_similarity":0.8
                },
                {
                    "anchor_label":3,
                    "anchor_similarity":0.7
                },
                {
                    "anchor_label":4,
                    "anchor_similarity":0.6
                },
            ]
            let legend_Topkfs_node_info = [0.2, 0.2, 0.2, 0.2, 0.2];
            let legend_text_setting = [
                {
                    "text":key_model_name,
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                },
                {
                    "text":"Top-k. feat. \n train. l. dist.",
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                }
            ];
            /**
             * Top-k similar feature \n training nodes label distribution
             */
            let legend_configuration = {
                "legend_x":legend_x,
                "legend_y":legend_y,
                "legend_scale":legend_scale,
                "legend_Color":legend_Color,
                "legend_text_setting":legend_text_setting,
                "legend_Topkfs_nodes":legend_Topkfs_nodes,
                "legend_Topkfs_node_info":legend_Topkfs_node_info

            }
            this.renderLegendP1KFS(legend_svg, e.refresh_number, radius, legend_configuration);
        }
    }
    public handleTitleMouseMove(e:any, configuration:any, additional_info:any){
        //console.log("handleTitleMouseMove",e);
        var xy:any;
        
        //xy = d3.mouse(this);
        xy = [d3.event.pageX, d3.event.pageY];
        
        let svgWidth = 100;
        let svgHeight = 100;
        let showMode = this.props.showMode;
        if(showMode === 1){
            svgWidth = 190;
            svgHeight = 100;
        }else if(showMode === 2){
            svgWidth = 300;
            svgHeight = 100;
        }else if(showMode === 3){
            svgWidth = 210;
            svgHeight = 60+10;
        }else if(showMode === 4){
            svgWidth = 280;
            svgHeight = 60;
        }
        var tooltip_proj = d3.select('#tooltip_proj')
                            .style('opacity', 0.95)
                            .style('top', (xy[1] - svgHeight) + 'px')
                            .style('left', (xy[0] + 10) + 'px')
        ;
        tooltip_proj.selectAll("*").remove();
        var tooltip_svg = tooltip_proj.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

        var data_package = {
            "configuration":configuration,
            "tooltip_svg":tooltip_svg,
            "additional_info":additional_info,
            "e": e,
            "showMode": showMode,
            "legendMode": 1
        }
        this.renderLegend(data_package);
        
    }
    public handleGlyphMouseMove(e:any, configuration:any, additional_info:any){
        //console.log("handleGlyphMouseMove",d3.select(e).data());
        var xy:any;
        var data_point = d3.select(e).data()[0]["data"];
        //xy = d3.mouse(this);
        xy = [d3.event.pageX, d3.event.pageY];
        
        let svgWidth = 100;
        let svgHeight = 100;
        let showMode = this.props.showMode;
        let spd_desc_info = "";
        let kfs_desc_info = "";
        if(showMode === 1){
            svgWidth = 200+15;
            svgHeight = 100;
        }else if(showMode === 2){
            svgWidth = 330;
            svgHeight = 100;
        }else if(showMode === 3){
            svgWidth = 210+5;
            svgHeight = 60+10;
            let legend_spd_info = data_point["Spd_node_info"];
            for(let i = 0 ; i<legend_spd_info.length; i++){
                if(legend_spd_info[i]===0){

                }else{
                    spd_desc_info = spd_desc_info + "\nLabel "+i+":"+legend_spd_info[i].toFixed(2);
                    svgHeight = svgHeight + 20;
                }
            }
        }else if(showMode === 4){
            svgWidth = 280;
            svgHeight = 60;
            let legend_kfs_info = data_point["Topkfs_node_info"];
            for(let i = 0 ; i<legend_kfs_info.length; i++){
                if(legend_kfs_info[i]===0){

                }else{
                    kfs_desc_info = kfs_desc_info + "\nLabel "+i+":"+legend_kfs_info[i].toFixed(2);
                    svgHeight = svgHeight + 20;
                }
            }
            /*let legend_kfs_info = data_point["Topkfs_nodes"];
            for(let i = 0 ; i<legend_kfs_info.length; i++){
                let anchor = legend_kfs_info[i];
                //ID:"+anchor["anchor_id"]+" 
                kfs_desc_info = kfs_desc_info + "\nLabel:"+anchor["anchor_label"]+" Similarity:"+anchor["anchor_similarity"].toFixed(2);
                svgHeight = svgHeight + 20;
                
            }*/
        }
        svgHeight = svgHeight + 20;
        let x_coord = xy[1] - svgHeight;
        let y_coord = xy[0] + 10;
        let opacity = 0.95;
        if(showMode === 4){
            y_coord = xy[0] - 10 - svgWidth;
        }

        var tooltip_proj = d3.select('#tooltip_proj')
                            .style('opacity', opacity)
                            .style('top', (x_coord) + 'px')
                            .style('left', (y_coord) + 'px')
        ;
        tooltip_proj.selectAll("*").remove();
        var tooltip_svg = tooltip_proj.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
        
        // ---------------------- Render Glyph -------------------------- //
        var radius = configuration["radius"];
        var radius_gap = 0.3;
        var inner_radius = radius - radius_gap;
        let legend_pie_x = 0;
        let legend_pie_y = 20;
        var top_svg = tooltip_svg;
        // ---------------------- Render Meta Text ---------------------- //
        //console.log(data_point);
        let meta_text = "";
        if(data_point["size"] === 1){
            meta_text = "The id of this node:"+data_point["raw_id_list"][0];
        }else{
            meta_text = "The size of this cluster:"+data_point["size"];
        }
        top_svg.append("text")
        .attr("x",10)
        .attr("y",5)
        .attr("text-anchor","start")
        .attr("dominant-baseline","hanging")
        .text(meta_text);

        // text-anchor="start"
        // dominant-baseline="hanging"
        var legend_svg = top_svg.append("g")
                .attr("width", 100)
                .attr("height", 70)
                .attr("transform","translate("+legend_pie_x+","+legend_pie_y+")")
        e.refresh_number = e.refresh_number + 1;
        
        var pie_name = additional_info["pie_name"];
        var key_model_name = pie_name[0];
        //var P2_name = pie_name[1];
        //var P3_name = pie_name[2];
        if(showMode === 1){
            let legend_x = 30;
            let legend_y = 50;
            let legned_scale = 2;
            let legend_Color = data_point["Color"];
            let legend_conf = data_point[key_model_name+"_Confidence"];
            let legend_text_setting = [
                {
                    "text":"Label:"+data_point["Ground_Truth_Label"],
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+1
                }
            ]
            let y_offset_list = [-7.5, 0, +19]
            for(let i = 0; i<pie_name.length; i++){
                legend_text_setting.push({
                    "text":pie_name[i]+":"+data_point[pie_name[i]+"_Prediction_Label"],
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":y_offset_list[i]
                })
            }
            legend_text_setting.push(
                {
                    "text":"Confidence:"+data_point[key_model_name+"_Confidence"].toFixed(2),
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                }
            )
                

            let legend_configuration = {
                "legend_x":legend_x,
                "legend_y":legend_y,
                "legend_scale":legned_scale,
                "legend_Color":legend_Color,
                "legend_conf":legend_conf,
                "legend_text_setting":legend_text_setting
            }
            this.renderLegendGT3PT(legend_svg, e.refresh_number, radius_gap, radius, legend_configuration, additional_info);
        }else if(showMode === 2){
            let legend_x = 30;
            let legend_y = 45;
            let legend_scale = 2;
            let legend_Color = data_point["Color"];
            let legend_degree = data_point["Real_Degree"];
            let legend_CN_consistency = data_point["CN_consistency"];
            let legend_text_setting = [
                {
                    "text":"DEG/MAX_DEG:"+data_point["Real_Degree"].toFixed(2)+"/"+additional_info["max_degree"],
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+16
                },
                {
                    "text":"Label consistency:"+data_point["CN_consistency"]["cgt_ngt"].toFixed(2),
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+16
                },
                {
                    "text":"Label - prediction consistency:"+data_point["CN_consistency"]["cgt_npt"].toFixed(2),
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+0
                },
                {
                    "text":"Prediction - label consistency:"+data_point["CN_consistency"]["cpt_ngt"].toFixed(2),
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":+18
                },
                {
                    "text":"Prediction consistency:"+data_point["CN_consistency"]["cpt_npt"].toFixed(2),
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":-22
                },
            ];
            let legend_configuration = {
                "legend_x":legend_x,
                "legend_y":legend_y,
                "legend_scale":legend_scale,
                "legend_Color":legend_Color,
                "legend_degree":legend_degree,
                "legend_CN_consistency":legend_CN_consistency,
                "legend_text_setting":legend_text_setting
            }
            this.renderLegendDEGCN(legend_svg, e.refresh_number, radius, additional_info, legend_configuration);
        }else if(showMode === 3){
            let legend_x = 20;
            let legend_y = 40;
            let legend_scale = 2;
            let legend_spd_info = data_point["Spd_node_info"];
            let legend_Color = data_point["Color"];
            let legend_transformed_distance = data_point["Transformed_Distance"];
            let legend_text_setting = [
                {
                    "text":key_model_name+":"+data_point[key_model_name+"_Prediction_Label"],
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                },
                {
                    "text":"Nearest training nodes \n label distribution" + spd_desc_info,
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                },
                {
                    "text":"Closeness:" + legend_transformed_distance.toFixed(2),
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                }
            ];
            let legend_configuration = {
                "legend_x":legend_x,
                "legend_y":legend_y,
                "legend_scale":legend_scale,
                "legend_Color":legend_Color,
                "legend_text_setting":legend_text_setting,
                "legend_spd_info":legend_spd_info,
                "legend_transformed_distance":legend_transformed_distance
            }
            this.renderLegendP1SPD(legend_svg, e.refresh_number, radius, legend_configuration);
        }else if(showMode === 4){
            let legend_x = 20;
            let legend_y = 30;
            let legend_scale = 2;
            let legend_Color = data_point["Color"];
            let legend_Topkfs_nodes = data_point["Topkfs_nodes"]
            let legend_Topkfs_node_info = data_point["Topkfs_node_info"];
            let legend_text_setting = [
                {
                    "text":key_model_name+":"+data_point[key_model_name+"_Prediction_Label"],
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                },
                {
                    "text":"Top-k similar features \n training nodes label distribution"+kfs_desc_info,
                    "text-anchor":"begin",
                    "dominant-baseline":"central",
                    "y_offset":0
                }
            ];
            let legend_configuration = {
                "legend_x":legend_x,
                "legend_y":legend_y,
                "legend_scale":legend_scale,
                "legend_Color":legend_Color,
                "legend_text_setting":legend_text_setting,
                "legend_Topkfs_nodes":legend_Topkfs_nodes,
                "legend_Topkfs_node_info":legend_Topkfs_node_info

            }
            this.renderLegendP1KFS(legend_svg, e.refresh_number, radius, legend_configuration);
        }


        // ----- Change the style of hovered nodes and lines.  ------
        let Data_id = data_point.Data_id;
        let new_return_result:any[] = data_point.raw_id_list;
        let new_highlight_node = [Data_id];
        this.onHoveredNodeListChange(new_return_result, new_highlight_node, showMode);

        
    }
    public renderInViewLegend(){
        let enableLegends = this.props.enableLegends;
        let showMode = this.props.showMode;
        let configuration = {
            "radius":3.5,
            "showlabel": false,
            "width": this.props.width,
            "height": this.props.height
        }
        let additional_info = this.additional_info;
        var width = configuration["width"];
        var height = configuration["height"]; // rect height
        if(height<1){
            height = 1
        }
        let legendWidth = 140;
        let legendHeight = 100;
        let legend_left_padding = 10;
        //let showMode = this.props.showMode;
        /*
        if(showMode === 1){
            legendWidth = 140;
            legendHeight = 100;
        }else if(showMode === 2){
            legendWidth = 300;
            legendHeight = 100;
        }else if(showMode === 3){
            legendWidth = 210;
            legendHeight = 60+10+10;
        }else if(showMode === 4){
            legendWidth = 280;
            legendHeight = 60+10;
        }*/
        
        var legend_top_padding = 10;
        var legend_height = legendHeight + legend_top_padding;
        var legend_width = legendWidth + legend_left_padding;
        legend_width = Math.min(width, legend_width);
        d3.select("#ScatterPlot_sub_legend"+this.props.id).remove();
        var legend_top_svg = d3.select("#TopSVGChart_ScatterPlot_Legend_"+this.props.id);

        if(enableLegends){
            console.log("Enable projection view legends rendering...")
            

            var legend_svg = legend_top_svg.append("g")
            .attr("id","ScatterPlot_sub_legend"+this.props.id)
            .attr("transform", function() {
                return "translate(" + legend_left_padding + "," +  (height-legend_height) + ")";
                })
            .attr("width", legend_width - legend_left_padding)
            .attr("height", legend_height-legend_top_padding);
            legend_svg.append("rect")
            .attr("x",0)
            .attr("y",0)
            .attr("width", legend_width - legend_left_padding)
            .attr("height", legend_height-legend_top_padding)
            .attr("fill","white")
            .attr("stroke","#bbb")
            .attr("stroke-width",2)
            .attr("fill-opacity",0.9)
            .attr("stroke-opacity",0.5)
            ;

            var data_package = {
                "configuration":configuration,
                "tooltip_svg":legend_svg,
                "additional_info":additional_info,
                "e": this,
                "showMode": showMode,
                "legendMode": 2
            }
            this.renderLegend(data_package);
        }else{
            console.log("Not Enable projection view legends...")

        }


            
    }
    /**
     * Render glyphs based on data points.
     * First, save the params to class variable, if null, then restore params from class variable.
     * Second, remove already rendered things.
     * @param point_array 
     * @param additional_info 
     * @param model 
     */
    public mappingGraph(point_array:any=null,additional_info:any=null, model:any=null) {
        let getSizeScale = this.getSizeScale;

        //let getArc = this.getArc;
        //let getArcConf = this.getArcConf;
        if(point_array===null){
            point_array = this.point_array;
        }else{
            this.point_array = point_array;
        }
        if(additional_info === null){
            additional_info = this.additional_info;
        }else{
            this.additional_info = additional_info;
        }
        if(model === null){
            model = this.model;
        }else{
            this.model = model;
        }
        let showMode = this.props.showMode;
        let layoutMode = this.props.layoutMode;
        d3.select("#ScatterPlot_sub_"+this.props.id).remove();
        d3.select("#ScatterPlot_Legend_sub_"+this.props.id).remove();
        if(point_array.length <= 0){
            return;
        }
        
        

        var nodenum = point_array.length;
        var configuration = {
            "radius":3.5,
            "showlabel": true,
            "width": this.props.width,
            "height": this.props.height
        }
        if(nodenum >= 100){
            configuration = {
                "radius":3.5,
                "showlabel": false,
                "width": this.props.width,
                "height": this.props.height
            }
        }
        var top_top_svg = d3.select("#TopSVGChart_ScatterPlot_"+this.props.id)
        var width = configuration["width"];
        var height = configuration["height"]; // rect height
        if(height<1){
            height = 1
        }
        let handleTitleMouseMove = this.handleTitleMouseMove;
        function handleTitleMouseMoveBridge(this:any){
            //console.log("handleTitleMouseMoveBridge",this);
            handleTitleMouseMove(this,configuration, additional_info);
        }
        var top_svg = top_top_svg.append("g")
        .attr("id","ScatterPlot_sub_"+this.props.id);
        top_svg.append("rect")
        .attr("x",0)
        .attr("y",0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill","white")
        .attr("stroke","#bbb")
        .attr("stroke-width",2)
        .attr("fill-opacity",0.1)
        .attr("stroke-opacity",0.5)
        ;
        var legend_top_top_svg = d3.select("#TopSVGChart_ScatterPlot_Legend_"+this.props.id);
        var legend_top_svg = legend_top_top_svg.append("g")
        .attr("id","ScatterPlot_Legend_sub_"+this.props.id);
        legend_top_svg.append("text")
        .attr("x",width/2)
        .attr("y",-4)
        .attr("text-anchor","middle")
        .text(this.props.name);
        //.on("mousemove", handleTitleMouseMoveBridge)
        //.on("mouseout",this.handleTitleMouseOut);
        this.renderInViewLegend();
        var svg = top_svg.append("g").attr("class","main_drawings");
            svg.attr("width", width)
                .attr("height", height);

        let clip_name = "clip_"+this.props.id;
        let clip_path_name = "url(#"+clip_name+")";
            svg.append("defs")
            .append("clipPath")
            .attr("id",clip_name)
            .append("rect")
            .attr("x",0)
            .attr("y",0)
            .attr("width", width)
            .attr("height", height);
            svg.attr("clip-path", clip_path_name);

        var nodes = svg
            .selectAll("g.nodes")
            .data(point_array,function(d:any,i:any){
                return ""+d.data.Data_id;
            });
        //console.log("point_array", point_array);
        //console.log("nodes enter, update, exit", nodes.enter(), nodes, nodes.exit());
            
        var node_enter = nodes.enter().append("g").attr("class","nodes");
        var node_enter_update = nodes.merge(node_enter).attr("opacity",0.9);
        nodes.exit().remove();
       
        let handleGlyphMouseMove = this.handleGlyphMouseMove;
        function handleGlyphMouseMoveBridge(this:any){
            handleGlyphMouseMove(this,configuration, additional_info);
        }
        node_enter_update.on("mousemove", handleGlyphMouseMoveBridge).on("mouseout",this.handleGlyphMouseOut);
        
        // render glyph

        
        let radius = 3;
        let radius_gap = 0.3;
        let rect_scale = 4.5;
        let enable_size = true;

        if(showMode === 1){
            //enable_size = true;
            this.renderGlyphGT3PT(nodes, node_enter, radius_gap, radius,additional_info,1, enable_size);
        }else if(showMode === 2){
            //enable_size = true;
            // 2 -> shortest path distance / center neighbor consistency rate.
            this.renderGlyphDEGCN(nodes, node_enter, radius, additional_info,1,enable_size);
        }else if(showMode === 3){
            // 3 -> shortest path distance train nodes label distribution
            var num_class = point_array[0].data.Spd_node_info.length;
            this.renderGlyphP1SPD(nodes, node_enter, radius, rect_scale, num_class,1,enable_size);
        }else if(showMode === 4){
            // 4 -> topkfs train nodes label distribution
            var num_class = point_array[0].data.Topkfs_node_info.length;
           this.renderGlyphP1KFS(nodes, node_enter, radius, rect_scale,num_class,1,enable_size);
        }

        
     

        
        if(enable_size){
            //var title_enter = node_enter.append("title");
            //nodes.select("title").merge(title_enter)
            //    .text(function(d:any) { return d.data.Data_id; });
            //var title_enter = node_enter.append("title");
            //nodes.select("title").merge(title_enter)
            //    .text(function(d:any) { return "size:"+d.data.size; });
        }
        let margin = 40;
        var centerx = d3.scaleLinear().range([ margin, width - margin]),
            centery = d3.scaleLinear().range([margin, height - margin]);
        let radius_collision =  radius * 2+radius_gap*2;
        if(showMode === 2){
            
        }else if(showMode === 1){
            radius_collision = radius_collision + 3;
        }else if(showMode === 3 || showMode === 4){
            radius_collision = radius * rect_scale / 3 * 2 + radius_gap * rect_scale / 3 * 2;
        }
        // default alphaDecay = 0.005
        // default alpha = 0.1
        let renderLines = this.props.renderLines;
        let enable_lasso_selection:boolean = true;
        function ticked() {
            node_enter.merge(nodes)
            .attr("transform", function(d:any) {
            return "translate(" + d.x + "," +  d.y + ")";
            })
            if(enable_lasso_selection){
                renderLines();
            }
        }
        if(nodenum>=2){
            // t-SNE settings:
            //      alpha 0.1
            //      alphaDecay 0.005
            // UMAP
            //      alpha 0.2
            //      alphaDecay 0.005
            let alpha = 0.1;
            let alphaDecay = 0.005;
            if(layoutMode===1){
                alpha = 0.1;
                alphaDecay = 0.005;
            }else if(layoutMode === 2){
                alpha = 0.2;
                alphaDecay = 0.005;
            }
            const forcetsne = d3.forceSimulation(point_array)
            .alphaDecay(alphaDecay)
            .alpha(alpha)
            .force('tsne', function (alpha:any) {
                
                // every time you call this, solution gets better
                model.step();

                // Y is an array of 2-D points that you can plot
                let pos:any;
                if(layoutMode === 1){
                    pos = model.getSolution();
                }else if(layoutMode === 2){
                    pos = model.getEmbedding();
                }
                //
                centerx.domain(d3.extent(pos.map((d:any) => d[0])));
                centery.domain(d3.extent(pos.map((d:any) => d[1])));

                point_array.forEach((d:any, i:any) => {
                    d.x += alpha * (centerx(pos[i][0]) - d.x);
                    d.y += alpha * (centery(pos[i][1]) - d.y);
                });
                
            })
            .force('collide', d3.forceCollide().radius((d:any) => {
                let s_scale = 1;
                if(enable_size){
                    s_scale = getSizeScale(d.data.size);
                }
                return s_scale * radius_collision;
            }))
            .on('tick',ticked);
        }else{
            ticked();
        }
        
                
        
        
        
        if(enable_lasso_selection){
            var lasso_start = function() {
                lasso.items()
                    .classed("lasso_not_possible",true)
                    .classed("lasso_unselected", false)
                    .classed("lasso_selected",false);
            };
    
            var lasso_draw = function() {
            
                // Style the possible dots
                lasso.possibleItems()
                    .classed("lasso_not_possible",false)
                    .classed("lasso_unselected", false)
                    .classed("lasso_possible",true);
    
                // Style the not possible dot
                lasso.notPossibleItems()
                    .classed("lasso_not_possible",true)
                    .classed("lasso_unselected", false)
                    .classed("lasso_possible",false);
            };
            let onSelectedNodeListChange = this.onSelectedNodeListChange;
            var lasso_end = function() {
                // Reset the color of all dots
                lasso.items()
                    .classed("lasso_not_possible",false)
                    .classed("lasso_possible",false);
    
                // Style the selected dots
                lasso.selectedItems()
                    .classed("lasso_selected",true)
    
                // Reset the style of the not selected dots
                
                let selectedItemsData = lasso.selectedItems().data();
                let return_result:any;
                lasso.notSelectedItems().data().forEach((d:any)=>{
                    d.selected = false;
                })
                lasso.selectedItems().data().forEach((d:any)=>{
                    d.selected = true;
                })
                if(selectedItemsData.length === 0){
                    return_result = lasso.notSelectedItems().data();
                    lasso.notSelectedItems()
                    .classed("lasso_unselected", false);
                }else{
                    return_result = selectedItemsData;
                    lasso.notSelectedItems()
                    .classed("lasso_unselected", true);
                }
                console.log(return_result);
                //let new_return_result = return_result.map((d:any)=>{
                //    return d.data.Data_id;
                //})
                let new_return_result:any[] = [];
                return_result.forEach((d:any)=>{
                    new_return_result = new_return_result.concat(d.data.raw_id_list);
                })
                let new_highlight_node = selectedItemsData.map((d:any)=>{
                    return d.data.Data_id;
                })
                onSelectedNodeListChange(new_return_result, new_highlight_node, showMode);
            };
            
            var lasso = d3_lasso.default()
                .closePathSelect(true)
                .closePathDistance(100)
                .items(node_enter_update)
                .targetArea(top_top_svg)
                .on("start",lasso_start)
                .on("draw",lasso_draw)
                .on("end",lasso_end);
            
            top_top_svg.call(lasso);
        }
        this.props.updateSingleHighlightNodeStatus(showMode);
        
        
        
    };
    
    public renderD3(){
        let dataPackage = this.props.dataPackage;
        var matrix:any = dataPackage["matrix"];
        var selectedNodeList:any = dataPackage["selectedNodeList"];
        var additional_info:any = this.props.dataPackage["additional_info"];
        let layoutMode = this.props.layoutMode;
        let model;
        if(layoutMode === 1){
            model = new tsnejs.tSNE({
                dim: 2,
                perplexity: 30,
            });
            model.initDataDist(matrix);

        }else if(layoutMode === 2){
        
            let getDistance = (x:any, y:any)=>{
                let x_indices = x[0];
                let y_indices = y[0];
                return matrix[x_indices][y_indices];
            }
            model = new UMAP({
                nComponents: 2,
                distanceFn: getDistance,
                nNeighbors: Math.min(15, matrix.length - 1)
            });
            
            let fakedata = [];
            for(let i = 0; i<matrix.length;i++){
                fakedata.push([i]);
            }
            let nEpochs = 1;
            if(fakedata.length>=2){
                nEpochs = model.initializeFit(fakedata);
    
            }
        }

        /*for (let i = 0; i < nEpochs; i++) {
            umap.step();
        }
        let embedding = umap.getEmbedding();
        console.log("nEpochs", nEpochs);
        console.log("umap embedding", embedding);*/
        
        let initial_x = this.props.width / 2;
        let initial_y = this.props.height / 2;
        var point_array :any = [];
        selectedNodeList.forEach((d:any,i:any)=>{
            point_array.push(
            {
                "data":d,
                "x":initial_x,
                "y":initial_y
            });
        })
        // console.log("pre point array", JSON.parse(JSON.stringify(point_array)))
        let updatefunc = this.mappingGraph;
        updatefunc(point_array,additional_info, model);
        
    }
    
    
    public onShowModeChange(showMode:number){
        this.setState({
            showMode: showMode
        })
    }
    public render() {
        let {x,y,width,height } = this.props;
        return (
         <g>
             <g id={"TopSVGChart_ScatterPlot_"+this.props.id} transform={"translate("+x+","+y+")"} width={width} height={height}></g>
                <g id={"TopSVGChart_ScatterPlot_Legend_"+this.props.id} transform={"translate("+x+","+y+")"} width={width} height={height}></g>
                </g>
         )
                
           
    }
}
