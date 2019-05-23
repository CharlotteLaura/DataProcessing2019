/*
    Name: Charlotte Marks
    Student number: 10506942
    Purpose of file: JavaScript code to draw a d3 scatterplot
    Datasource : OECD
*/

window.onload = function() {

  // loading in the data
  var teenPregnancies = "teenPregnancy.json";
  var teensInViolentArea = "teensArea.json";
  var GDP= "gdp.json";

  var requests = [d3.json(teensInViolentArea), d3.json(teenPregnancies), d3.json(GDP)];


  Promise.all(requests).then(function(response) {
        var data = clean_data(response);

        // when user clicks radio button 2012, scatterplot with 2012 data is drawn
        document.getElementById("2012").onclick = function() {

          // removing previous graphs
          d3.selectAll('svg').remove();

          draw_d3_scatterplot(data["2012"], 2012);};

        // when user clicks radio button 2014, scatterplot with 2014 data is drawn
        document.getElementById("2014").onclick = function() {

          d3.selectAll('svg').remove();

          draw_d3_scatterplot(data["2014"], 2014);};


  // errorhandling
  }).catch(function(e){
      throw(e);
    });

};

function clean_data(data){
  area_data = data[0]
  teenpregnancy_data = data[1]
  gdp_data = data[2]

  // creating array with year, country and gdp as keys
  var year = []
  for (var key in gdp_data) {
    for (var key1 in gdp_data[key]) {
        year.push({
          "Year": gdp_data[key][key1].Year,
          "Country": gdp_data[key][key1].Country,
          "GDP": gdp_data[key][key1].Datapoint
        });
      }
    }

// adding teenpregnancy data to the array
  for (country in teenpregnancy_data){
      for (var key1 in teenpregnancy_data[country]) {
        year.forEach(function(y){
          if (y.Country == country && y.Year == teenpregnancy_data[country][key1].Time){
            y["teenPreg"] = teenpregnancy_data[country][key1].Datapoint
          }
        })
      }
    }

    // adding teenarea data to the array
    for (country in area_data){
      for (var key1 in area_data[country]){
        year.forEach(function(y){
          if (y.Country == country && y.Year == area_data[country][key1].Time){
            y["teenArea"] = area_data[country][key1].Datapoint
          }
        })
      }
    }

    // filtering elements from 2012 and 2014 that contains all 5 elements
    var filteredYear = [];

    year.forEach(function(y){
      if (Object.keys(y).length == 5 && (y["Year"] == "2012" || y["Year"] == "2014")){
        filteredYear.push(y);
      }
    })

    // creating the end datastructure: object with year as key and the other elements information as value
    var endData = {
      "2012": [],
      "2014": []
    };

    filteredYear.forEach(function(y){
      if (y["Year"] == "2012"){
        endData["2012"].push(y);
      }
      if (y["Year"] == "2014"){
        endData["2014"].push(y);
      }
    });

    return endData;
};

function draw_d3_scatterplot(input_data, year){
  // setting the margins
  var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960,
    height = 500,
    svgWidth = width - margin.left - margin.right,
    svgHeight = height - margin.top - margin.bottom,
    plotWidth = svgWidth - margin.left - margin.right,
    plotHeight = svgHeight - margin.top - margin.bottom;


  // create SVG element
  var svg = d3.select("body")
              .append("svg")
              .attr("width", svgWidth)
              .attr("height", svgHeight);

  // create g element for drawing the scatterplot
  var svgPlot = svg.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // scaling functions
  var yScale = d3.scaleLinear()
                  .domain([0, d3.max(input_data, function(d) { return d["teenPreg"]})])
                  .range([plotHeight - margin.top - margin.right, 0]);

  var xScale = d3.scaleLinear()
                    .domain([0, d3.max(input_data, function(d) { return d["teenArea"]})])
                    .range([0, plotWidth - margin.left - margin.right]);

  // oloring for different levels of GDP
  var coloring = [{color:"#edf8b1"}, {color:"#7fcdbb"}, {color:"#2c7fb8"}];

  // creating scatterplot
  var scatterplot = svgPlot.selectAll("circle")
                            .data(input_data)
                            .enter()
                            .append("circle");

  // drawing the datapoints
  scatterplot.attr("cx", function(d) {
                return xScale(d["teenArea"]);
              })
              .attr("cy", function(d){
                return yScale(d["teenPreg"]);
              })
              .attr("r", 5)
              .attr("fill", function(d){
                          if (d["GDP"] < 30000) {
                            return coloring[0].color;
                          }
                          else if (d["GDP"] < 45000) {
                            return coloring[1].color;
                          }
                          else {
                            return coloring[2].color;
                          }
                        });

    // drawing x axis
    svgPlot.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (plotHeight - margin.left) + ")")
          .call(d3.axisBottom(xScale));

    // label x axis
    svg.append("text")
            .attr("transform", "translate(" + (plotWidth/2) + " ," + (svgHeight-(margin.bottom) + ")"))
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .text("% Children (0-17) living in areas with problems with crime or violence");

    // drawing y axis
    svgPlot.append("g")
              .attr("class", "y axis")
              .call(d3.axisLeft(yScale));

    // label y axis
    svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate("+ (10) +","+(plotHeight/2)+")rotate(-90)")
            .style("font-size", "12px")
            .text("Births per 1000 women aged 15-19");

    // draw title
    svg.append("text")
            .attr("transform", "translate(" + (svgWidth/2) + " ," + (svgHeight - plotHeight - margin.top) + ")")
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Teenpregnancy related to problematic living area and GDP($) in Europe in " + year);

    // drawing legend
    svg.append("circle").attr("cx",700).attr("cy",130).attr("r", 6).style("fill", "#edf8b1")
    svg.append("circle").attr("cx",700).attr("cy",160).attr("r", 6).style("fill", "#7fcdbb")
    svg.append("circle").attr("cx",700).attr("cy",190).attr("r", 6).style("fill", "#2c7fb8")
    svg.append("text").attr("x", 720).attr("y", 130).text("GDP < $30000").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 720).attr("y", 160).text("GDP $30000 - 45000").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", 720).attr("y", 190).text("GDP > $45000").style("font-size", "15px").attr("alignment-baseline","middle");

    // drawing legend borders
    svg.append("rect")
        .attr("x", 680)
        .attr("y", 110)
        .attr("height", 90)
        .attr("width", 180)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", "None");

};
