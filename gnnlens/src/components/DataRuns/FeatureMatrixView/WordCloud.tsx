
import './Matrix.css'
import * as React from "react";
//import ReactWordcloud from "react-wordcloud";
const d3 = require("d3");
const d3_cloud = require("./d3.layout.cloud.js");
export interface IProps {
  feature_matrix_json : any,
  width : number,
  height : number,
  id:number
}
export interface IState {
}

export default class WordCloud extends React.Component<IProps, IState>{
    private TAB : string= "WordCloud_";
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
         if(prevProps.feature_matrix_json.name !== this.props.feature_matrix_json.name){
          d3.selectAll("#"+this.TAB+this.props.id).remove();
          this.renderD3();
      }


        
     }
  
    public renderD3(){
      var margin = {top: 30, right: 50, bottom: 30, left: 50};
      var width = 960 - margin.left - margin.right;
      var height = 500 - margin.top - margin.bottom;

      var g = d3.select("#chart_"+this.props.id).append("svg").attr("id", this.TAB+this.props.id)
      .attr("width", 969)
              .attr("height", 500)        
      .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
              ;

      //d3.csv("Team_Info.csv",function(data:any){
       var color = d3.scaleOrdinal(d3.schemeCategory20);
      let selectedFeatureStatistics:any = this.props.feature_matrix_json.selectedFeatureStatistics;
      let x_axis:any = this.props.feature_matrix_json.x_axis;
      let data:any = [];
      for(let i = 0; i<selectedFeatureStatistics.length;i++){
        data.push({
          "text":x_axis[i],
          "frequency":selectedFeatureStatistics[i]
        })
      }
      //console.log(this.props.feature_matrix_json,data);
      //selectedFeatureStatistics
        const wordScale = d3.scaleLinear()
            .domain([0,d3.max(data.map((d:any)=>parseInt(d.frequency)))])
            .range([10,120])
          
      var layout = d3_cloud()
            .size([width, height])
            .timeInterval(20)
            .words(data)
            .rotate(function(d:any) { return 0; })
            .fontSize((d:any)=>wordScale(d.frequency))
            //.fontStyle(function(d,i) { return fontSyle(Math.random()); })
            .fontWeight(["bold"])
            .text(function(d:any) { return d.text; })
            .spiral("rectangular") // "archimedean" or "rectangular"
            .on("end", draw)
            .start();

        var wordcloud = g.append("g")
            .attr('class','wordcloud')
            .attr("transform", "translate(" + width/2 + "," + height/2 + ")");
            
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .selectAll('text')
             .style('fill',function(d:any) { return color(d); })
             .style('font','sans-serif');

      function draw(words:any) {
          wordcloud.selectAll("text")
              .data(words)
              .enter().append("text")
              .attr('class','word')
               .style("fill", function(d:any, i:any) { return color(i); })
              .style("font-size", function(d:any) { return d.size + "px"; })
               .style("font-family", function(d:any) { return d.font; })

              .attr("text-anchor", "middle")
              .attr("transform", function(d:any) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
              .text(function(d:any) { return d.text; });
      };
        
      //});
      
       
      
       
    }
    public render() {
      /*const words = [
        { text: "Hey", value: 1000 },
        { text: "lol", value: 200 },
        { text: "first impression", value: 800 },
        { text: "very cool", value: 1000000 },
        { text: "duck", value: 10 }
      ];*/
      
        return (
            <div><div id={"chart_"+this.props.id}>
              {/*<ReactWordcloud words={words} minSize={[400, 400]} size={[100, 100]} />*/}
            </div>
            </div>
            
        )

    }
}

