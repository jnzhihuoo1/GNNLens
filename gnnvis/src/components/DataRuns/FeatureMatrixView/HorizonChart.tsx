
import './HorizonChart.css'
import * as React from "react";
const d3 = require("d3");
export interface IProps {
  feature_matrix_json : any,
  layout_config:any,
  id:number,
  MatrixFilters:any,
  changeMatrixFilters:any
}
export interface IState {
}

export default class HorizonChart extends React.Component<IProps, IState>{
    private TAB : string= "HorizonChart_";
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
         if(prevProps.feature_matrix_json.name !== this.props.feature_matrix_json.name){
          d3.selectAll("#"+this.TAB+this.props.id).remove();
          this.renderD3();
      }


        
     }
   public updateMatrixFilters(filters:any){
     let matrixfilters = Object.assign({}, this.props.MatrixFilters);
     matrixfilters["refreshnumber"] = matrixfilters["refreshnumber"] + 1;
     matrixfilters["index"] = filters["index"];
     this.props.changeMatrixFilters(matrixfilters);
   }
   public renderD3(){
      let fdata:any = this.props.feature_matrix_json.selectedFeatureStatistics;
      let layout_config = this.props.layout_config;


          const svg = d3.select("#chart_"+this.props.id).append("g").attr("id", this.TAB+this.props.id)
          .attr("width",layout_config.width)
          .attr("height",layout_config.height)
          .attr("transform", "translate(" + layout_config.x + "," + layout_config.y + ")"),
          margin = { top: 20, right: 30, bottom: 0, left: 0 },
          width = +layout_config.width- margin.left - margin.right,
          height = +layout_config.height - margin.top - margin.bottom;
        let max_row_num_block = this.props.layout_config.max_row_num_block;

        var numHorizons = 4;

        //var margin = { top: 30, right: 10, bottom: 30, left: 300 },
        //    width = 700 - margin.left - margin.right,
        //    height = 600 - margin.top - margin.bottom;
        
        var formatTime = d3.timeFormat('%I %p');
        
        /*var svg = d3.select('body').append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        */
        var x = function(d:any) { return d.time; },
            xScale = d3.scaleTime().range([0, width]),
            xValue = function(d:any) { return xScale(x(d)); },
            xAxis = d3.axisBottom(xScale).tickFormat(formatTime);
        
        var y = function(d:any) { return d.value; },
            yScale = d3.scaleLinear().clamp(true),
            y0Value = function(d:any) { return yScale(0); },
            y1Value = function(d:any) { return yScale(y(d)); };
        
        var activity = function(d:any) { return d.key; },
            activityScale = d3.scaleBand().range([0, height]).padding(0.05),
            activityValue = function(d:any) { return activityScale(activity(d)); },
            activityAxis = d3.axisLeft(activityScale);
        
        var horizonScale = d3.scaleQuantize()
            .range(d3.range(numHorizons));
        
        var fill = function(d:any) { return d.yExtent[0]; },
            fillScale = d3.scaleLinear().range(['lavender', 'purple']).interpolate(d3.interpolateHcl),
            fillValue = function(d:any) { return fillScale(fill(d)); };
        
        var area = d3.area()
            .x(xValue)
            .y0(y0Value)
            .y1(y1Value);
        
        function parseTime(offset:any) {
            var date = new Date(2017, 0, 1); // chose an arbitrary day
            return d3.timeMinute.offset(date, offset);
        }
        
        function row(d:any) {
            return {
                activity: d.activity,
                time: parseTime(d.time),
                value: +d.p_smooth
            };
        }
        
        d3.tsv('data.tsv', row, function(error:any, dataFlat:any) {
            if (error) throw error;
            let new_dataFlat = dataFlat.filter((d:any)=>{
              if(d.activity==="Biking"){
                return true;
              }else{
                return false;
              }
            })
            console.log("dataFlat, newDataFlat", dataFlat, new_dataFlat);
            dataFlat = new_dataFlat;
            // Sort by time
            dataFlat.sort(function(a:any, b:any) { return a.time - b.time; });
            
            var data = d3.nest()
                .key(function(d:any) { return d.activity; })
                .entries(dataFlat);
            
            // Sort activities by peak activity time
            function peakTime(d:any) {
                var i = d3.scan(d.values, function(a:any, b:any) { return y(b) - y(a); });
                return d.values[i].time;
            };
            data.sort(function(a:any, b:any) { return peakTime(b) - peakTime(a); });
        
            xScale.domain(d3.extent(dataFlat, x));
        
            activityScale.domain(data.map(function(d:any) { return d.key; }));
        
            yScale.range([activityScale.bandwidth(), 0]);
        
            horizonScale.domain(d3.extent(dataFlat, y));
        
            svg.append('g').attr('class', 'axis axis--x')
                .attr('transform', 'translate(0,' + height + ')')
                .call(xAxis);
        
            svg.append('g').attr('class', 'axis axis--activity')
                .call(activityAxis);
        
            var gActivity = svg.append('g').attr('class', 'activities')
                    .selectAll('.activity').data(data)
                .enter().append('g')
                    .attr('class', function(d:any) { return 'activity activity--' + d.key; })
                    .attr('transform', function(d:any) {
                        var ty = activityValue(d);
                        return 'translate(0,' + ty + ')';
                    });
            
            function horizonData(d:any) {
                return horizonScale.range()
                    .map(function(i:any) {
                        return {
                            yExtent: horizonScale.invertExtent(i),
                            key: d.key,
                            values: d.values
                        };
                    });
            }
        
            var gHorizon = gActivity.selectAll('.horizon').data(horizonData)
                .enter().append('path')
                    .attr('class', 'horizon')
                    .each(function(this:any,d:any) {
                        // TODO: create separate y-scales using d3.local()
                        yScale.domain(d.yExtent);
                        d3.select(this)
                            .attr('d', area(d.values));
                    })
                    .style('fill', fillValue);
        });
        
   }

    public renderD3_backup(){
      let fdata:any = this.props.feature_matrix_json.selectedFeatureStatistics;
      let layout_config = this.props.layout_config;
      const svg = d3.select("#chart_"+this.props.id).append("g").attr("id", this.TAB+this.props.id)
        .attr("width",layout_config.width)
        .attr("height",layout_config.height)
        .attr("transform", "translate(" + layout_config.x + "," + layout_config.y + ")"),
        margin = { top: 20, right: 30, bottom: 0, left: 0 },
        width = +layout_config.width- margin.left - margin.right,
        height = +layout_config.height - margin.top - margin.bottom;
      let max_row_num_block = this.props.layout_config.max_row_num_block;
      const x = d3.scaleBand().range([0, width]).padding(0.1),
        x2 = d3.scaleBand().range([0, width]).padding(0.1),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height, 0]);
      let brush:any, zoom:any, ref_data:any, data:any, nbFt:any, mean_value:any;
      let  context:any;
      let current_range:any;
        ref_data = fdata.map((ft:any,index:any)=>{
          return {
            "id": index,
            "ratio": ft
          }
        })
      data = [].concat(ref_data);
      nbFt = data.length;
      //let updateMatrixFilters = this.updateMatrixFilters;
      var updateMatrixFilters = this.updateMatrixFilters;
      function brushed(this:any){
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        current_range = [Math.round(s[0] / (width/nbFt)), Math.round(s[1] / (width/nbFt))];
        x.domain(data.slice(current_range[0], current_range[1]).map((ft:any) => ft.id));
        if(current_range[1]-current_range[0]>=max_row_num_block+1){
          current_range[1] = current_range[0] + max_row_num_block;
          d3.select(this).call(brush.move, current_range.map((d:any)=>{
            return d*width/nbFt;
          }))
        }else{
          updateContext(current_range[0], current_range[1]);
        
          updateMatrixFilters({
            "index":[current_range[0], current_range[1]]
          })
        }
      }
      brush = d3.brushX()
          .extent([[0, 0], [width, height]])
          .on("brush end", brushed);
      context = svg.append("g")
          .attr("class", "context")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        x.domain(data.map((ft:any) => ft.id));
        y.domain([0, d3.max(data, (d:any) => d.ratio)]);
        x2.domain(x.domain());
        y2.domain(y.domain());
      updateMiniBars();
      context.append("g")
          .attr("class", "brush")
          .call(brush)
          .call(brush.move, x2.range());
      function updateMiniBars(){
          let mini_bars = context.selectAll(".bar")
              .data(data);
        
          mini_bars
              .attr("x", (d:any) => x2(d.id))
              .attr("width", x2.bandwidth())
              .attr("y", (d:any) => y2(d.ratio))
              .attr("height", (d:any) => height - y2(d.ratio))
              .style('fill', (d:any) =>  'steelblue');
        
          mini_bars
              .enter()
              .insert("rect")
              .attr("class", "bar")
              .attr("x", (d:any) => x2(d.id))
              .attr("width", x2.bandwidth())
              .attr("y", (d:any) => y2(d.ratio))
              .attr("height", (d:any) => height - y2(d.ratio))
              .style('fill', (d:any) =>  'steelblue' );
          mini_bars.exit().remove();
        
      }
      function updateContext(min:any, max:any) {
        context.selectAll(".bar")
            .style('fill-opacity', (_:any, i:any) => i >= min && i < max ? '1' : '0.3');
      }
    }
    public render() {
        return (
            <g id={"chart_"+this.props.id} />
            
        )

    }
}

