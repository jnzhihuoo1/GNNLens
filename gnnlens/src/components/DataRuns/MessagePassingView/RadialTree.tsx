
import './RadialTree.css'
import * as React from "react";
const d3 = require("d3");

export interface IProps {
    graph_json : any,
    id: number,
    x:number,
    y:number,
    width:number,
    height:number,
}
export interface IState {
}

export default class RadialTree extends React.Component<IProps, IState>{
    private TAB = "RadialTree_"
    constructor(props:IProps) {
        super(props);
        this.state = {

        }

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
        if(prevProps.graph_json.name !== this.props.graph_json.name){
            d3.selectAll("#RadialTree"+this.props.id).remove();
            this.renderD3();
        }

        
     }

    public renderD3(){
        let RadialData = this.props.graph_json.RadialData;
        var width = this.props.width;
        var height = this.props.height;
        var tree_radius = Math.min(width / 2, height / 2) - 40;
        let radius = 2.5;
        let font_size = 7;
        if(RadialData.length >= 50){
            radius = 2.5;
            font_size = 7;
        }
        var top_svg = d3.select("#"+this.TAB+this.props.id);
        var svg = top_svg.append("g")
            .attr("id","RadialTree"+this.props.id)
            .attr("width", width)
            .attr("height", height);
        var rect = svg.append("rect")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", "white")
        
        var g = svg.append("g").attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
        top_svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.1, 8])
            .on("zoom", zoomed));
        
        function zoomed() {
        svg.attr("transform", d3.event.transform);
        }        
        var stratify = d3.stratify()
            .parentId(function(d:any) { return d.id.substring(0, d.id.lastIndexOf(".")); });

        var tree = d3.tree()
            .size([360 , tree_radius ])
            .separation(function(a:any, b:any) { return (a.parent === b.parent ? 1 : 2) / a.depth; });
        
        function project(x:any, y:any) {
            var angle = (x - 90) / 180 * Math.PI, radius = y;
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
        }
        
        var stratified_data = stratify(RadialData);
        //console.log(stratified_data);
        var root = tree(stratified_data);

        var link = g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("stroke", function(d:any){return d.data.link_color;})
            .attr("d", function(d:any) {
                return "M" + project(d.x, d.y)
                    + "C" + project(d.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                    + " " + project(d.parent.x, d.parent.y);
            });

        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function(d:any) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function(d:any) { return "translate(" + project(d.x, d.y) + ")"; });

        node.append("circle")
            .attr("r", radius)
            .attr("fill", function(d:any){ return d.data.color;});

        node.append("text")
            .attr("dy", ".31em")
            .attr("x", function(d:any) { return d.x < 180 === !d.children ? 6 : -6; })
            .attr("fill", function(d:any){return d.data.text_color;})
            .style("font-size", ""+font_size+"px")
            .style("text-anchor", function(d:any) { return d.x < 180 === !d.children ? "start" : "end"; })
            .attr("transform", function(d:any) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
            .text(function(d:any) { return d.id.substring(d.id.lastIndexOf(".") + 1); });
    


        
        
    }
    public render() {
        return (
            <g
            transform={"translate("+this.props.x+","+this.props.y+")"}
            style={{ height: ""+this.props.height+"px", width: ""+this.props.width+"px" }}
            id={this.TAB+this.props.id}
            >
            </g>
        )

    }
}

