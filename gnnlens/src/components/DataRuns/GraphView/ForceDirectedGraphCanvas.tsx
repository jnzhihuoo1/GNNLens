
import './ForceDirectedGraphCanvas.css'
import * as React from "react";
import { scaleBand } from 'd3';
import {drawRectStroke, drawRect, drawNodeGlyph, drawLine} from './CanvasDrawing';
const d3 = require("d3");
const legend_line_style = {
    "stroke":"#bbb",
    "stroke-width":2,
    "stroke-dasharray":"2,3"
} 
export interface IProps {
    graph_json : any,
    width : number,
    height : number,
    onNodeClick: any,
    GraphViewState:any
}
export interface IState {
}

export default class ForceDirectedGraphCanvas extends React.Component<IProps, IState>{
    public global_simulation:any = null;
    public saved_transform:any = null;
    public refresh_number = 0;
    constructor(props:IProps) {
        super(props);
        this.updateTransform = this.updateTransform.bind(this);
        this.state = {

        }
    }
    componentDidMount(){
        this.renderCanvas();
    }
    
     componentDidUpdate(prevProps:IProps, prevState:IState) {
        if(prevProps.graph_json.name !== this.props.graph_json.name || prevProps.width !== this.props.width || prevProps.GraphViewState !== this.props.GraphViewState){
            this.renderCanvas();
        }

        
     }
     public updateTransform(transform:any){
         this.saved_transform = transform;
     }
     public renderColorLegend(legend_color_svg:any, colorLegend:number){
        let row_legend_color = legend_color_svg.selectAll("g.legend_row_color")
                                .data(colorLegend, function(d:any,i:any){
                                    return d.text+"_"+i+"_"+d.color;
                                });
        let g_row_legend_color = row_legend_color.enter().append("g")
                            .attr("class","legend_row_color")
                            .attr("transform", function(d:any,i:any){
                                return "translate(10,"+(10+i*20)+")";
                            });
            g_row_legend_color.append("circle")
                            .attr("r", 5)
                            .attr("fill", function(d:any){
                                return d.color;
                            })
                            
            g_row_legend_color.append("text")
                            .attr("x", 10)
                            .attr("y", 5)
                            .text(function(d:any){
                                return d.text;
                            })
                            
            row_legend_color.exit().remove();
     }
     public renderLegend(legend_configuration:any){
        var width = legend_configuration["width"];
        var height = legend_configuration["height"];
        var radius = legend_configuration["radius"];
        var radius_gap = legend_configuration["radius_gap"];
        var colorLegend = legend_configuration["colorLegend"];
        var pieLegend = legend_configuration["pieLegend"];
        var pieName = pieLegend.pie_name;
        var models_length = pieName.length;
        var inner_radius = radius - radius_gap;
        // ---------------------- Render Legend -------------------------- //
        let legend_pie_x = 10;
        let legend_pie_y = height - 10 - 100;
        var top_svg = d3.select("#force_directed_graph")
                .select("#svgChart")
                .attr("width", width)
                .attr("height", height);

        var legend_svg = top_svg.select("#ForceDirectedLegend")
            .attr("width", 100)
            .attr("height", 100)
            .attr("transform","translate("+legend_pie_x+","+legend_pie_y+")")

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
        function getArc(radius:number){
            return d3.arc()
            .innerRadius(radius)
            .outerRadius(radius*2);
        }
        let legend_x = 30;
        let legend_y = 50;
        //let legend_width = 200;
        let legend_height = 100;
        let legned_scale = 3;
        let legend_text_setting = [
            {
                "text":"Label",
                "text-anchor":"begin",
                "dominant-baseline":"central",
                "y_offset":+1
            }
        ]
        let y_offset_list = [-7.5, 0, +19]
        for(let i =0; i<models_length; i++){
            legend_text_setting.push({
                "text":pieName[i],
                "text-anchor":"begin",
                "dominant-baseline":"central",
                "y_offset":y_offset_list[i]
            })
        }

        let max_pie_text_length = 0;
        legend_text_setting.forEach((d:any)=>{
            let text = "" + d.text;
            if(text.length>max_pie_text_length){
                max_pie_text_length = text.length;
            }
        })
        
        let legend_width = max_pie_text_length*8+80;


        this.refresh_number = this.refresh_number + 1;
        let legend_pie_all = legend_svg.selectAll("g.legend_pie")
                        .data([this.refresh_number], function(d:any){
                            return d;
                        });
            legend_pie_all.exit().remove();
        //console.log("Refreshnumber",this.refresh_number,pieName);
        let legend_pie = legend_pie_all.enter().append("g")
                        .attr("class", "legend_pie")
                        .attr("transform", "translate("+legend_x+","+legend_y+")")
        legend_pie.append("rect")
        .attr("x", -legend_x)
        .attr("y", -legend_y)
        .attr("width", legend_width)
        .attr("height", legend_height)
        .attr("fill", "#fff")
        .attr("opacity", 0.8)
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1)
        .attr("rx",3)
        .attr("ry",3)
                        //let overall_background = [];
        let legend_Color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];
        legend_pie.append("circle")
        .attr("class","inner_circle")
        .attr("r", inner_radius*legned_scale)
        .attr("fill", function(d:any) { return legend_Color[0]; })
        .attr("stroke", "white");
    
            
        function constructPathOnNodeList(nodelist:any){
            // 
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
        for (let i = 0; i < models_length; i++){
            let background_enter = legend_pie.append("path").attr("class","arc_"+i)
            let background = legend_pie.select("path.arc_"+i);
            let background_enter_update  = background_enter.merge(background);
            background_enter_update
            .style("fill", function(d:any){
                return legend_Color[i+1]
            })
            .attr("d", getArc(radius*legned_scale)(arcs[i]))
            .style("stroke","#ddd")
            .style("stroke-width",1);
            //overall_background.push(background_enter_update);

            let start_point = [1.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 1.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))]
            let middle_point = [1.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 2.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]

            if(i===1){
                middle_point= [2.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 2.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]
            }else{

            }
            let end_point = [2.5*legned_scale*radius*Math.sin((+60)/180*Math.PI) ,2.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]

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
        let gt_x = 2.5*legned_scale*radius*Math.sin((+60)/180*Math.PI);
        let gt_y = 2.5*legned_scale*radius*(-Math.cos((+60)/180*Math.PI))+legend_text_setting[0]["y_offset"];
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
        // x = 7.5*Radius*(sin(60/180/240))
        // y = 7.5*Radius*(-cos(60/180/240)) 
        
        // ---------------- Color Legend -------------------------//
         let legend_color_x = 10;

        // ---- Calculate the legend color width and height.
         let max_text_length = 0;
         colorLegend.forEach((d:any)=>{
             let text = "" + d.text;
             if(text.length>max_text_length){
                 max_text_length = text.length;
             }
         })
         
         let legend_color_width = max_text_length*8+24;
         //console.log("maxtextlength", max_text_length, legend_color_width);
         let legend_color_height = colorLegend.length*20;
         // ----------------------------------------------

         let legend_color_y = legend_pie_y - legend_color_height - 10;
         var legend_color_svg = top_svg.select("#ForceDirectedColorLegend")
             .attr("width", legend_color_width)
             .attr("height", legend_color_height)
             .attr("transform", "translate("+legend_color_x+","+legend_color_y+")")
         let legend_rect = legend_color_svg.selectAll("rect").data([0]);
         let legend_rect_enter = legend_rect.enter().append("rect");
         //console.log("legend_rect", legend_rect);
         legend_rect_enter.merge(legend_rect)
             .attr("x", 0)
             .attr("y", 0)
             .attr("width", legend_color_width)
             .attr("height", legend_color_height)
             .attr("fill", "#fff")
             .attr("opacity", 0.8)
             .attr("stroke", "#bbb")
             .attr("stroke-width", 1)
             .attr("rx",3)
             .attr("ry",3);
        this.renderColorLegend(legend_color_svg, colorLegend);
                
     }
     public renderCanvas(){

        // initialize 
        var onNodeClick = this.props.onNodeClick;
        var nodenum = this.props.graph_json.nodenum;
        var enabledForceDirected = this.props.graph_json.enable_forceDirected;
        var neighborSet = this.props.graph_json.NeighborSet;
        var colorLegend = this.props.graph_json.colorLegend;
        var pieLegend = this.props.graph_json.pieLegend;
        var pieName = pieLegend.pie_name;
        var configuration = {
            "strength": 0.01,
            "radius":15,
            "showlabel": true,
            "showarrow": true,
            "width": this.props.width,
            "height": this.props.height
        }
        var GraphViewState = this.props.GraphViewState;
        var DisplayUnfocusedNodes = GraphViewState.DisplayUnfocusedNodes;
        var DisplayOverview = GraphViewState.DisplayOverview;
        //console.log("ForceDirected" , nodenum)
        if(nodenum >= 100){
            configuration = {
                "strength": 0.4,
                "radius":3,
                "showlabel": false,
                "showarrow": false,
                "width": this.props.width,
                "height": this.props.height
            }
        }

        var width = configuration["width"];
        var height = configuration["height"];
        var radius = configuration["radius"];
        var radius_gap = 0.3;
        var inner_radius = radius - radius_gap;
        var graphWidth =  this.props.width;
        var graphCanvas = d3.select('#force_directed_graph').select('#bottom')
        .attr('width', graphWidth + 'px')
        .attr('height', height + 'px')
        .node();
        
        var context = graphCanvas.getContext('2d');
        var middleCanvas = d3.select('#force_directed_graph').select("#middle")
        .attr('width', graphWidth + 'px')
        .attr('height', height + 'px')
        .node();
        var middle_context = middleCanvas.getContext('2d');
        var overviewCanvas = d3.select('#force_directed_graph').select('#overview')
        .attr('width', graphWidth + 'px')
        .attr('height', height + 'px')
        .node();
        var overview_context = overviewCanvas.getContext('2d');
        var eventCanvas = d3.select('#force_directed_graph').select("#event")
        .attr('width', graphWidth + 'px')
        .attr('height', height + 'px')
        .node();
         /**
         * OverviewCanvas
         */
        let canvasWidth = 100;
        let canvasHeight = 100;
        let margin = 10;
        let canvasX = graphWidth - canvasWidth - margin;
        let canvasY = height - canvasHeight - margin;
        let canvasXRight = canvasX + canvasWidth;
        let canvasYBottom = canvasY + canvasHeight;
        let radius_collision = radius*3 + radius_gap*3;
        if(this.global_simulation){
            this.global_simulation.stop();
            delete this.global_simulation;
        }
        var simulation = d3.forceSimulation()
                      .force("center", d3.forceCenter(graphWidth / 2, height / 2))
                      .force("x", d3.forceX(graphWidth / 2).strength(0.1))
                      .force("y", d3.forceY(height / 2).strength(0.1))
                      .force("charge", d3.forceManyBody().strength(-50))
                      .force("link", d3.forceLink().strength(1).id(function(d:any) { return d.id; }))
                      .force('collide', d3.forceCollide().radius((d:any) => radius_collision))
                      .alphaTarget(0)
                      .alphaDecay(0.05)
                      
        this.global_simulation = simulation;
        var legend_configuration:any = {
            "width":width,
            "height":height,
            "radius":radius,
            "radius_gap":radius_gap,
            "colorLegend":colorLegend,
            "pieLegend":pieLegend
        }
        // Render Legend
        this.renderLegend(legend_configuration);
        






        let updateTransform = this.updateTransform;

        var transform:any;
        var calTransform:any={
            "x":0,
            "y":0,
            "k":1
        };
        if(this.saved_transform){
            transform =this.saved_transform ;
        }else{
            transform = d3.zoomIdentity;
        }
        
        function order_determine(a:any,b:any){
            let hover_cons_a = a.hasOwnProperty("hover_cons")?a.hover_cons:1;
            let hover_cons_b = b.hasOwnProperty("hover_cons")?b.hover_cons:1;
            let node_outer_radius_a = a.radius*hover_cons_a*2;
            let node_outer_radius_b = a.radius*hover_cons_b*2;
            return node_outer_radius_a<node_outer_radius_b?-1:1;
        }
        function judgeHoveredFlag(d:any, bool:boolean){
            if(!d.hasOwnProperty("hovered") || d["hovered"]===false ){
                if(bool === false){
                    return false;
                }else{
                    return true;
                }
            }else{
                if(bool === true){
                    return false;
                }else{
                    return true;
                }
            }
        }
        function hiddenTooltip(){
            d3.select("#force_directed_graph").select("#tooltip").style('opacity', 0);

        }

        
        let tempData = this.props.graph_json;
        let event_canvas = eventCanvas;
        var mouseCoordinates:any = null;
        d3.select(event_canvas).on("click",handleMouseClick).on("mousemove", handleMouseMove).on("mouseout",handleMouseOut);
        d3.select(event_canvas).call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))
        
        if(enabledForceDirected){
            simulation
                .nodes(tempData.nodes)
                .on("tick", simulationUpdate);

            simulation.force("link")
                .links(tempData.links);

        }else{
            simulation.stop();
            simulation
                .nodes(tempData.nodes);

            simulation.force("link")
                .links(tempData.links);
            simulationUpdate();
        }
        
        function determineSubject(mouse_x:number,mouse_y:number){
            var i,
            x = transform.invertX(mouse_x),
            y = transform.invertY(mouse_y),
            dx,
            dy;
            let newNodeList = tempData.nodes.slice().sort(order_determine)
            for (i = newNodeList.length - 1; i >= 0; --i) {
                var node = newNodeList[i];
                if(!DisplayUnfocusedNodes && !node["highlight"]){
                    continue;
                }
                dx = x - node.x;
                dy = y - node.y;
                let hover_cons = node.hasOwnProperty("hover_cons")?node.hover_cons:1;
                let outer_radius_node = node.radius * 2 * hover_cons;
                if (dx * dx + dy * dy < outer_radius_node * outer_radius_node) {
                    return node;
                }
            }
            return null;
        }
       
        function determineEventSubject(mouse_x:number, mouse_y:number){
            if(mouse_x >= canvasX && mouse_x <=canvasXRight 
                && mouse_y >= canvasY && mouse_y <=canvasYBottom && DisplayOverview){
                    return "OverviewCanvas";
                }else{
                    return "GraphCanvas";
                }
        }

        function zoomed(this:any) {
            var xy = d3.mouse(this);
            mouseCoordinates = xy;
            transform = d3.event.transform;
            if(determineEventSubject(xy[0], xy[1])==="GraphCanvas"){
                updateTransform(transform);
                simulationUpdate();
            }
        }
        
        function handleMouseMove(this:any, obj:any=null, defaultUpdateFlag:boolean=false){
            var xy:any;
            if(obj){
                xy = mouseCoordinates;
            }else{
                xy = d3.mouse(this);
                mouseCoordinates = xy;
            }
            
            var updateFlag = defaultUpdateFlag;

            if(xy){
                let event_subject = determineEventSubject(xy[0], xy[1]);
                var selected = determineSubject(xy[0],xy[1]);
                if(event_subject==="GraphCanvas"&&selected){
                    updateFlag = true;
                    let target_id = selected.id;
                    let target_title = selected.title;
                    d3.select("#force_directed_graph").select('#tooltip')
                        .style('opacity', 0.8)
                        .style('top', (xy[1] + 5) + 'px')
                        .style('left', (xy[0] + 5) + 'px')
                        .html(target_title);

                    let neighbor_id = neighborSet[selected.id];
                    tempData.nodes.forEach((d:any)=>{
                        if(target_id === d.id){
                            d.hovered = true;
                            d.hover_cons = 3;
                        }else  if(neighbor_id.indexOf(d.id)>=0){
                            d.hovered = true;
                            d.hover_cons = 2;
                        }else{   
                            d.hovered = false;
                            d.hover_cons = 1;
                        }
                    })
                    
                }else{
                    tempData.nodes.forEach((d:any)=>{
                        updateFlag = updateFlag || judgeHoveredFlag(d, false);
                        d.hovered = false;
                        d.hover_cons = 1;
                    })
                    hiddenTooltip();
                }
            }else{
                tempData.nodes.forEach((d:any)=>{
                    updateFlag = updateFlag || judgeHoveredFlag(d, false);
                    d.hovered = false;
                    d.hover_cons = 1;
                })
                hiddenTooltip();
            }
            
            if(updateFlag){
                middleCanvasSimulationUpdate()
            }
            
        }
        function handleMouseOut(this:any, obj:any=null, defaultUpdateFlag:boolean=false){
            var updateFlag = defaultUpdateFlag;
            mouseCoordinates = null;
            tempData.nodes.forEach((d:any)=>{
                updateFlag = updateFlag || judgeHoveredFlag(d, false);
                d.hovered = false;
                d.hover_cons = 1;
            })
            hiddenTooltip();
            if(updateFlag){
                middleCanvasSimulationUpdate()
            }
        }
        function handleMouseClick(this:any, obj:any=null, defaultUpdateFlag:boolean=false){
            if (d3.event.defaultPrevented) return; // zoomed

            var xy:any;
            if(obj){
                xy = mouseCoordinates;
            }else{
                xy = d3.mouse(this);
                mouseCoordinates = xy;
            }

            if(xy){
                if(determineEventSubject(xy[0],xy[1])==="OverviewCanvas"){
                    moveFocalPoint(xy[0], xy[1]);
                }else{
                    var selected = determineSubject(xy[0],xy[1]);
                    if(selected){
                        onNodeClick(selected.id);
                    }
                }

            }else{

            }
            
        }
        function calculateGraphBoundingBox(){
            //let canvasWidth = graphWidth;
            //let canvasHeight = height;
            let minx=0, miny=0, maxx=0, maxy=0;
            let flag = false;
            tempData.nodes.forEach(function(d:any){
                if(DisplayUnfocusedNodes || (!DisplayUnfocusedNodes && d.highlight)){
                    let x = d.x;
                    let y = d.y;
                    if(!flag){
                        minx = x;
                        miny = y;
                        maxx = x;
                        maxy = y;
                        flag = true;
                    }else{
                        if(minx > x){
                            minx = x;
                        }
                        if(maxx < x){
                            maxx = x;
                        }
                        if(miny > y){
                            miny = y;
                        }
                        if(maxy < y){
                            maxy = y;
                        }
                    }
                }
                
            })
            let glyph_outer_radius = 3*2;
            let margin = 14;
            let leftbound = minx - glyph_outer_radius - margin;
            let upperbound = miny - glyph_outer_radius - margin;
            
            let occupyWidth = maxx - minx + glyph_outer_radius*2 + margin*2;
            let occupyHeight = maxy - miny + glyph_outer_radius*2 + margin*2;
            return {
                "leftbound":leftbound,
                "upperbound":upperbound,
                "occupyWidth":occupyWidth,
                "occupyHeight":occupyHeight
            }
        }
        function rectTransform(rect_configuration:any, transform:any){
            let rect_x = rect_configuration["x"];
            let rect_y = rect_configuration["y"];
            let rect_width = rect_configuration["width"];
            let rect_height = rect_configuration["height"];
            let dx = transform.x;
            let dy = transform.y;
            let scale = transform.k;
            let x = (rect_x*scale + dx) ;
            let y = (rect_y*scale + dy) ;
            let width = (rect_width) * scale;
            let height = (rect_height) * scale;
            return {
                "x":x,
                "y":y,
                "width":width,
                "height":height
            }
        }
        function rectInverseTransform(rect_configuration:any, transform:any){
            let rect_x = rect_configuration["x"];
            let rect_y = rect_configuration["y"];
            let rect_width = rect_configuration["width"];
            let rect_height = rect_configuration["height"];
            let dx = -transform.x;
            let dy = -transform.y;
            let scale = 1/transform.k;
            let x = (rect_x + dx) * scale;
            let y = (rect_y + dy) * scale;
            let width = (rect_width) * scale;
            let height = (rect_height) * scale;
            return {
                "x":x,
                "y":y,
                "width":width,
                "height":height
            }
        }
        function pointInverseTransform(point_configuration:any, transform:any){
            let point_x = point_configuration["x"];
            let point_y = point_configuration["y"];
            let dx = -transform.x;
            let dy = -transform.y;
            let scale = 1/transform.k;
            let x = (point_x + dx) * scale;
            let y = (point_y + dy) * scale;
            return {
                "x":x,
                "y":y
            }
        }
        function moveFocalPoint(mouse_x:number, mouse_y:number){
            let ori_point = {
                "x":graphWidth / 2,
                "y":height / 2
            }
            let ori_inverse_point = pointInverseTransform(ori_point, transform);
            
            let overview_point = {
                "x": mouse_x,
                "y": mouse_y
            }
            let overview_inverse_point = pointInverseTransform(overview_point, calTransform);
            let new_x = -(overview_inverse_point["x"] - ori_inverse_point["x"])*transform.k + transform.x;
            let new_y = -(overview_inverse_point["y"] - ori_inverse_point["y"])*transform.k + transform.y;
            console.log({
                ori_point, ori_inverse_point, overview_point, overview_inverse_point, new_x, new_y
            })
            transform.x = new_x;
            transform.y = new_y;
            updateTransform(transform);
            simulationUpdate();
            
        }
        function rectInverseTransformAndClip(rect_configuration:any,transform:any, bounding_box:any){
            let leftbound = bounding_box["leftbound"];
            let upperbound = bounding_box["upperbound"];
            let occupyHeight = bounding_box["occupyHeight"];
            let occupyWidth = bounding_box["occupyWidth"];
            let rightbound = leftbound + occupyWidth;
            let lowerbound = upperbound + occupyHeight;
            let inverse_transform_rect = rectInverseTransform(rect_configuration, transform);
            let transformed_leftbound = inverse_transform_rect["x"];
            let transformed_upperbound = inverse_transform_rect["y"];
            let transformed_rightbound = inverse_transform_rect["x"]+inverse_transform_rect["width"];
            let transformed_lowerbound = inverse_transform_rect["y"]+inverse_transform_rect["height"];

            if(transformed_leftbound<leftbound){
                transformed_leftbound = leftbound;
            }
            if(transformed_rightbound>rightbound){
                transformed_rightbound = rightbound;
            }
            if(transformed_upperbound<upperbound){
                transformed_upperbound = upperbound;
            }
            if(transformed_lowerbound>lowerbound){
                transformed_lowerbound = lowerbound;
            }
            let clipx = transformed_leftbound;
            let clipy = transformed_upperbound;
            let clipwidth = transformed_rightbound - transformed_leftbound;
            let clipheight = transformed_lowerbound - transformed_upperbound;
            if(clipwidth < 0){
                clipwidth = 0;
            }else if(clipwidth>occupyWidth){
                clipwidth = occupyWidth;
            }
            if(clipheight<0){
                clipheight=0;
            }else if(clipheight>occupyHeight){
                clipheight = occupyHeight;
            }
            return {
                "x":clipx,
                "y":clipy,
                "width":clipwidth,
                "height":clipheight
            }

        }
        function calculateTransform(canvasX:number,canvasY:number,canvasWidth:number, canvasHeight:number, bounding_box:any){
            let leftbound = bounding_box["leftbound"];
            let upperbound = bounding_box["upperbound"];
            let occupyHeight = bounding_box["occupyHeight"];
            let occupyWidth = bounding_box["occupyWidth"];
            let xscale = canvasWidth / occupyWidth;
            let yscale = canvasHeight / occupyHeight;
            let scale = Math.min(xscale, yscale);
            let dx = (canvasWidth - occupyWidth * scale)/2 - leftbound*scale + canvasX;
            let dy = (canvasHeight - occupyHeight * scale)/2 - upperbound*scale + canvasY;
            //console.log("canvasWidth, canvasHeight, occupyWidth, occupyHeight", canvasWidth,canvasHeight, occupyWidth,occupyHeight);
            let calTransform = {
                "k": scale,
                "x":dx,
                "y":dy

            }
            return calTransform;

        }
        function renderContext(context:any){


            // Unfocused nodes rendering.
            if(DisplayUnfocusedNodes){
                tempData.links.filter((d:any)=>{
                    if(d.source.highlight && d.target.highlight){
                        return false;
                    }else{
                        return true;
                    }
                }).forEach(function(d:any) {
                    drawLine(context, d.color, d.source.x, d.source.y, d.target.x, d.target.y, null, d.weight);
                });
        
                // Draw the nodes
                tempData.nodes.filter((d:any)=>{
                    return !d["highlight"];
                }
                ).forEach(function(d:any, i:any) {
                    //console.log("radius",d.radius);
                    let node_inner_radius = d.radius - radius_gap;
                    let node_radius = d.radius;
                    let node_outer_radius = d.radius * 2;
                    let node_outer_arc_encoded_value = d.node_weight;
                    drawNodeGlyph(context, d.color, node_inner_radius, node_radius, 
                        node_outer_radius, d.x, d.y, false, node_outer_arc_encoded_value, true);
                });
            }
            
            
            tempData.links.filter((d:any)=>{
                if(d.source.highlight && d.target.highlight){
                    return true;
                }else{
                    return false;
                }
            }).forEach(function(d:any) {
                drawLine(context, d.color, d.source.x, d.source.y, d.target.x, d.target.y, 5 * d.weight, d.weight);
            });
            tempData.nodes.filter((d:any)=>{
                return d["highlight"];
                
            }).forEach(function(d:any,i:any){
                let node_inner_radius = d.radius - radius_gap;
                let node_radius = d.radius;
                let node_outer_radius = d.radius * 2;
                let node_outer_arc_encoded_value = d.node_weight;
                drawNodeGlyph(context, d.color, node_inner_radius, node_radius, 
                    node_outer_radius, d.x, d.y, false, node_outer_arc_encoded_value, true);

            })
        }
        function simulationUpdate(){
            context.save();
            context.clearRect(0, 0, graphWidth, height);
            context.translate(transform.x, transform.y);
            context.scale(transform.k, transform.k);
            console.log("simulationUpdate",transform);
            renderContext(context);
            context.restore();
            
            //let canvasWidth = 100 * graphWidth / height;
            if(DisplayOverview){
                let graph_bounding_box = calculateGraphBoundingBox();
                calTransform = calculateTransform(canvasX, canvasY, canvasWidth, canvasHeight, graph_bounding_box);
                console.log("calTransform", calTransform);
                let rect_configuration = {
                    "x":0, "y":0, "width":graphWidth, "height":height
                }
                let overview_configuration = {
                    "x":canvasX,
                    "y":canvasY,
                    "width":canvasWidth,
                    "height":canvasHeight
                }
                let overview_inverse_rect = rectInverseTransform(overview_configuration, calTransform);
                let overview_bounding_box = {
                    "leftbound":overview_inverse_rect["x"],
                    "upperbound":overview_inverse_rect["y"],
                    "occupyWidth":overview_inverse_rect["width"],
                    "occupyHeight":overview_inverse_rect["height"]
                }
                let view_inverse_configuration = rectInverseTransformAndClip(rect_configuration, transform, overview_bounding_box);
                let view_configuration = rectTransform(view_inverse_configuration, calTransform); 
    
                overview_context.save();
                overview_context.clearRect(0, 0, graphWidth, height);
                drawRectStroke(overview_context, canvasX, canvasY, canvasWidth, canvasHeight);
                drawRect(overview_context, canvasX, canvasY, canvasWidth, canvasHeight);
                
                overview_context.translate(calTransform.x, calTransform.y);
                overview_context.scale(calTransform.k, calTransform.k);
                renderContext(overview_context);
                overview_context.scale(1/calTransform.k, 1/calTransform.k);
                overview_context.translate(-calTransform.x, -calTransform.y);
                drawRectStroke(overview_context, view_configuration["x"], view_configuration["y"], view_configuration["width"], view_configuration["height"],"#000");
                drawRect(overview_context, view_configuration["x"], view_configuration["y"], view_configuration["width"], view_configuration["height"],"#ccc",0.5);
                overview_context.restore();
                
            }
            
            
            handleMouseMove(middleCanvas, true);
        }
        function middleCanvasSimulationUpdate(){
            let judgeHovered = (d:any)=>{
                if(d.hasOwnProperty("hovered") && d["hovered"]){
                    return true;
                }else{
                    return false;
                }
            }
            middle_context.save();
            
            middle_context.clearRect(0, 0, graphWidth, height);
            middle_context.translate(transform.x, transform.y);
            middle_context.scale(transform.k, transform.k);
            tempData.links.filter((d:any)=>{
                if(judgeHovered(d.source) && judgeHovered(d.target)){
                    return true;
                }else{
                    return false;
                }
            }).forEach(function(d:any) {
                drawLine(middle_context, d.real_color, d.source.x, d.source.y, d.target.x, d.target.y, null, d.weight);
            });
            // Draw the hovered nodes
            tempData.nodes.filter((d:any)=>{
                return judgeHovered(d);
            }).sort(order_determine).forEach(function(d:any, i:any) {
                let node_inner_radius = d.radius - radius_gap;
                let node_radius = d.radius;
                let node_outer_radius = d.radius * 2;
                let node_outer_arc_encoded_value = d.node_weight;
                drawNodeGlyph(middle_context, d.real_color, node_inner_radius*d.hover_cons, 
                    node_radius*d.hover_cons, node_outer_radius*d.hover_cons, d.x, d.y, true,
                    node_outer_arc_encoded_value, false);
            });
            middle_context.restore();
        }
     }
 
    public render() {     
        return (
            <div id="force_directed_graph">
                <canvas id="bottom" className="AbsPos" />
                <canvas id="middle" className="AbsPos"/>
                <canvas id="overview" className="AbsPos"/>
                <svg
                    id="svgChart"
                    xmlns="http://www.w3.org/2000/svg"
                    className="AbsPos"
                >
                    <g id="ForceDirectedLegend">

                    </g>
                    <g id="ForceDirectedColorLegend">

                    </g>
                </svg>
                <div id="tooltip" className="AbsPos" />
                
                <canvas id="event" className="AbsPos"/>
            </div>
            

        )

    }
}

