
import './IndentedTree.css'
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

      //let tree = d3.tree;
      //let hierarchy = d3.hierarchy;
      //let select = d3.select;
      let fdata:any = this.props.feature_matrix_json.indentedTree;
      
      //console.log("Indented Tree", fdata);
          
      let myTree = new MyTree(fdata,this.props.layout_config,this.updateMatrixFilters);
       
    }
    public render() {
        return (
                <g id="hierarchy-container"> 
                </g>
            
        )

    }
}

class MyTree {
  public margin:{left:number, right:number, top:number, bottom:number};  
  public width:number;
  public height:number;
  public barHeight:number;
  public barWidth:number;
  public i:number;
  public duration:number;
  public tree:any;
  public root:any;
  public svg:any;
  public updateMatrixFilters:any;
  constructor(data:any,layout_config:any, updateMatrixFilters:any) {
    this.margin = {top: 10, right: 10, bottom: 20, left: 10};
    this.width = layout_config.width - this.margin.right - this.margin.left;
    this.height = layout_config.width - this.margin.top - this.margin.bottom;
    this.barHeight = layout_config.barHeight;
    this.barWidth = this.width *.8;
    this.i = 0;
    this.duration = 0;
    this.tree = tree().size([this.width, this.height]);
    this.updateMatrixFilters = updateMatrixFilters;
    // this.tree = tree().nodeSize([0, 30]);

    this.tree = tree().nodeSize([0, 30]); 
    this.root = this.tree(hierarchy(data));
    this.root.each((d:any)=> {
      d.name = d.id; //transferring name to a name variable
      d.id = this.i; //Assigning numerical Ids
      this.i++;
    });
    this.root.x0 = this.root.x;
    this.root.y0 = this.root.y
    this.svg = select('#hierarchy-container')
      .attr('width', this.width + this.margin.right + this.margin.left)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .attr('transform', 'translate(' + layout_config.x + ',' + layout_config.y + ')')
      .append('g')
      .attr("id","IndentedTree")
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // this.root.children.forEach(this.collapse);
    this.update(this.root);
  }
  
  
  $onInit() {
    
  }
  
  connector = function(d:any) {
   //curved 
   //return "M" + d.y + "," + d.x +
   //   "C" + (d.y + d.parent.y) / 2 + "," + d.x +
   //   " " + (d.y + d.parent.y) / 2 + "," + d.parent.x +
   //   " " + d.parent.y + "," + d.parent.x;
    //straight
    return "M" + d.parent.y + "," + d.parent.x
      + "V" + d.x + "H" + d.y;      
  }
  
