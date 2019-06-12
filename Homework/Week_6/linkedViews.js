/*
    Name: Charlotte Marks
    Student number: 10506942
    Purpose of file: Show two linked views about educational data
    Datasource : OECD
*/

window.onload = function() {

  // load in data before calling functions to draw charts
  d3.json("pisaData2.json").then(function(response) {
        var data = response;

        // draw barchart
        var barChart = draw_d3_barchart(data);

        // create the piechart framework
        var initialize = initialize_piechart(data[0]);

        // create fist piechart with acutal data
        var firstPieChart = update_piechart(data[0], initialize)

        // updates piechart after clicking on a bar of the barchart
        barChart.on("click", function(d){
          update_piechart(d, initialize)});

  // errorhandling
  }).catch(function(e){
      throw(e);
    });

};


function draw_d3_barchart(input_data){

  // setting the margins
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1260,
    height = 500,
    svgWidth = width - margin.left - margin.right,
    svgHeight = height - margin.top - margin.bottom,
    plotWidth = svgWidth - margin.left - margin.right,
    plotHeight = svgHeight - margin.top - margin.bottom;
    barPadding = 0.2


  // create svg element
  var svg = d3.select("#barchart1_area")
              .append("svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight);

  // create g element for barchart to be created in
  var svgPlot = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // scaling functions
  var yScale = d3.scaleLinear()
                  .domain([0, d3.max(input_data, function(d) { return d["TOTAL_VALUE"]})])
                  .range([plotHeight, 0]);

  var xScale = d3.scaleBand()
                  .domain(input_data.map(function (d) { return d["LOCATION"]; }))
                  .range([0, svgWidth - margin.left - margin.right])
                  .padding(barPadding);

  // defining tooltip
  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  // creating barchart
  var bars = svgPlot.selectAll("rect")
                    .data(input_data)
                    .enter()
                    .append("rect");

  // drawing bars
  var bars = bars.attr("x", function(d) {
                    return xScale(d["LOCATION"]);})
                  .attr("y", function(d) {
                    return yScale(d["TOTAL_VALUE"]);})
                  .attr("width", function(d) {
                    return xScale.bandwidth();})
                  .attr("height", function(d) {
                    return (plotHeight - yScale(d["TOTAL_VALUE"]));})
                  .attr("fill", "teal")
                  .on("mousemove", function(d){
                    d3.select(this)
                    	.attr("fill", "red");
                      tooltip
                        .style("left", d3.event.pageX - 50 + "px")
                        .style("top", d3.event.pageY - 70 + "px")
                        .style("display", "inline-block")
                        .html(("Total score: " + d["TOTAL_VALUE"]));
                  })
            		  .on("mouseout", function(d){
                      tooltip.style("display", "none")
                      d3.select(this).attr("fill", "teal")
                    });


  // drawing x axis
  svgPlot.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (svgHeight - margin.left) + ")")
          .call(d3.axisBottom(xScale));

  // label x axis
  svg.append("text")
        .attr("transform", "translate(" + (plotWidth/2) + " ," + svgHeight + ")")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Country");


  // drawing y axis
  svgPlot.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale));

  // label y axis
  svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (10) +","+(plotHeight/2)+")rotate(-90)")
        .style("font-size", "12px")
        .text("Total score for reading, math and science combined");

  // draw title
  svg.append("text")
        .attr("transform", "translate(" + (svgWidth/2) + " ," + (svgHeight - plotHeight - margin.top) + ")")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("PISA (Programme for International Student Assessment) scores in 2015 for 44 countries");

  return bars;

};


function initialize_piechart(input_data) {

  // putting the datapoints in an array
  var data = {math: input_data["VALUE_MATH"], reading: input_data["VALUE_READ"], science: input_data["VALUE_SCIENCE"]};

  // setting margins, width,  height and radius
  var margin = {top: 50, right: 100, bottom: 0, left: 50},
    svgWidth = 600,
    svgHeight = 500,
    plotWidth = svgWidth - margin.left - margin.right,
    plotHeight = svgHeight - margin.top - margin.bottom,
    radius = Math.min(plotWidth, plotHeight) / 2;


 // creating svg element
  var svg = d3.select("#piechart_area")
              .append("svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight);


  // tooltip
  var tooltip = d3.select("body").append("div").attr("class", "toolTip");


  // creating g element for the chart to be created in
  var g = svg.append("g")
                .attr("class", "g")
                .attr("transform", "translate(" + (margin.left + plotWidth/2) + "," + (margin.top + plotHeight/2) + ")");

  // draw title
  svg.append("text")
          .attr("class", "pieTitle")
          .attr("x", margin.left + svgWidth/2)
          .attr("y", margin.top/2)
          .style("text-anchor", "middle")
          .style("font-size", "20px")
          .text("Seperate scores for math, reading and science");

  // creating colorscale
  var color = d3.scaleOrdinal()
                    .domain(data)
                    .range(["#66c2a5", "#fc8d62", "#8da0cb"]);
                    //.range(d3.schemeSet2);

  return [color, radius, g, svg]
};

function update_piechart(input_data, initialize_return){
  var data = {math: input_data["VALUE_MATH"], reading: input_data["VALUE_READ"], science: input_data["VALUE_SCIENCE"]};

  var color = initialize_return[0];
  var radius = initialize_return[1];
  var g = initialize_return[2];
  var svg = initialize_return[3];

  // determining size of wedges
  var pie = d3.pie()
                .sort(null)
                .value(function(d) {return d.value; });
  var data_ready = pie(d3.entries(data));

  // shape helper to build arcs
  var arcGenerator = d3.arc()
                        .innerRadius(0)
                        .outerRadius(radius)

  // tooltip
  var tooltip = d3.select("body").append("div").attr("class", "toolTip");

  // creating the piechart
  var arcs = d3.selectAll(".g")
                .selectAll("path")
                .data(data_ready);

  var path = arcs.enter()
                    .append('path');

  var visualize = path
                  .merge(arcs)
                  .attr('d', arcGenerator)
                  .attr('fill', function(d){ return(color(d.data.key)) })
                  .attr("stroke", "black")
                  .style("stroke-width", "2px")
                  .style("opacity", 0.7)
                  .on("mouseover", function(d){
                    tooltip
                    .style("display", "inline-block")
                    .html("Score: " + d.data.value);})
                  .on("mousemove", function(d) {
                    tooltip
                    .style("left", d3.event.pageX - 40 + "px")
                    .style("top", d3.event.pageY - 40 + "px")
                  })
                  .on("mouseout", function() {
                    d3.selectAll(".toolTip").style("display", "none");});


  // drawing legend
  svg.append('g')
      .attr('class', 'legend')
      .attr("transform","translate(" + (500) + "," + (50) + ")")
      .selectAll('text')
      .data(data_ready)
      .enter()
      .append('text')
      .text(function(d) { return '• ' + d.data.key; })
      .attr('fill', function(d) { return color(d.data.key); })
      .attr('y', function(d, i) { return 20 * (i + 1); })
      .style("font-size", "25px").attr("alignment-baseline","middle");;

};
