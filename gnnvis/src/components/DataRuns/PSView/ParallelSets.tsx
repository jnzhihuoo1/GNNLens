
import './ParallelSets.css'
import * as React from "react";
import {getInfectionNodeColor, getInfectionEdgeColor, getCoraNodeColor, getLayoutMode} from '../../../helper';
const d3 = require("d3");
const d3_parsets = require("./d3.parsets.js");
export interface IProps {
    PSJson:any,
    changeFilters:any,
    width: number,
    height:number,
    PSDimensions:any
}
export interface IState {
}

export default class ParallelCoordinates extends React.Component<IProps, IState>{

    constructor(props:IProps) {
        super(props);
        this.onRibbonClick = this.onRibbonClick.bind(this);
        this.clearFilter = this.clearFilter.bind(this);
        this.onCategoryClick = this.onCategoryClick.bind(this);
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
        if(prevProps.PSJson.name !== this.props.PSJson.name || !this.comparePSDimensions(prevProps.PSDimensions, this.props.PSDimensions) ){
            d3.selectAll("#ParallelSets_SVG").remove();
            this.props.changeFilters({});
            this.renderD3();
        }

        
     }
     public comparePSDimensions(prev:any, current:any){
         if(prev.length !== current.length){
             return 0; // Not equal
         }else{
             let flag = 1;
            for(let i = 0; i<prev.length; i++){
                if(prev[i] !== current[i]){
                    flag = 0;
                    break;
                }
            }   
            return flag;
         }
     }
     public onRibbonClick(e:any){
        const filters:any = {};
        let current = e.data;
        while(current){
            if(current.hasOwnProperty("parent")){
                filters[current.dimension] = [current.name];
                current = current.parent;
            }else{
                break;
            }
        }
        //filters[feature] = selected;            
        this.props.changeFilters(filters);
    }
    public onCategoryClick(e:any){
        console.log("onCategoryClick", e);
        const filters:any = {};
        let current = e.data;
        filters[current.dimension.name] = [current.name];
        this.props.changeFilters(filters);
    }
    public clearFilter(){
        console.log("clearFilter");
        this.props.changeFilters({});
    }
    public renderD3(){
        // Parallel Sets
        let {width, height,PSJson,PSDimensions} = this.props;
        let PSData = PSJson.PSData;
        let chart_dimensions = PSDimensions;
        //let chart_dimensions = ["Survived", "Sex", "Age", "Class"];
        if(chart_dimensions.length <= 1){
            console.log("The number of dimensions must be larger or equal to 2.")
            return ;
        }
        // tension = 1 --> line
        // tension = 0.5 --> curve
        var chart = d3.parsets()
            .dimensions(chart_dimensions)
            .width(width)
            .height(height)
            .tension(1)
            .on("ribbonClick",this.onRibbonClick)
            .on("sortDimensions",this.clearFilter)
            .on("sortCategories",this.clearFilter)
            .on("categoryClick", this.onCategoryClick)
            
        var vis = d3.select("#parallelSets").append("svg")
            .attr("id","ParallelSets_SVG")
            .attr("width", chart.width())
            .attr("height", chart.height());
        //console.log("chart width, height", chart.width(), chart.height())
            
        //var partition = d3.partition()
        //    .size([chart.width(), chart.height() * 5 / 4])
            //.children(function(d:any) { return d.children ? d3.values(d.children) : null; })
            //.value(function(d:any) { return d.count; });

        //var ice = false;
        /*
        function curves() {
            var t = vis.transition().duration(500);
            if (ice) {
                t.delay(1000);
                icicle();
            }
            t.call(chart.tension(this.checked ? .5 : 1));
        }*/

        //console.log("Titanic", csv);
        //d3.csv("titanic.csv", function(csv:any) {
        //console.log("PSJson", PSJson);
            let csv = PSData;
            vis.datum(csv).call(chart);
        //})
        /*
        var icicle = function(this:any) {
                var newIce = this.checked,
                tension = chart.tension();
            if (newIce === ice) return;
            if (ice = newIce) {
                var dimensions:any = [];
                vis.selectAll("g.dimension")
                    .each(function(d:any) { dimensions.push(d); });
                dimensions.sort(function(a:any, b:any) { return a.y - b.y; });
                var root = d3.parsets.tree({children: {}}, csv, dimensions.map(function(d:any) { return d.name; }), function() { return 1; }),
                    nodes:any = partition(root),
                    nodesByPath:any = {};
                    nodes.forEach(function(d:any) {
                        var path = d.data.name,
                            p = d;
                        while ((p = p.parent) && p.data.name) {
                        path = p.data.name + "\0" + path;
                        }
                        if (path) nodesByPath[path] = d;
                    });
                var data:any = [];
                vis.on("mousedown.icicle", stopClick, true)
                    .select(".ribbon").selectAll("path")
                    .each(function(d:any) {
                        var node = nodesByPath[d.path],
                            s = d.source,
                            t = d.target;
                        s.node.x0 = t.node.x0 = 0;
                        s.x0 = t.x0 = node.x;
                        s.dx0 = s.dx;
                        t.dx0 = t.dx;
                        s.dx = t.dx = node.dx;
                        data.push(d);
                    });
                iceTransition(vis.selectAll("path"))
                    .attr("d", function(d:any) {
                        var s = d.source,
                            t = d.target;
                        return ribbonPath(s, t, tension);
                    })
                    .style("stroke-opacity", 1);
                iceTransition(vis.selectAll("text.icicle")
                    .data(data)
                    .enter().append("text")
                    .attr("class", "icicle")
                    .attr("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .attr("transform", function(d:any) {
                        return "translate(" + [d.source.x0 + d.source.dx / 2, d.source.dimension.y0 + d.target.dimension.y0 >> 1] + ")rotate(90)";
                    })
                    .text(function(d:any) { return d.source.dx > 15 ? d.node.name : null; })
                    .style("opacity", 1e-6))
                    .style("opacity", 1);
                iceTransition(vis.selectAll("g.dimension rect, g.category")
                    .style("opacity", 1))
                    .style("opacity", 1e-6)
                    .each("end", function(this:any) { d3.select(this).attr("visibility", "hidden"); });
                iceTransition(vis.selectAll("text.dimension"))
                    .attr("transform", "translate(0,-5)");
                vis.selectAll("tspan.sort").style("visibility", "hidden");
            } else {
                vis.on("mousedown.icicle", null)
                    .select(".ribbon").selectAll("path")
                    .each(function(this:any,d:any) {
                        var s = d.source,
                            t = d.target;
                        s.node.x0 = s.node.x;
                        s.x0 = s.x;
                        s.dx = s.dx0;
                        t.node.x0 = t.node.x;
                        t.x0 = t.x;
                        t.dx = t.dx0;
                    });
                iceTransition(vis.selectAll("path"))
                    .attr("d", function(d:any) {
                        var s = d.source,
                            t = d.target;
                        return ribbonPath(s, t, tension);
                    })
                    .style("stroke-opacity", null);
                iceTransition(vis.selectAll("text.icicle"))
                    .style("opacity", 1e-6).remove();
                iceTransition(vis.selectAll("g.dimension rect, g.category")
                    .attr("visibility", null)
                    .style("opacity", 1e-6))
                    .style("opacity", 1);
                iceTransition(vis.selectAll("text.dimension"))
                    .attr("transform", "translate(0,-25)");
                vis.selectAll("tspan.sort").style("visibility", null);
            }
            d3.select("#icicle")
                .on("change", icicle)
                .each(icicle);
        }
        

        function iceTransition(g:any) {
            return g.transition().duration(1000);
        }

        function ribbonPath(s:any, t:any, tension:any) {
            var sx = s.node.x0 + s.x0,
                tx = t.node.x0 + t.x0,
                sy = s.dimension.y0,
                ty = t.dimension.y0;
            var m0 = tension * sy + (1 - tension) * ty;
            var m1 = tension * ty + (1 - tension) * sy;
            return (tension === 1 ? [
                "M", [sx, sy],
                "L", [tx, ty],
                "h", t.dx,
                "L", [sx + s.dx, sy],
                "Z"]
            : ["M", [sx, sy],
                "C", [sx, m0], " ",
                    [tx, m1], " ", [tx, ty],
                "h", t.dx,
                "C", [tx + t.dx, m1], " ", [sx + s.dx, m0], " ", [sx + s.dx, sy],
                "Z"]).join("");
        }

        function stopClick() { d3.event.stopPropagation(); }

        // Given a text function and width function, truncates the text if necessary to
        // fit within the given width.
        function truncateText(text:any, width:any) {
            return function(this:any, d:any, i:any) {
                var t = this.textContent = text(d, i),
                    w = width(d, i);
                if (this.getComputedTextLength() < w) return t;
                this.textContent = "…" + t;
                var lo = 0,
                    hi = t.length + 1,
                    x;
                while (lo < hi) {
                var mid = lo + hi >> 1;
                if ((x = this.getSubStringLength(0, mid)) < w) lo = mid + 1;
                else hi = mid;
                }
                return lo > 1 ? t.substr(0, lo - 2) + "…" : "";
            };
        }

        d3.select("#file").on("change", function(this:any) {
            var file = this.files[0],
                reader = new FileReader;
            reader.onloadend = function() {
                var csv = d3.csv.parse(reader.result);
                vis.datum(csv).call(chart
                    .value(csv[0].hasOwnProperty("Number") ? function(d:any) { return +d.Number; } : 1)
                    .dimensions(function(d:any) { 
                        return d3.keys(d[0]).filter(function(d:any) { 
                            return d !== "Number"; 
                        }).sort(); 
                    }));
            };
            reader.readAsText(file);
        });
        */
    }
    public render() {
        return (
            <div id="parallelSets" />
        )

    }
}

