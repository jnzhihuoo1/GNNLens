
import './ScatterPlot.css'
import * as React from "react";
const d3 = require("d3");

export interface IProps {
    graph_json : any,
    id: number,
    x:number,
    y:number,
    width:number,
    height:number,
    caption:string
}
export interface IState {
}

export default class ScatterPlot extends React.Component<IProps, IState>{
    private TAB : string= "ScatterPlot_";
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
        if(prevProps.graph_json.name !== this.props.graph_json.name || prevProps.id !== this.props.id){
            //d3.selectAll("#ScatterPlot_sub_"+prevProps.id).remove();
            this.renderD3();
        }

        
     }

    public renderD3(){
        var nodenum = this.props.graph_json.nodenum;
        var configuration = {
            "radius":15,
            "showlabel": true,
            "width": this.props.width,
            "height": this.props.height
        }
        console.log("ScatterPlot" , nodenum)
        if(nodenum >= 100){
            configuration = {
                "radius":1,
                "showlabel": false,
                "width": this.props.width,
                "height": this.props.height
            }
        }
        var top_top_svg = d3.select("#TopSVGChart_ScatterPlot")
        var top_svg = d3.select("#"+this.TAB);
        var width = configuration["width"];
        var height = configuration["height"];
        
        var svg = top_svg.select("#ScatterPlot_sub");
            
            svg.attr("width", width)
            .attr("height", height);
            top_top_svg.call(d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.1, 8])
        .on("zoom", zoomed));
        function zoomed() {
            top_svg.attr("transform", d3.event.transform);
            }      
        //var width = +svg.attr("width"),
        //    height = +svg.attr("height");
        //console.log(width,height)
       // <rect x="50" y="20" width="150" height="150"
        //style="fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9" />
        /*svg.append("rect")
            .attr("x",0)
            .attr("y",0)
            .attr("width", this.props.width)
            .attr("height", this.props.height)
            .attr("fill","white")
            .attr("stroke","black")
            .attr("stroke-width",2)
            .attr("fill-opacity",0.1)
            .attr("stroke-opacity",0.4);*/
        /*svg.append("text")
            .attr("x",this.props.width/2)
            .attr("y",-20)
            .attr("text-anchor","middle")
            .text(this.props.caption);*/
        
       let trans = d3.transition()
                    .duration(1000)
                    .ease(d3.easeLinear);
        function mappingGraph(graph:any) {
            
            var nodes = svg.select('g.nodes')
                .selectAll("g")
                .data(graph.nodes,function(d:any){
                    return d.id;
                });
                console.log("EmbeddingView nodes enter update exit");
                console.log(nodes.enter().size());
                console.log(nodes.size());
                console.log(nodes.exit().size());
                
            var node_enter = nodes.enter().append("g");
            var node_enter_update = nodes.merge(node_enter);
            nodes.exit().remove();
           
            var circles_enter = node_enter.append("circle");
            var circles = nodes.select("circle");
            var circles_enter_update = circles.merge(circles_enter);
           console.log("Circles", circles_enter, circles_enter.size(), circles, circles.size())
            circles_enter_update.transition(trans)
                .attr("r", configuration["radius"])
                .attr("fill", function(d:any) { return d.color; })
                 
            if(configuration["showlabel"]){
                var labels_enter = node_enter.append("text");
                var labels_update = nodes.select("text");

                    labels_enter.merge(labels_update).text(function(d:any) {
                        return d.id;
                    })
                    .attr("fill","#000")
                    .attr("text-anchor","middle")
                    .attr('x', 0)
                    .attr('y', +4);
                    circles_enter_update.attr("stroke", "#222");
            }
            
            var title_enter = node_enter.append("title");
            nodes.select("title").merge(title_enter)
                .text(function(d:any) { return d.id; });
            function ticked() {
                
                node_enter.merge(nodes).transition(trans)
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
            <svg
                    style={{ height: '100%', width: '100%' }}
                    id={"TopSVGChart_ScatterPlot"}
                    xmlns="http://www.w3.org/2000/svg"
                    >
                <g
                transform={"translate("+this.props.x+","+this.props.y+")"}
                style={{ height: ""+this.props.height+"px", width: ""+this.props.width+"px" }}
                id={this.TAB}
                >
                    <g id={"ScatterPlot_sub"}>
                        <g className="nodes"></g>

                    </g>
                </g>
            </svg>
        )

    }
}

