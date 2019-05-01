/*
    Name: Charlotte Marks
    Student number: 10506942
    Purpose of file: JavaScript code to load in json file and draw LineChart
*/

// loading in the data
var fileName = "data_avocado.json";

var txtFile = new XMLHttpRequest();
txtFile.onreadystatechange = function() {
    if (txtFile.readyState === 4 && txtFile.status == 200) {

        // storing the data in a variable
        var data = JSON.parse(txtFile.responseText);

        // creating an array with the keys of the json file
        const keys = Object.keys(data);

        // generating x coordinates
        transX = createTransform([2015, 2018], [30, 300]);

        var xArray = [];
        for (const key of keys) {
          var coordinate = transX(key);
          xArray.push(coordinate);
        }

        // generating y coordinates
        transY = createTransform([0, 2], [300, 30]);

        var yArray = [];
        for (var key in data) {
          var value = data[key];
          var coordinate = transY(value['AveragePrice']);
          yArray.push(coordinate);
        }

        // generating y axis coordinates
        var yAxis = []
        var yAxisvalue1 = 0.00;
        for (index = 0; index < 21; index++){
          var coordinate = transY(yAxisvalue1);
          yAxis.push(coordinate);
          yAxisvalue1 += 0.10;
        }

        // drawing the line chart
        drawCanvas(xArray, yArray, keys, yAxis);
    }
}
txtFile.open("GET", fileName);
txtFile.send();


function drawCanvas(xData, yData, keysJSON, yAxisData){
  // set up canvas
  const canvas = document.getElementById('line-graph');
  const ctx = canvas.getContext('2d');

  // set line width
  ctx.lineWidth = 5;

  // set title of Chart
  ctx.fillText('Avocado Price in US between 2015-2018', 80, 20)

  // draw axes
  ctx.beginPath();
  ctx.moveTo(30, 30);
  ctx.lineTo(30, 300);
  ctx.lineTo(300, 300);
  ctx.stroke();

  // draw linechart
  ctx.beginPath();
  ctx.moveTo(xData[0], yData[0]);
  xData.forEach(function(x, i){
    ctx.lineTo(x, yData[i]);
    ctx.moveTo(x, yData[i]);
  })
  ctx.stroke();

  // title x axis
  ctx.fillText('Year', 300, 325);

  // draw text to label x axis
  for (index = 0; index < xData.length; index++) {
      ctx.fillText(keysJSON[index], xData[index], 315);
  }

  // title y axis
  ctx.fillText('Price ($)', 0, 20);

  // draw text to label y axis
  var yAxisvalue_draw = 0.00;
  for (index = 0; index < yAxisData.length; index++) {
      ctx.fillText(yAxisvalue_draw.toFixed(2), 0, yAxisData[index]);
      yAxisvalue_draw += 0.10;
  }
}


function createTransform(domain, range){
	// domain is a two-element array of the data bounds [domain_min, domain_max]
	// range is a two-element array of the screen bounds [range_min, range_max]
	// this gives you two equations to solve:
	// range_min = alpha * domain_min + beta
	// range_max = alpha * domain_max + beta
 		// a solution would be:

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // formulas to calculate the alpha and the beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // returns the function for the linear transformation (y= a * x + b)
    return function(x){
      return alpha * x + beta;
    }
}
