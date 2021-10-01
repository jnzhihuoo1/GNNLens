
import './Matrix.css'
import * as React from "react";
import { timeSaturday } from 'd3';
const d3 = require("d3");

export interface IProps {
  feature_matrix_json : any,
  layout_config:any,
  id:number,
  MatrixFilters:any,
  MatrixRowFilters:any,
  changeMatrixFilters:any
}
export interface IState {
}

export default class Matrix extends React.Component<IProps, IState>{
    private TAB : string= "Matrix_";
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
         if(prevProps.feature_matrix_json.name !== this.props.feature_matrix_json.name ||
           prevProps.MatrixFilters.refreshnumber !== this.props.MatrixFilters.refreshnumber ||
           prevProps.MatrixRowFilters.refreshnumber !== this.props.MatrixRowFilters.refreshnumber){
          ///d3.selectAll("#FeatureMatrix_"+this.props.id).remove();
          this.renderD3();
      }


        
     }

    public renderD3(){
        //console.log("Matrix filters:", this.props.MatrixFilters)
        //console.log(this.props.MatrixRowFilters);
        let {feature_matrix_json} = this.props;
        let layout_config = this.props.layout_config;
        let showSource = feature_matrix_json.showSource;
        let margin = { top: 0, right: 30, bottom: 100, left: 0 },
          width = layout_config.width - margin.left - margin.right,
          y_axis = feature_matrix_json["y_axis"], // y_axis_name
          x_axis = feature_matrix_json["x_axis"], // x_axis_name
          data = feature_matrix_json["matrix"],
          type = feature_matrix_json["type"],
          color_info = feature_matrix_json["color_info"],
          highlight_flag = feature_matrix_json["highlight_flag"],
          pieName = feature_matrix_json["pieName"];
        let models_length = pieName.length;
        let matrixFilters = this.props.MatrixFilters;
      let matrixRowFilters = this.props.MatrixRowFilters;
      function transformDataTwoFilters(data:any, indexFilters:any, rowFilters:any){
        let newData:any = [];
        let rowTest = new Set(rowFilters);
        let rowMap:any = {}
        for(let i = 0 ;i<rowFilters.length;i++){
          rowMap[rowFilters[i]] = i;
        }
        for(let i = 0; i<data.length; i++){
          
          if(data[i]["x"]>=indexFilters[0]&&data[i]["x"]<indexFilters[1]){
            let curr_row_id = data[i]["y"];
            if(rowTest.has(curr_row_id)){
              newData.push({
                "x":data[i]["x"] - indexFilters[0],
                "y":rowMap[curr_row_id],
                "value":data[i]["value"]
              })
            }
            
          }
        }
        return newData;
      }
      function transformDataOneFilter(data:any, indexFilters:any){
        let newData:any = [];
        
        for(let i = 0; i<data.length; i++){
          
          if(data[i]["x"]>=indexFilters[0]&&data[i]["x"]<indexFilters[1]){
              newData.push({
                "x":data[i]["x"] - indexFilters[0],
                "y":data[i]["y"],
                "value":data[i]["value"]
              })
            
            
          }
        }
        return newData;
      }
      function transformYaxis(row_filters:any, y_axis:any){
        let new_y_axis:any[] = [];
        for(let i = 0; i<row_filters.length; i++){
          new_y_axis.push(y_axis[row_filters[i]]);
        }
        return new_y_axis;
      }
      let max_row_num_block = Math.max(1, Math.floor(width / 15));
        
      if(!matrixFilters.hasOwnProperty("index")){
        matrixFilters["index"] = [0,max_row_num_block];
      }
        /*if(matrixFilters["index"][1] - matrixFilters["index"][0] >=100){
          x_axis = [];
          y_axis = [];
          data = [];
        }else{*/
          if(matrixFilters["index"][1] - matrixFilters["index"][0] >=max_row_num_block){
            matrixFilters["index"][1] = matrixFilters["index"][0] + max_row_num_block;
          }
          let y_axis_color = color_info["y_axis_color"];
          if(matrixRowFilters.hasOwnProperty("row_index")&&showSource){
            x_axis = x_axis.slice(matrixFilters["index"][0], matrixFilters["index"][1]);
            y_axis = transformYaxis(matrixRowFilters["row_index"], y_axis);
            y_axis_color = transformYaxis(matrixRowFilters["row_index"], y_axis_color);
            data = transformDataTwoFilters(data, matrixFilters["index"], matrixRowFilters["row_index"]);
          }else{
            x_axis = x_axis.slice(matrixFilters["index"][0], matrixFilters["index"][1]);
            data = transformDataOneFilter(data, matrixFilters["index"]);
          }
          
          if(!showSource&& y_axis.length!==y_axis_color.length){
            y_axis = [];
            x_axis = [];
            data = [];
          }
          
        //}
        
        let gridSize = Math.floor(width / (max_row_num_block));
        let height = gridSize * y_axis.length + 20;
      

       let buckets:any , colors:any;
       if(feature_matrix_json["distance_select"] === 1 && type === "discrete"){
        buckets = 2;
        colors =  ["#ffffd9","#081d58"]
      }else{
         
          buckets = 9;
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]
      
       }
      //console.log(feature_matrix_json);
      function constructFakeData(){
          let fakedata:any = [];
          for(let i = 0; i<x_axis.length; i ++){
            for(let j =0 ;j<y_axis.length; j++){
              fakedata.push({
                "x":i,
                "y":j,
                "value":0
              })
            }
          }
          return fakedata;
      }
      let fakedata = constructFakeData(); 
      let final_data:any;
      if(type === "discrete"){
         final_data = fakedata.concat(data);
      }else{
        final_data = data;
      }
      let data_max = d3.max(final_data, (d:any) => d.value);
      let data_min = d3.min(final_data, (d:any) => d.value);
      //console.log("Data Max Min", data_max, data_min)
      const top_svg = d3.select("#FeatureMatrix_"+this.props.id)
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("transform", "translate(" + layout_config.x + "," + layout_config.y + ")");
      const svg = top_svg.select("#Matrix")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      // Axis Label Definition //
      // --------- y axis ------------- //
      if(showSource){
        y_axis = [];
      }
        const y_axis_labels = svg.selectAll(".y_axisLabel")
                              .data(y_axis,function(d:any){
                                return d;
                              });
      let radius = Math.min(5,gridSize/4);
      let radius_gap = 0.3;
      let transform_x = -radius*2 - radius_gap;
      let transform_y = radius*2;
      let y_axis_label_enter = y_axis_labels.enter().append("g").attr("class", "y_axisLabel");

          y_axis_label_enter.merge(y_axis_labels).attr("transform",(d:any, i:any) => "translate("+transform_x+"," + (i * gridSize + transform_y) + ")");
          y_axis_labels.exit().remove();
      let y_axis_label_color = "#000";
      function getArc(radius:number){
        return d3.arc()
        .innerRadius(radius)
        .outerRadius(radius*2);
    }
      if(color_info["enable_y_axis_color"])
      {
        let y_axis_color = color_info["y_axis_color"];
        var arc_data:any = [];
        //console.log("Feature Matrix", models_length);
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
        
        

        var outer_circles_enter = y_axis_label_enter.append("circle").attr("class","outer_circle");
        var outer_circles = y_axis_labels.select("circle.outer_circle");
        var outer_circles_enter_update = outer_circles_enter.merge(outer_circles);
        
        outer_circles_enter_update//.transition(trans)
                    .attr("r", function(d:any){
                        return radius*2
                    })
                   .attr("fill", function(d:any,i:any) { return y_axis_color[i][4]; });

        
        let overall_background = [];
        for (let i = 0; i < models_length; i++){
            let background_enter = y_axis_label_enter.append("path").attr("class","arc_"+i)
            let background = y_axis_labels.select("path.arc_"+i);
            let background_enter_update  = background_enter.merge(background);
            background_enter_update
            .style("fill", function(d:any,j:any){
                return y_axis_color[j][i+1]
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
                    .attr("fill", function(d:any,i:any) { return y_axis_color[i][0]; });
                    
      }
      
      
      /*
      
      let rect_width = 36;
      let rect_height = gridSize; 
      
      if(color_info["enable_y_axis_color"])
      {
        let y_axis_color = color_info["y_axis_color"];
        y_axis_label_color = "#fff";
        
        let y_axis_rect =  y_axis_labels.append("rect")
                .attr("x", -rect_width )
                .attr("y", 0)
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", rect_width)
                .attr("height", rect_height)
                .style("fill", function(d:any, i:any){
                  return y_axis_color[i];
                })
                .attr("class", "y-axis-rect bordered");
      }
      */
     
     let y_axis_label_text_enter = y_axis_label_enter.append("text");

     y_axis_label_text_enter.merge(y_axis_labels.select("text"))
            .text(function (d:any) { return d; })
            .style("text-anchor", "end")
            .style("font-size", "9pt")
            .style("font-family", "Consolas, courier")
            .style("fill", y_axis_label_color)
            .style("dominant-baseline","central")
            .attr("transform", "translate("+transform_x+"," + 0 + ")")
            .attr("class", "y-axis");
            
      // --------- x axis ------------- //
      const x_axis_label = svg.selectAll(".x_axisLabel").data(x_axis, function(d:any){
        return d;
      });
      
      let x_axis_label_enter = x_axis_label.enter().append("g").attr("class","x_axisLabel");
        x_axis_label_enter.merge(x_axis_label).attr("transform",(d:any, i:any) => "translate(" + i * gridSize + ",0)")
        x_axis_label.exit().remove();
      let x_axis_label_color = "#000";
      /*
      if(color_info["enable_x_axis_color"])
      {
        let x_axis_color = color_info["x_axis_color"];
        x_axis_label_color = "#fff";
        let x_axis_rect =  x_axis_label.append("rect")
            .attr("x", 0)
            .attr("y", -rect_width)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("class", "hour bordered")
            .attr("width", rect_height)
            .attr("height", rect_width)
            .style("fill", function(d:any, i:any){
              return x_axis_color[i];
            })
            
            .attr("class", "x-axis-rect bordered");
       
      }
      */
      let x_axis_label_text_enter = x_axis_label_enter.append("text");

        x_axis_label_text_enter.merge(x_axis_label.select("text"))
          .text((d:any) => d)
          .style("text-anchor", "begin")
          .style("font-size", "9pt")
          .style("font-family", "Consolas, courier")
          .style("fill", x_axis_label_color)
          .attr("transform", 
            "translate("+gridSize*0.25+", -2)rotate(-45)"
          )
          .attr("class", "x-axis");

      // "translate("+gridSize*0.75+", -2)rotate(-90)"
        
      let color_domain = [];
      let step = (data_max-data_min) / (buckets-1);
      for(let i = 0; i< buckets; i++){
        color_domain.push(i*step+data_min);
      }
      const colorScale = d3.scaleLinear()
                          .domain(color_domain)
                          .range(colors);

      const cards = svg.selectAll(".hour")
          .data(final_data, (d:any) => d.x+':'+d.y);

      //cards.append("title");
      function getCardColor(value:number, y:number){
        if(value > 0){
          return y_axis_color[y][1];
        }else{
          return colors[0];
        }
      }
      let getHighligh_flag = (d:any)=>{
        let y_value = d.y;
        if(y_value>highlight_flag.length){
          return "#eee";
        }else{
          if(highlight_flag[y_value] === true){
            return "#222";

          }else{
            return "#eee";
          }
        }
      }
      let getHighligh_opacity = (d:any)=>{
        let y_value = d.y;
        if(y_value>highlight_flag.length){
          return 0;
        }else{
          if(highlight_flag[y_value] === true){
            return 1;

          }else{
            return 0;
          }
        }
      }
      let cards_rect_enter = cards.enter().append("rect").attr("class", "hour bordered");

          cards_rect_enter.merge(cards)
          .attr("x", (d:any) => (d.x) * gridSize)
          .attr("y", (d:any) => (d.y) * gridSize)
          .attr("rx", 4)
          .attr("ry", 4)
          
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill-opacity", (d:any)=> d.value)
          .style("fill", (d:any) => getCardColor(d.value, d.y))
          .style("stroke", getHighligh_flag)
          .style("stroke-width","2")
          .style("stroke-opacity",getHighligh_opacity)
          .on("mouseover", function(d:any){return tooltip.style("visibility", "visible").text(d.value.toFixed(4));})
          .on("mousemove", function(d:any){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
          .on("mouseout", function(d:any){return tooltip.style("visibility", "hidden");});
      //cards.select("title").text((d:any) => d.value);

      cards.exit().remove();
      // Define the div for the tooltip
      
      var tooltip = d3.select("body")
                  .select("#tooltip_matrix")
                  .style("position", "absolute")
                  .style("z-index", "10")
                  .style("visibility", "hidden")
                  //.style("background","lightsteelblue"	)
                  .text("a simple tooltip");
      /*
      const legend = svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), (d:any) => d);
*/
/*
      const legend = svg.selectAll(".legend")
      .data(color_domain, (d:any) => d);
      const legend_g = legend.enter().append("g")
          .attr("class", "legend");

      legend_g.append("rect")
        .attr("x", (d:any, i:any) => legendElementWidth * i)
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", (d:any, i:any) => colors[i]);

      legend_g.append("text")
        .attr("class", "mono")
        .text((d:any) => d.toFixed(1))
        .attr("x", (d:any, i:any) => legendElementWidth * i)
        .attr("y", height + gridSize*2);

      legend.exit().remove();
      */
       

       
    }
    public render() {
        return (
            <g
              id={"FeatureMatrix_"+this.props.id}
            >
                <g id="Matrix"></g>
            </g>

        )

    }
}

