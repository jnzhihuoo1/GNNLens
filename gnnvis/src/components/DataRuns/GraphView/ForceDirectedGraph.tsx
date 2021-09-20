
import './ForceDirectedGraph.css'
import * as React from "react";
const d3 = require("d3");

export interface IProps {
    graph_json : any,
    width : number,
    height : number,
    onNodeClick: any
}
export interface IState {
}

export default class ForceDirectedGraph extends React.Component<IProps, IState>{
    public global_simulation:any = null;
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
        if(prevProps.graph_json.name !== this.props.graph_json.name || prevProps.width !== this.props.width){
            //d3.selectAll("#ForceDirected").remove();
            this.renderD3();
        }

        
     }

    public renderD3(){
        var onNodeClick = this.props.onNodeClick;
        var nodenum = this.props.graph_json.nodenum;
        var enabledForceDirected = this.props.graph_json.enable_forceDirected;
        var neighborSet = this.props.graph_json.NeighborSet;
        var colorLegend = this.props.graph_json.colorLegend;
        var configuration = {
            "strength": 0.01,
            "radius":15,
            "showlabel": true,
            "showarrow": true,
            "width": this.props.width,
            "height": this.props.height
        }
        //console.log("ForceDirected" , nodenum)
        if(nodenum >= 100){
            configuration = {
                "strength": 0.4,
                "radius":3,
                "showlabel": false,
                "showarrow": false,
                "width": this.props.width,
                "height": this.props.height
            }
        }
        let trans = d3.transition()
                    .duration(1000)
                    .ease(d3.easeLinear);
        var top_svg = d3.select("#svgChart");
        var width = configuration["width"];
        var height = configuration["height"];
        var radius = configuration["radius"];
        var radius_gap = 0.3;
        var inner_radius = radius - radius_gap;
        /*top_svg.data([1])
            .enter()
            .append("g")
            .attr("id","ForceDirected");*/
        let legend_pie_x = 10;
        let legend_pie_y = height - 10 - 100;
        var legend_svg = top_svg.select("#ForceDirectedLegend")
            .attr("width", 100)
            .attr("height", 100)
            .attr("transform","translate("+legend_pie_x+","+legend_pie_y+")")

        var svg = top_svg.select("#ForceDirected")
            .attr("width", width)
            .attr("height", height);
        top_svg.on("touchstart", nozoom)
        .on("touchmove", nozoom);
        function nozoom() {
            console.log("No zoom");
            d3.event.preventDefault();
          }
          top_svg.call(d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.1, 8])
            .on("zoom", zoomed));
        
        function zoomed(event:any) {
          svg.attr("transform", d3.event.transform);
        }        
        let simulation:any;
        if(this.global_simulation){
            this.global_simulation.stop();
            delete this.global_simulation;
        }
        simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d:any) { return d.id; }).strength(configuration["strength"]))
            .force("charge", d3.forceManyBody())
            //.force("x", d3.forceX())
            //.force("y", d3.forceY())
            .force("center", d3.forceCenter(width / 2, height / 2));
        this.global_simulation = simulation;


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
        /*var arc = d3.arc()
        .innerRadius(radius)
        .outerRadius(radius*2);*/
        function getArc(radius:number){
            return d3.arc()
            .innerRadius(radius)
            .outerRadius(radius*2);
        }
        let legend_x = 30;
        let legend_y = 50;
        let legend_width = 200;
        let legend_height = 100;
        let legned_scale = 3;
        let legend_pie = legend_svg.selectAll("g.legend_pie")
                        .data([0]).enter().append("g")
                        .attr("class", "legend_pie")
                        .attr("transform", "translate("+legend_x+","+legend_y+")")
        legend_pie.append("rect")
        .attr("x", -legend_x)
        .attr("y", -legend_y)
        .attr("width", legend_width)
        .attr("height", legend_height)
        .attr("fill", "#fff")
        .attr("opacity", 0.8)
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1)
        .attr("rx",3)
        .attr("ry",3)
                        //let overall_background = [];
        let legend_Color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"];
        legend_pie.append("circle")
        .attr("class","inner_circle")
        .attr("r", inner_radius*legned_scale)
        .attr("fill", function(d:any) { return legend_Color[0]; })
        .attr("stroke", "white");







        /*
        let legend_text_setting = [
            {
                "text":"Ground Truth",
                "text-anchor":"begin",
                "dominant-baseline":"middle"
            },
            {
                "text":"GCN",
                "text-anchor":"begin",
                "dominant-baseline":"ideographic"
            },
            {
                "text":"GCN w/o adj",
                "text-anchor":"middle",
                "dominant-baseline":"hanging"
            },
            {
                "text":"GCN w/o features",
                "text-anchor":"end",
                "dominant-baseline":"ideographic"
            },
        ]
        */
       let legend_text_setting = [
        {
            "text":"Ground Truth",
            "text-anchor":"begin",
            "dominant-baseline":"central",
            "y_offset":+1
        },
        {
            "text":"GCN",
            "text-anchor":"begin",
            "dominant-baseline":"central",
            "y_offset":-7.5
        },
        {
            "text":"MLP",
            "text-anchor":"begin",
            "dominant-baseline":"central",
            "y_offset":0
        },
        {
            "text":"GCN w/o features",
            "text-anchor":"begin",
            "dominant-baseline":"central",
            "y_offset":+19
        },
    ]
        function constructPathOnNodeList(nodelist:any){
            // 
            let path = "";
            for(let i = 0; i<nodelist.length;i++){
                let note = "M";
                if(i>0){
                    note = "L"
                }
                path = path+note+nodelist[i][0]+" "+nodelist[i][1]+" ";
            }
            return path;

        }
        for (let i = 0; i < 3; i++){
            let background_enter = legend_pie.append("path").attr("class","arc_"+i)
            let background = legend_pie.select("path.arc_"+i);
            let background_enter_update  = background_enter.merge(background);
            background_enter_update
            .style("fill", function(d:any){
                return legend_Color[i+1]
            })
            .attr("d", getArc(radius*legned_scale)(arcs[i]));
            //overall_background.push(background_enter_update);

            let start_point = [1.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 1.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))]
            let middle_point = [1.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 2.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]

            if(i===1){
                middle_point= [2.5*legned_scale*radius*Math.sin((+120*i)/180*Math.PI), 2.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]
            }else{

            }
            let end_point = [2.5*legned_scale*radius*Math.sin((+60)/180*Math.PI) ,2.5*legned_scale*radius*(-Math.cos((+120*i)/180*Math.PI))+legend_text_setting[i+1]["y_offset"]]

            legend_pie.append("path")
                .attr("stroke", "#222")
                .attr("stroke-width", 1)
                .attr("d", constructPathOnNodeList([start_point,middle_point, end_point]))
                .attr("fill", "none")
            legend_pie.append("text")
                .attr("x", end_point[0])
                .attr("y", end_point[1])
                .attr("text-anchor", legend_text_setting[i+1]["text-anchor"])
                .attr("dominant-baseline", legend_text_setting[i+1]["dominant-baseline"])
                .text(legend_text_setting[i+1]["text"])
        }
        let gt_x = 2.5*legned_scale*radius*Math.sin((+60)/180*Math.PI);
        let gt_y = 2.5*legned_scale*radius*(-Math.cos((+60)/180*Math.PI))+legend_text_setting[0]["y_offset"];
        legend_pie.append("line")
                .attr("stroke", "#222")
                .attr("stroke-width", 1)
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", gt_x)
                .attr("y2", gt_y);
        legend_pie.append("text")
                .attr("x", gt_x)
                .attr("y", gt_y)
                .attr("text-anchor", legend_text_setting[0]["text-anchor"])
                .attr("dominant-baseline", legend_text_setting[0]["dominant-baseline"])
                .text(legend_text_setting[0]["text"])
        // x = 7.5*Radius*(sin(60/180/240))
        // y = 7.5*Radius*(-cos(60/180/240)) 
        
        // ---------------- Color Legend -------------------------//
        
        let legend_color_x = 10;
        let max_text_length = 0;
        colorLegend.forEach((d:any)=>{
            let text = "" + d.text;
            if(text.length>max_text_length){
                max_text_length = text.length;
            }
        })
        
        let legend_color_width = max_text_length*8+24;
        //console.log("maxtextlength", max_text_length, legend_color_width);
        let legend_color_height = colorLegend.length*20;
        let legend_color_y = legend_pie_y - legend_color_height - 10;
        var legend_color_svg = top_svg.select("#ForceDirectedColorLegend")
            .attr("width", legend_color_width)
            .attr("height", legend_color_height)
            .attr("transform", "translate("+legend_color_x+","+legend_color_y+")")
        let legend_rect = legend_color_svg.selectAll("rect").data([0]);
        let legend_rect_enter = legend_rect.enter().append("rect");
        //console.log("legend_rect", legend_rect);
        legend_rect_enter.merge(legend_rect)
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", legend_color_width)
            .attr("height", legend_color_height)
            .attr("fill", "#fff")
            .attr("opacity", 0.8)
            .attr("stroke", "#bbb")
            .attr("stroke-width", 1)
            .attr("rx",3)
            .attr("ry",3);
        let row_legend_color = legend_color_svg.selectAll("g.legend_row_color")
                                .data(colorLegend, function(d:any,i:any){
                                    return d.text+"_"+i+"_"+d.color;
                                });
        let g_row_legend_color = row_legend_color.enter().append("g")
                            .attr("class","legend_row_color")
                            .attr("transform", function(d:any,i:any){
                                return "translate(10,"+(10+i*20)+")";
                            });
            g_row_legend_color.append("circle")
                            .attr("r", 5)
                            .attr("fill", function(d:any){
                                return d.color;
                            })
                            
            g_row_legend_color.append("text")
                            .attr("x", 10)
                            .attr("y", 5)
                            .text(function(d:any){
                                return d.text;
                            })
                            
            row_legend_color.exit().remove();
            
        






        function mappingGraph(graph:any) {
            //console.log(graph);
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
            var g_link = svg.select("g.links");
            var links = g_link
                .selectAll("line")
                .data(graph.links,function(d:any){
                    return ""+d.source+"_"+d.target;
                })
              //  console.log("links enter update exit");
                //console.log(nodes);
              //  console.log(links.enter().size());
              //  console.log(links.size());
              //  console.log(links.exit().size());
            
            var link_enter = links.enter()
            var line_enter = link_enter.append("line");
            var line_enter_update = line_enter.merge(links.select("line"));
            line_enter_update
                .attr("stroke", function(d:any){return d.color;})
                .attr("stroke-width", function(d:any) { return Math.sqrt(d.value); });
            if(configuration["showarrow"]){
                line_enter_update.attr('marker-end',function(d:any){return 'url(#arrowhead_'+d.color+')'})

            }else{
                line_enter_update.attr('marker-end', null);
            }
            links.exit().remove();
            


            var g_node = svg.select("g.nodes");
            var nodes = g_node
                .selectAll("g")
                .data(graph.nodes,function(d:any){
                    return d.id;
                })
              //  console.log("nodes enter update exit");
                //console.log(nodes);
              //  console.log(nodes.enter().size());
              //  console.log(nodes.size());
              //  console.log(nodes.exit().size());
            // Node Exit Phase
            var node_exit = nodes.exit().remove();
            // Node Enter Phase
            
            var node_enter = nodes.enter().append("g")
            var node_enter_update = node_enter.merge(nodes);
            
            



            var outer_circles_enter = node_enter.append("circle").attr("class","outer_circle");
            var outer_circles = nodes.select("circle.outer_circle");
            var outer_circles_enter_update = outer_circles_enter.merge(outer_circles);
            //console.log("circles enter update", circles_enter.size(), circles_enter, circles.size(), circles);
            //console.log("merge", circles_enter.merge(circles));
            
            outer_circles_enter_update//.transition(trans)
                        .attr("r", function(d:any){
                            return d.radius*2
                        })
                       .attr("fill", function(d:any) { return d.color[4]; });

            /*var middle_circles_enter = node_enter.append("circle").attr("class","middle_circle");
            var middle_circles = nodes.select("circle.middle_circle");
            var middle_circles_enter_update = middle_circles_enter.merge(middle_circles);
            //console.log("circles enter update", circles_enter.size(), inner_circles, circles.size(), circles);
            //console.log("merge", circles_enter.merge(circles));
            
            middle_circles_enter_update.transition(trans)
                        .attr("r", configuration["radius"]*2)
                        .attr("fill", function(d:any) { return d.color[1]; });*/
            
            let overall_background = [];
            for (let i = 0; i < 3; i++){
                let background_enter = node_enter.append("path").attr("class","arc_"+i)
                let background = nodes.select("path.arc_"+i);
                let background_enter_update  = background_enter.merge(background);
                background_enter_update
                .style("fill", function(d:any){
                    return d.color[i+1]
                })
                .attr("d", function(d:any){
                    return getArc(d.radius)(arcs[i])
                });
                overall_background.push(background_enter_update);
    
            }
            
            
            var inner_circles_enter = node_enter.append("circle").attr("class","inner_circle");
            var inner_circles = nodes.select("circle.inner_circle");
            var inner_circles_enter_update = inner_circles_enter.merge(inner_circles);
            //console.log("circles enter update", circles_enter.size(), inner_circles, circles.size(), circles);
            //console.log("merge", circles_enter.merge(circles));
            
            inner_circles_enter_update//.transition(trans)
                        .attr("r", function(d:any){
                            return d.radius - radius_gap;
                        })
                        .attr("fill", function(d:any) { return d.color[0]; });
                        
            
            
            function handleNodesClick(this:any,d:any, i:any) {  // Add interactivity
                //console.log("Nodes Click", d3.event.defaultPrevented)
                if (d3.event.defaultPrevented) return; // zoomed
                //console.log("Nodes Click", d.id);
                onNodeClick(d.id);
                //d3.event.stopPropagation();
            }
            
            
            node_enter_update.on("click", handleNodesClick).on("mouseover", handleNodesMouseOver)
            .on("mouseout", handleNodesMouseOut);
            /*node_enter_update.call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended));*/
            
            
            if(configuration["showlabel"]){
                var labels_enter = node_enter.append("text");
                var labels = nodes.append("text");

                    labels.mergge(labels_enter).text(function(d:any) {
                        return d.id;
                    })
                    .attr("fill","#000")
                    .attr("text-anchor","middle")
                    .attr('x', 0)
                    .attr('y', +4);
                outer_circles_enter_update.attr("stroke", "#222");
            }else{
                var labels = nodes.select("text").remove();

            }
            var title_enter = node_enter.append("title");

                title_enter.merge(nodes.select("title")).text(function(d:any) { return d.id; });
            function ticked() {
                line_enter_update
                    .attr("x1", function(d:any) { return d.source.x; })
                    .attr("y1", function(d:any) { return d.source.y; })
                    .attr("x2", function(d:any) { return d.target.x; })
                    .attr("y2", function(d:any) { return d.target.y; });

                nodes.merge(node_enter)
                    .attr("transform", function(d:any) {
                        //d.x = Math.max(radius, Math.min(width - radius, d.x));
                        //d.y = Math.max(radius, Math.min(height - radius, d.y));
                        return "translate(" + d.x + "," + d.y + ")";
                    })
                
            }
            if(enabledForceDirected){
                simulation
                    .nodes(graph.nodes)
                    .on("tick", ticked);

                simulation.force("link")
                    .links(graph.links);

            }else{
                simulation.stop();
                simulation
                    .nodes(graph.nodes);

                simulation.force("link")
                    .links(graph.links);
                ticked();
            }
            var highlight_line = line_enter_update.filter((d:any)=>{
                if(d.source.highlight && d.target.highlight){
                    return true;
                }else{
                    return false;
                }
            });
            var highlight_node = node_enter_update.filter((d:any)=>{
                return d.highlight;
            });
            highlight_line.raise();
            highlight_node.raise();
            function resetPieRadius(selection:any, radius_scale:number, real_color_set:boolean=false){
                for(let i = 0; i<3; i++){
                    let background = selection.select("path.arc_"+i);
                    background
                    .attr("d", function(d:any){
                        return getArc(d.radius*radius_scale)(arcs[i])
                    });
                    if(real_color_set){
                        // Set to real color
                        background.style("fill", function(d:any){
                            return d.real_color[i+1];
                        })
                    }else{
                        background.style("fill", function(d:any){
                            return d.color[i+1];
                        })
                    }
                }
            }
            function resetCircleColor(selection:any, real_color_set:boolean=false,dimension:number=0){
                if(real_color_set){
                    //Set to real color
                    selection.attr("fill", function(d:any) { return d.real_color[dimension]; });
                }else{
                    selection.attr("fill", function(d:any) { return d.color[dimension]; });
                }
            }
             // Create Event Handlers for mouse
            function handleNodesMouseOver(this:any,d:any, i:any) {  // Add interactivity
                // Use D3 to select element, change color and size
                let neighbor_id = neighborSet[d.id];
                
                let neighbor_select = node_enter_update
                                    .filter((d:any)=>{
                                        if(neighbor_id.indexOf(d.id)>=0){
                                            return true
                                        }else{
                                            return false;
                                        }
                                    })
                neighbor_select.raise();
                d3.select(this).raise();
                neighbor_select.select("circle.outer_circle").attr("r",function(d:any){
                    return d.radius*4
                })
                .attr("stroke", "black");
                resetPieRadius(neighbor_select, 2, true);
                
                //neighbor_select.select("circle.middle_circle").attr("r",radius*4);
                neighbor_select.select("circle.inner_circle").attr("r",function(d:any){
                    return (d.radius-radius_gap)*2;
                });
                resetCircleColor(neighbor_select.select("circle.inner_circle"), true);
                d3.select(this).select("circle.outer_circle").attr("r",function(d:any){
                    return d.radius*6
                })
                .attr("stroke", "black");
                resetPieRadius(d3.select(this), 3, true);
                //d3.select(this).select("circle.middle_circle").attr("r",radius*6)
                d3.select(this).select("circle.inner_circle").attr("r",function(d:any){
                    return (d.radius-radius_gap)*3;
                })
                resetCircleColor(d3.select(this).select("circle.inner_circle"), true);
                resetCircleColor(d3.select(this).select("circle.outer_circle"), true,4);
                
            }
        
        function handleNodesMouseOut(this:any,d:any, i:any) {
                //console.log("Nodes Mouse Out")
                // Use D3 to select element, change color back to normal
                let neighbor_id = neighborSet[d.id];
                
                let neighbor_select = node_enter_update
                                    .filter((d:any)=>{
                                        if(neighbor_id.indexOf(d.id)>=0){
                                            return true
                                        }else{
                                            return false;
                                        }
                                    })
                neighbor_select.select("circle.outer_circle").attr("r",function(d:any){
                    return d.radius*2;})
                .attr("stroke", undefined);
                resetPieRadius(neighbor_select, 1);
                //neighbor_select.select("circle.middle_circle").attr("r",radius*2);
                neighbor_select.select("circle.inner_circle").attr("r",function(d:any){
                    return d.radius-radius_gap;
                });

                resetCircleColor(neighbor_select.select("circle.inner_circle"), false);
                d3.select(this).select("circle.outer_circle").attr("r", function(d:any){
                    return d.radius*2;
                })
                .attr("stroke", undefined)
                ;
                resetPieRadius( d3.select(this), 1);
                //d3.select(this).select("circle.middle_circle").attr("r", radius*2);
                d3.select(this).select("circle.inner_circle").attr("r", function(d:any){
                    return d.radius - radius_gap;
                });
                
                resetCircleColor(d3.select(this).select("circle.inner_circle"), false);
                resetCircleColor(d3.select(this).select("circle.outer_circle"), false,4);
                // Select text by id and then remove
                //d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location
                //highlight_line.raise();
                //highlight_node.raise();
            }
             
            
        };
        mappingGraph(this.props.graph_json);
        function dragstarted(d:any) {
            if(enabledForceDirected){
                if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d:any) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d:any) {
            if(enabledForceDirected){
                if (!d3.event.active) simulation.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        }
       
    }
    public render() {
        let {width, height} = this.props;
        let svgwidth = ""+width+"px";
        let svgheight = ""+height+"px";
        return (
            <svg
            style={{ height: svgheight, width:  svgwidth}}
            id="svgChart"
            xmlns="http://www.w3.org/2000/svg"
            >
                <g id="ForceDirected">
                    <g className="links"></g>
                    <g className="nodes"></g>
                </g>
                <g id="ForceDirectedLegend">

                </g>
                <g id="ForceDirectedColorLegend">

                </g>
            </svg>
        )

    }
}

