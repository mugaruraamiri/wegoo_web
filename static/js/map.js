
// var margin = {top: 10, left: 10, bottom: 10, right: 10},
// 		width = parseInt(d3.select('.mapping').style('width')),
// 		width = width - margin.left - margin.right,
// 		mapRatio = .5,
// 		height = width * mapRatio + 400,
// 		active = d3.select(null);
var width = 900,
	height = 550;

var svg = d3.select("div.mapping").append("svg")
	.attr("width", width)
	.attr("height", height);

var projection = d3.geo.mercator()
    .center([134, 23])
	.scale(1600)
	.translate([250, 745]);

var path = d3.geo.path()
		.projection(projection);

svg.append("rect")
   .attr("class", "background")
   .attr("width", width)
   .attr("height", height);

var map = svg.append("g");

d3.json("static/data/japan.json", function(data){
	
	map.selectAll("path")
		.data(data.features)
		.enter().append("path")
		.attr("d", path)
		.attr("class", "feature")
		.style("stroke", "white");
});

