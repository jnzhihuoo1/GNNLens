
import * as React from "react";
import {getCoraNodeColor} from '../../../helper';
const d3 = require("d3");

export interface IProps {
    data_json :any,
    width : number,
    height: number
}
export interface IState {
}

export default class NodeGlyph extends React.Component<IProps, IState>{
    private TAB : string= "NodeGlyph_";
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
        
        if(prevProps.data_json.Id !== this.props.data_json.Id){
            //d3.selectAll("#ForceDirected").remove();
            this.renderD3();
        }

        
     }

    public renderD3(){
        var data_json = this.props.data_json;
        console.log("NodeGlyph", data_json)
        var arc = d3.arc()
    	.innerRadius(50)
    	.outerRadius(60)
              
		var svg = d3.select("#"+this.TAB);
        var width = this.props.width;
        var height = this.props.height;
        var g = svg.select("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 +")")
        let trans = d3.transition()
                .duration(1000)
                .ease(d3.easeLinear);
        var data = [{
            "index":0,
            "value":data_json.one_hop_accuracy
        }, {
            "index":1,
            "value":1-data_json.one_hop_accuracy
        }];
        var ori_arcs = d3.pie()
        .startAngle(0 * Math.PI)
        .endAngle(2 * Math.PI)
        .value(function(a:any){
            return a.value;
        })
        .sort(function(a:any, b:any) {
            return a.index<b.index;
        });
        var arcs = ori_arcs(data);
        var rect_colors = [getCoraNodeColor(data_json.ground_truth_label),
            getCoraNodeColor(data_json.correctness,5),getCoraNodeColor(data_json.prediction_label)]
        console.log("arcs: ", arc(arcs[0]))
        var rectwidth = 15;
        var arc_colors = ["#FE8F2E", "#eeeeee"]
        var background = g.selectAll("path")
                .data([0,1]);
            console.log("background", background,background.size(),background.enter().size(),background.exit().size())
            background.enter()
                .append("path")
            .style("fill", function(d:any,i:any){
                return arc_colors[i];
            }).attr("d", function(d:any,i:any){
                return arc(arcs[i]);
            });

            background.attr("d", function(d:any,i:any){
                return arc(arcs[i]);
            });
        var rect = g.selectAll("rect")
            .data([-1,0,1]);

            rect.enter()
            .append("rect")
            .attr("x", function(d:any){
                return d*rectwidth -rectwidth/2;
            })
            .attr("y", -rectwidth/2)
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("width", rectwidth)
            .attr("height", rectwidth)
            .attr("fill", function(d:any,i:any){
                return rect_colors[i];
            });
            rect.attr("fill", function(d:any,i:any){
                return rect_colors[i];
            })
        var text_contents = ["ID: "+data_json.Id, "Degree: "+data_json.degree];
        var text_y = [-rectwidth, rectwidth + 10]
        var text = g.selectAll("text")
            .data([-0.5,1]);

            text.enter()
            .append("text")
            .attr("y",function(d:any,i:any){
                return text_y[i];
            })
            .attr("x",0)
            .attr("text-anchor","middle")
            
            .text(function(d:any,i:any){
                return text_contents[i];
            });
            text.text(function(d:any,i:any){
                return text_contents[i];
            });
       
    }
    public render() {
        return (
            <svg
                    style={{ height: '100%', width: '100%' }}
                    id={this.TAB}
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <g> </g>
            </svg>
        )

    }
}

