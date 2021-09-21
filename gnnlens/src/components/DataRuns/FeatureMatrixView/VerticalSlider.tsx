
import './VerticalSlider.css'
import * as React from "react";
const d3 = require("d3");
const d3_slider = require("d3-simple-slider");
export interface IProps {
  feature_matrix_json : any,
  layout_config:any,
  id:number,
  changeNodeStartIndex:any
}
export interface IState {
}

export default class VerticalSlider extends React.Component<IProps, IState>{
    private TAB : string= "VerticalSlider_";
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
         if(prevProps.layout_config.name !== this.props.layout_config.name){
          d3.selectAll("#"+this.TAB+this.props.id).remove();
          this.renderD3();
      }


        
     }
   
   public renderD3(){
      //let fdata:any = this.props.feature_matrix_json.selectedFeatureStatistics;
      let layout_config = this.props.layout_config;
      let node_start_index = layout_config["node_start_index"];
      let node_max_index = layout_config["node_max_index"];
      //var data = [0, node_max_index];
      console.log("rerender d3", node_start_index, node_max_index);
      const svg = d3.select("#chart_"+this.props.id).append("g").attr("id", this.TAB+this.props.id)
          .attr("width",layout_config.width)
          .attr("height",layout_config.height)
          .attr("transform", "translate(" + layout_config.x + "," + layout_config.y + ")"),
          margin = { top: 0, right: 0, bottom: 0, left: 0 },
          width = +layout_config.width- margin.left - margin.right,
          height = +layout_config.height - margin.top - margin.bottom;
      //let max_row_num_block = this.props.layout_config.max_row_num_block;

      //console.log("sliderleft", d3_slider.sliderLeft);
        // Vertical
      let changeNodeStartIndex = this.props.changeNodeStartIndex;
      var sliderVertical = d3_slider
        .sliderLeft()
        .min(0)
        .max(node_max_index)
        .height(height)
        .displayValue(false)
        .default(node_max_index - node_start_index)
        .step(1)
        .handle(
          d3
            .symbol()
            .type(d3.symbolCircle)
            .size(200)()
        )
        .on('onchange', (val:any) => {
          console.log("onchange, choose value",val, node_max_index - val);
          changeNodeStartIndex(node_max_index - val);
        });

      var gVertical = svg.append('g')
        .attr('transform', 'translate(30,0)');

      gVertical.call(sliderVertical);
      gVertical.select("g.axis").remove();
   }
    public render() {
        return (
            <g id={"chart_"+this.props.id} />
            
        )

    }
}

