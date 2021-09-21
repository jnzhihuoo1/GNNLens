
import './PathGraph.css'
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

export default class PathGraph extends React.Component<IProps, IState>{
    private TAB = "PathGraph_"
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
            d3.selectAll("#PathGraph"+this.props.id).remove();
            this.renderD3();
        }

        
     }

    public renderD3(){
        var nodenum = this.props.graph_json.nodenum;
        var configuration = {
            "strength": 0.01,
            "radius":15,
            "showlabel": true,
            "showarrow": true,
            "width": 600,
            "height": 600
        }
        console.log("PathGraph" , nodenum)
        console.log("PathGraph", this.props.graph_json);
        if(nodenum >= 100){
            configuration = {
                "strength": 1,
                "radius":3,
                "showlabel": false,
                "showarrow": false,
                "width": 1700,
                "height": 1600
            }
        }
        var top_svg = d3.select("#"+this.TAB+this.props.id);
        var width = configuration["width"];
        var height = configuration["height"];
        var svg = top_svg.append("g")
            .attr("id","PathGraph"+this.props.id)
            .attr("width", width)
            .attr("height", height);
        //var width = +svg.attr("width"),
        //    height = +svg.attr("height");
        //console.log(width,height)

        var color = d3.scaleOrdinal(d3.schemeCategory10);
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d:any) { return d.id; }).strength(configuration["strength"]))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));
        simulation.stop();
        
        
        
        function mappingGraph(graph:any) {
            if(configuration["showarrow"]){
                let defs = svg.append('defs');
                let link_color_list = graph.links_color;
                for(let i = 0; i< link_color_list.length;i++){
                    defs.append('marker')
                        .attr("id","arrowhead_"+link_color_list[i])
                        .attr("viewBox",'-0 -5 10 10')
                        .attr("refX", 22)
                        .attr("refY",0)
                        .attr("orient","auto")
                        .attr("markerWidth", 13)
                        .attr("markerHeight", 13)
                        .attr("xoverflow","visible")
                        .append('svg:path')
                        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                        .attr('fill', link_color_list[i])
                        .style('stroke','#DDDDDD');
                }
            }
            var link_enter = svg.append("g")
                .attr("class", "links")
                .selectAll("line")
                .data(graph.links)
                .enter().append("line");
            link_enter
                .attr("stroke", function(d:any){return d.color;})
                .attr("stroke-width", function(d:any) { return Math.sqrt(d.value); });
            if(configuration["showarrow"]){
                link_enter.attr('marker-end',function(d:any){return 'url(#arrowhead_'+d.color+')'})

            }
            var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(graph.nodes)
                .enter().append("g")
                
            var circles = node.append("circle")
                .attr("r", configuration["radius"])
                .attr("fill", function(d:any) { return d.color; });
            if(configuration["showlabel"]){
                var lables = node.append("text")
                    .text(function(d:any) {
                        return d.data_id;
                    })
                    .attr("fill","#000")
                    .attr("text-anchor","middle")
                    .attr('x', 0)
                    .attr('y', +4);
                circles.attr("stroke", "#222");
            }
            node.append("title")
                .text(function(d:any) { return d.data_id; });
            simulation
                .nodes(graph.nodes);

            simulation.force("link")
                .links(graph.links);
            function ticked() {
                link_enter
                    .attr("x1", function(d:any) { return d.source.x; })
                    .attr("y1", function(d:any) { return d.source.y; })
                    .attr("x2", function(d:any) { return d.target.x; })
                    .attr("y2", function(d:any) { return d.target.y; });

                node
                    .attr("transform", function(d:any) {
                    return "translate(" + d.x + "," + d.y + ")";
                    })
            }
            ticked();
            
            
            
        };
        mappingGraph(this.props.graph_json);
        
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