  collapse = (d:any) => {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(this.collapse);
      d.children = null;
    }
  };

  click = (d:any) => {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
   //console.log("click", this.root);
    this.update(d);
  };
  getRowIdList = (nodesSort:any) =>{
    return nodesSort.map((d:any)=>{
      return d.data.row_id;
    })
  }
  increI = ()=>{
    this.i = this.i + 1;
    return this.i;
  }
  update = (source:any) => {

    this.width=800;

    // Compute the new tree layout.
    let nodes = this.tree(this.root)
    let radius = Math.min(5,this.barHeight/4);
    let radius_gap = 0.3;
    let nodesSort:any= [];
    nodes.eachBefore(function (n:any) {
      nodesSort.push(n);
    });
    this.updateMatrixFilters(this.getRowIdList(nodesSort));
    //console.log("nodes",this.getRowIdList(nodesSort));
    this.height = Math.max(500, nodesSort.length * this.barHeight + this.margin.top + this.margin.bottom);
    let links = nodesSort.slice(1);
    // Compute the "layout".
    nodesSort.forEach ((n:any,i:any)=> {
      n.x = i *this.barHeight;
    });

    //d3.select('svg').transition()
      //.duration(this.duration)
      //.attr("height", this.height);
    
    // Update the nodes…
    let increI = this.increI;
    let node = this.svg.selectAll('g.node')
    .data(nodesSort, function (d: any) {
      return d.id || (d.id = increI());
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
    .attr('class', 'node')
    .attr('transform', function () {
      return 'translate(' + source.y0 + ',' + source.x0 + ')';
    })
    .on('click', this.click);

    /*nodeEnter.append('circle')
      .attr('r', 1e-6)
      .style('fill', function (d: any) {
      return d._children ? 'lightsteelblue' : '#fff';
    });*/
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
      function getArc(radius:number){
        return d3.arc()
        .innerRadius(radius)
        .outerRadius(radius*2);
    }
    var outer_circles_enter = nodeEnter.append("circle").attr("class","outer_circle")
                .attr("r", function(d:any){
                    return radius*2;
                })
               .attr("fill", function(d:any) { return d.data.color[4]; });
    
    let overall_background = [];
    for (let i = 0; i < 3; i++){
        let background_enter = nodeEnter
        .append("path")
        .attr("class","arc_"+i)
        .style("fill", function(d:any){
            return d.data.color[i+1]
        })
        .attr("d", function(d:any){
            return getArc(radius)(arcs[i])
        });
        overall_background.push(background_enter);

    }
    
    
    var inner_circles_enter = nodeEnter.append("circle").attr("class","inner_circle")
                .attr("r", function(d:any){
                    return radius - radius_gap;
                })
                .attr("fill", function(d:any) { return d.data.color[0]; });
    let x_offset = radius * 2 + radius_gap*2;
    let rect_width = 30 - x_offset;
    let rect_height = this.barHeight * 1/2;
    /*let edge_weight_rect =  nodeEnter.append("rect")
    .attr("x", function(d:any){return -rect_width*d.data.edge_weight - x_offset;} )
    .attr("y", -0.5*rect_height)
    .attr("width", function(d:any){return d.data.edge_weight*rect_width;})
    .attr("height", rect_height)
    .style("fill", "#1f77b4")
    */
    nodeEnter.append('text')
      .attr('x', function (d: any) {
      return d.children || d._children ? 10 : 10;
    })
      .attr('dy', '.35em')
      .attr('text-anchor', function (d: any) {
      return d.children || d._children ? 'start' : 'start';
    })
      .text(function (d: any) {
      if (d.data.name.length > 20) {
        return d.data.name.substring(0, 20) + '...';
      } else {
        return d.data.name;
      }
    })
      .style('fill-opacity', 1e-6);
    
    nodeEnter.append('svg:title').text(function (d: any) {
      return d.data.name;
    });

    // Transition nodes to their new position.
    let nodeUpdate = node.merge(nodeEnter)
      //.transition()
      //.duration(this.duration);
    
    nodeUpdate
        .attr('transform', function (d: any) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    /*nodeUpdate.select('circle')
      .attr('r', 4.5)
      .style('fill', function (d: any) {
      return d._children ? 'lightsteelblue' : '#fff';
    });*/
    
    nodeUpdate.select('text')
      .style('fill-opacity', 1);

    // Transition exiting nodes to the parent's new position (and remove the nodes)
    var nodeExit = node.exit()//.transition()
    //.duration(this.duration);
    
    nodeExit
    /*.attr('transform', function (d:any) {
      return 'translate(' + source.y + ',' + source.x + ')';
    })*/
    .remove();

    /*nodeExit.select('circle')
      .attr('r', 1e-6);

    nodeExit.select('text')
      .style('fill-opacity', 1e-6);
    */   
    // Update the links…
    var link = this.svg.selectAll('path.link')
    .data(links, function (d: any) {
      // return d.target.id;
      var id = d.id + '->' + d.parent.id;
      return id;
    }
         );

    // Enter any new links at the parent's previous position.
    let linkEnter = link.enter().insert('path', 'g')
    .attr('class', 'link')
    /*.attr('d', (d:any) => {
      var o = {x: source.x0, y: source.y0, parent: {x: source.x0, y: source.y0}};
      return this.connector(o);
    });*/
    
    // Transition links to their new position.
    link.merge(linkEnter)//.transition()
      //.duration(this.duration)
      .attr('d', this.connector);


    // // Transition exiting nodes to the parent's new position.
    link.exit()//.transition()
      //.duration(this.duration)
      /*.attr('d', (d: any) => {
      var o = {x: source.x, y: source.y, parent: {x: source.x, y: source.y}};
      return this.connector(o);
    })*/
      .remove();

    // Stash the old positions for transition.
    nodesSort.forEach(function (d: any) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    
  }
};
