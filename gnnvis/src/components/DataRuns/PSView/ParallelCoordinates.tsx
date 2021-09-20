
import './ParallelCoordinates.css'
import * as React from "react";
import {getInfectionNodeColor, getInfectionEdgeColor, getCoraNodeColor, getLayoutMode} from '../../../helper';

const d3 = require("d3");

export interface IProps {
    PCPJson:any,
    changeFilters:any,
    width: number,
    height:number
}
export interface IState {
}

export default class ParallelCoordinates extends React.Component<IProps, IState>{

    constructor(props:IProps) {
        super(props);
        this.state = {

        }
        //this.resize.bind(this);
        // Flow:
        // 1. Constructor
        // 2. componentWillMount()
        // 3. render()
        // 4. componentDidMount()
        // If props update:
        // 4.1 componentWillReceiveProps(nextProps : IProps), then goto 5.
        // If States update
        // 5. shouldComponentUpdate() if return false, then no rerendering.
        // 6. if True, then componentWillUpdate
        // 7. render()
        // 8. componentDidUpdate
        // If Unmount, then componentWillUnmount()
    }
    // Component Configurable Methods.
    componentDidMount(){
        this.renderD3();
    }
    // Mount
    componentWillMount() {
        //console.log('Component will mount!')
     }

     
    // Update
     shouldComponentUpdate(nextProps:IProps, nextState:IState){
        return true;
    }
     componentWillUpdate(nextProps:IProps, nextState:IState) {
        //console.log('Component will update!');
     }

     componentDidUpdate(prevProps:IProps, prevState:IState) {
        //console.log('Component did update!')
        if(prevProps.PCPJson.name !== this.props.PCPJson.name){
            d3.selectAll("#ParallelCoordinates_SVG").remove();
            this.props.changeFilters({});
            this.renderD3();
        }

        
     }

