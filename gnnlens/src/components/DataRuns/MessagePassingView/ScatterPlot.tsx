
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
        if(prevProps.graph_json.name !== this.props.graph_json.name){
            d3.selectAll("#ScatterPlot_sub_"+this.props.id).remove();
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
        var top_svg = d3.select("#"+this.TAB+this.props.id);
        var width = configuration["width"];
        var height = configuration["height"];
        var svg = top_svg.append("g")
            .attr("id","ScatterPlot_sub_"+this.props.id)
            .attr("width", width)
            .attr("height", height);
        //var width = +svg.attr("width"),
        //    height = +svg.attr("height");
        //console.log(width,height)
       // <rect x="50" y="20" width="150" height="150"
        //style="fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9" />
        svg.append("rect")
            .attr("x",0)
            .attr("y",0)
            .attr("width", this.props.width)
            .attr("height", this.props.height)
            .attr("fill","white")
            .attr("stroke","black")
            .attr("stroke-width",2)
            .attr("fill-opacity",0.1)
            .attr("stroke-opacity",0.4);
        svg.append("text")
            .attr("x",this.props.width/2)
            .attr("y",-20)
            .attr("text-anchor","middle")
            .text(this.props.caption);

        function mappingGraph(graph:any) {
            
            var node = svg.append("g")
                .attr("class", "nodes")
                .selectAll("g")
                .data(graph.nodes)
                .enter().append("g")
            
            var circles = node.append("circle")
                .attr("r", configuration["radius"])
                .attr("fill", function(d:any) { return d.color; })
            if(configuration["showlabel"]){
                var lables = node.append("text")
                    .text(function(d:any) {
                        return d.id;
                    })
                    .attr("fill","#000")
                    .attr("text-anchor","middle")
                    .attr('x', 0)
                    .attr('y', +4);
                circles.attr("stroke", "#222");
            }
            node.append("title")
                .text(function(d:any) { return d.id; });
            function ticked() {
                
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

