
import './IndentedList.css'
import * as React from "react";
import { timeSaturday } from 'd3';
const d3 = require("d3");
const tree = d3.tree;
const hierarchy = d3.hierarchy;
const select = d3.select;

export interface IProps {
  feature_matrix_json : any,
  layout_config:any,
  MatrixRowFilters:any,
  changeMatrixRowFilters:any,
  id:number
}
export interface IState {
}

export default class IndentedTree extends React.Component<IProps, IState>{
    private TAB : string= "IndentedTree_";
    constructor(props:IProps) {
        super(props);
        this.updateMatrixFilters = this.updateMatrixFilters.bind(this);
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
     }

     
    // Update
     shouldComponentUpdate(nextProps:IProps, nextState:IState){
        return true;
    }
     componentWillUpdate(nextProps:IProps, nextState:IState) {
     }

     componentDidUpdate(prevProps:IProps, prevState:IState) {
         if(prevProps.feature_matrix_json.name !== this.props.feature_matrix_json.name ){
          d3.selectAll("#IndentedTree").remove();
          this.renderD3();
      }


        
     }
     public updateMatrixFilters(filters:any){
      let matrixfilters = Object.assign({}, this.props.MatrixRowFilters);
      matrixfilters["refreshnumber"] = matrixfilters["refreshnumber"] + 1;
      matrixfilters["row_index"] = filters;
      this.props.changeMatrixRowFilters(matrixfilters);
    }
    public renderD3(){
      let fdata:any = this.props.feature_matrix_json.indentedList;
      let layout_config = this.props.layout_config;

      //console.log("fdata",fdata);          
      //let myTree = new MyTree(fdata,this.props.layout_config,this.updateMatrixFilters);
      let margin = {top: 10, right: 10, bottom: 20, left: 10};
      let width = layout_config.width - margin.right - margin.left;
      let height = layout_config.width - margin.top - margin.bottom;
      let barHeight = layout_config.barHeight;
      //let barWidth = width *.8;
      //let i = 0;
      //let duration = 0;
      //let updateMatrixFilters = this.updateMatrixFilters;

      let svg = select('#hierarchy-container')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('transform', 'translate(' + layout_config.x + ',' + layout_config.y + ')')
        .append('g')
        .attr("id","IndentedTree")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // 1. Compute the coordinates for each node.
      //let gridSize = Math.floor(width / (max_row_num_block));
      //let height = gridSize * y_axis.length + 20;

      // 2. Render the indentedList.
      const y_axis_labels = svg.selectAll(".y_axisLabel")
                            .data(fdata,function(d:any){
                              return d.id;
                            });
      let gridSize=barHeight;
      let radius = Math.min(5,gridSize/4);
      let radius_gap = 0.3;
      let transform_x = radius*2 + radius_gap;
      let transform_y = 0;//radius*2;
      let deviation_x = 30;
      let y_axis_label_enter = y_axis_labels.enter().append("g").attr("class", "y_axisLabel");

      y_axis_label_enter.merge(y_axis_labels).attr("transform",(d:any, i:any) => {
        let new_x = transform_x + d.level*deviation_x;
        return "translate("+new_x+"," + (i * gridSize + transform_y) + ")"
      });
      y_axis_labels.exit().remove();
      let y_axis_label_color = "#000";
      function getArc(radius:number){
        return d3.arc()
        .innerRadius(radius)
        .outerRadius(radius*2);
      }

        //let y_axis_color = color_info["y_axis_color"];

        var arc_data = [{
            "index":0,
            "value":1/3
            }, {
            "index":1,
            "value":1/3
            }, {
            "index":2,
            "value":1/3
        }];
        var ori_arcs = d3.pie()
                      .startAngle((-60/180) * Math.PI)
                      .endAngle((2-60/180) * Math.PI)
                      .value(function(a:any){
                          return a.value;
                      })
                      .sort(function(a:any, b:any) {
                          return a.index<b.index;
                      });
        var arcs = ori_arcs(arc_data);


        var outer_circles_enter = y_axis_label_enter.append("circle").attr("class","outer_circle");
        var outer_circles = y_axis_labels.select("circle.outer_circle");
        var outer_circles_enter_update = outer_circles_enter.merge(outer_circles);

        outer_circles_enter_update//.transition(trans)
        .attr("r", function(d:any){
              return radius*2
        })
        .attr("fill", function(d:any,i:any) { return d.color[4]; });


        let overall_background = [];
        for (let i = 0; i < 3; i++){
          let background_enter = y_axis_label_enter.append("path").attr("class","arc_"+i)
          let background = y_axis_labels.select("path.arc_"+i);
          let background_enter_update  = background_enter.merge(background);
          background_enter_update
          .style("fill", function(d:any,j:any){
              return d.color[i+1]
          })
          .attr("d", function(d:any){
              return getArc(radius)(arcs[i])
          });
          overall_background.push(background_enter_update);

        }


        var inner_circles_enter = y_axis_label_enter.append("circle").attr("class","inner_circle");
        var inner_circles = y_axis_labels.select("circle.inner_circle");
        var inner_circles_enter_update = inner_circles_enter.merge(inner_circles);
        //console.log("circles enter update", circles_enter.size(), inner_circles, circles.size(), circles);
        //console.log("merge", circles_enter.merge(circles));

        inner_circles_enter_update//.transition(trans)
        .attr("r", function(d:any){
            return radius - radius_gap;
        })
        .attr("fill", function(d:any,i:any) { return d.color[0]; });
        let y_axis_label_text_enter = y_axis_label_enter.append("text");

     y_axis_label_text_enter.merge(y_axis_labels.select("text"))
            .text(function (d:any) { return d.id; })
            .style("text-anchor", "start")
            .style("font-size", "9pt")
            .style("font-family", "Consolas, courier")
            .style("fill", y_axis_label_color)
            .style("dominant-baseline","central")
            .attr("transform", "translate("+transform_x+"," + 0 + ")")
            .attr("class", "y-axis");

    }
    public render() {
        return (
                <g id="hierarchy-container"> 
                </g>
        )

    }
}