    public renderD3(){
        /*
        * Parallel Coordinates visualization, inspired by :
        * Byron Houwens : https://codepen.io/BHouwens/pen/RaeGVd?editors=0010
        * Mike Bostock : https://bl.ocks.org/mbostock/1341021
        *
        */

        /*
        * Data
        *****************************/
        let {PCPJson,changeFilters} = this.props;
        console.log("PCPJson", PCPJson);
        const data = PCPJson["PCPData"];
        
        const features = PCPJson["PCPDimension"];
        const ground_truth_label_stats = PCPJson["ground_truth_label_stats"];
        let layout_mode = getLayoutMode();
        /*
        * Parameters
        *****************************/
        const width = this.props.width, height = this.props.height, brush_width = 20;
        const padding_top = 50;
        const padding_bottom = 15;
        const padding_left = 40;
        const padding_right = 60;

        const real_width_left = padding_left;
        const real_width_right = width - padding_right;
        const real_height_top = padding_top;
        const real_height_bottom = height - padding_bottom;
        const filters:any = {};
        let typedict :any = {};
        /*
        * Helper functions
        *****************************/
        // Horizontal scale
        const xScale = d3.scalePoint()
            .domain(features.map((x:any)=>x.name))
            .range([real_width_left, real_width_right]);
        
        // Each vertical scale
        const yScales:any = {};
        features.map((x:any)=>{
            typedict[x.name] = x.type;
            if(x.type==="continuous"){
                
                yScales[x.name] = d3.scaleLinear()
                .domain(x.range)
                .range([real_height_bottom, real_height_top]);
            }else if(x.type==="ordinal"){
                //console.log(x);
                yScales[x.name] = d3.scalePoint()
                .domain(x.range)
                .range([real_height_bottom, real_height_top]);
            }else if(x.type==="log"){
                yScales[x.name] = d3.scaleLog().base(2)
                .domain(x.range)
                .range([real_height_bottom, real_height_top]);
                console.log("Test", yScales[x.name](5))
            }else{
                console.log("Unexpected Type: ", x.type);
            }
            
        });
        //yScales.team = d3.scaleOrdinal()
        //    .domain(features[0].range)
        //    .range([real_height_bottom, real_height_top]);
        
        // Each axis generator
        const yAxis:any = {};
        
        d3.entries(yScales).map((x:any)=>{
            yAxis[x.key] = d3.axisLeft(x.value);
        });
        
        // Each brush generator
        const brushEventHandler = function(feature:any){
            if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            if(d3.event.selection != null){
                let brushExtent = d3.event.selection;
                if(typedict[feature]==="continuous" || typedict[feature]==="log"){
                    filters[feature] = brushExtent.map((d:any)=>yScales[feature].invert(d));
                }else if(typedict[feature] ==="ordinal"){
                    var selected =  yScales[feature].domain().filter(function(d:any){
                        return (brushExtent[0] <= yScales[feature](d)) && (yScales[feature](d) <= brushExtent[1])
                    });
                    filters[feature] = selected;            
                    //d3.select(".selected").text(selected.join(","));
                }else{
                    console.log("Unexpected type: ", typedict[feature]);
                }
                
            }else{
                if(feature in filters) delete(filters[feature]);
            }
            applyFilters();
            //console.log(filters);
            changeFilters(filters);
        }
        
        const applyFilters = function(){
            d3.select('g.active').selectAll('path')
            .style('display', (d:any)=>(selected(d)?null:'none'));
        }
                    
        const selected = (d:any)=>{
            const _filters = d3.entries(filters);
            return _filters.every((f:any)=>{
                if(typedict[f.key]==="continuous" || typedict[f.key]==="log"){
                    return f.value[1] <= d[f.key] && d[f.key] <= f.value[0];
                }else if(typedict[f.key]==="ordinal"){
                    return f.value.indexOf(d[f.key])>=0;
                }else{
                    console.log("Unexpected type :", typedict[f.key]);
                }
                
            });
        }
        
        const yBrushes:any = {};
        d3.entries(yScales).map((x:any)=>{
            let extent = [
            [-(brush_width/2), real_height_top],
            [brush_width/2, real_height_bottom]
            ];
            yBrushes[x.key]= d3.brushY()
            .extent(extent)
            .on('brush', ()=>brushEventHandler(x.key))
            .on('end', ()=>brushEventHandler(x.key));
        });
        
        // Paths for data
        const lineGenerator = d3.line();
        
        const linePath = (d:any)=>{
            const _data = d3.entries(d).filter((x:any)=>x.key!='data_id');
            let points = _data.map((x:any)=>([xScale(x.key),yScales[x.key](x.value)]));
            return(lineGenerator(points));
        }
        
        /*
        * Parallel Coordinates
        *****************************/
        // Main svg container
        const pcSvg = d3.select('div.parallelCoordinates')
            .append('svg')
            .attr("id","ParallelCoordinates_SVG")
            .attr('width', width)
            .attr('height', height);
        
        // Inactive data
        pcSvg.append('g').attr('class','inactive').selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .attr('d', (d:any)=>linePath(d));
        
        // Inactive data
        pcSvg.append('g').attr('class','active').selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .attr('d', (d:any)=>linePath(d));
        
        // Vertical axis for the features
        const featureAxisG = pcSvg.selectAll('g.feature')
            .data(features)
            .enter()
            .append('g')
                .attr('class','feature')
                .attr('transform',(d:any)=>('translate('+xScale(d.name)+',0)'));
        
        let feature_axis_group = featureAxisG
                .append('g')
                .each(function(this:any, d:any){
                    d3.select(this).call(yAxis[d.name]);
                });
        //if(layout_mode === 2){
            let ground_truth_label_axis = feature_axis_group.filter(function(d:any){
                if(d.name==="ground_truth_label"){
                    return true;
                }else{
                    return false;
                }
            }).selectAll("g.tick");
            
            ground_truth_label_axis
            .each(function(this:any, d:any){
                let arc = d3.arc()
                    .innerRadius(8)
                    .outerRadius(10)
                    .cornerRadius(0);
                let accuracy = ground_truth_label_stats[d]["accuracy"];
                let max_percentage = ground_truth_label_stats[d]["max_percentage"]
                let arcdata = [accuracy, 1- accuracy];
                let arcs = d3.pie()(arcdata);
                let arc_colors = [getCoraNodeColor(1,5), getCoraNodeColor(0,5)]
                let background = d3.select(this)
                    .append("g")
                    .attr("transform","translate(-14,0)")
                    .selectAll("path.arcs_accuracy")
                    .data([0,1]);
                background.enter()
                    .append("path")
                    .attr("class", "arcs_accuracy")
                .style("fill", function(d:any,i:any){
                    return arc_colors[i];
                }).attr("d", function(d:any,i:any){
                    return arc(arcs[i]);
                });
    
                background.attr("d", function(d:any,i:any){
                    return arc(arcs[i]);
                });
                let axis_rect =  d3.select(this).append("rect")
                    .attr("x", 1)
                    .attr("y", -2.5)
                    .attr("width", 20*max_percentage)
                    .attr("height", 5)
                    .style("fill", function(d:any, i:any){
                    return "#999";
                    })
                    .style("fill-opacity", 0.99);
                    

            })
        //}
        
        
        featureAxisG
            .each(function(this:any, d:any){
            d3.select(this)
                .append('g')
                .attr('class','brush')
                .call(yBrushes[d.name]);
            });
        
        let featureAxisGText = featureAxisG
            .append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr('y', real_height_top - 10)
            .text((d:any)=>d.name);
           
        if(layout_mode === 1 || layout_mode === 3){
            featureAxisGText.attr("transform","rotate(-21)translate(-5,-6)");
        }
    }
    public render() {
        return (
            <div className="parallelCoordinates" />
        )

    }
}

