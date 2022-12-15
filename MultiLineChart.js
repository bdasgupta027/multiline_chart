
var margin = {top: 50, right: 120, bottom: 100, left: 80},
    width = 700 - margin.left - margin.right,
    height = 370 - margin.top - margin.bottom;

    
// Adds the svg canvas
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

//Get the scales for the axes (including the color scheme)
var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);


//set x axis with 12 ticks
var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(12)
    .tickFormat(d3.format("d"));

//set y axis with 7 ticks
var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(7)
    .tickFormat(d3.format("d"));

// gridlines in x axis function
function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(7)
}

// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(3)
}


//pull data for the line values and curve using curveBasis
var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.epc); });

//pull the data
d3.csv("BRICSdata.csv", type, function(error, data) {
  if (error) throw error;

    //get all the years from the first column and map it to the epc 
  var countries = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {year: +d.year, epc: +d[id]};
      })
    };
  });

  console.log(countries); <!-- this is an array of length 3-->
  console.log(data);   <!-- this is an array of length 366  excluding the header-->
  console.log(data.columns); <!-- this is an array of length 4 -->
  console.log(data.length); <!-- 366 -->
  console.log(data.columns.slice(1)); <!-- new array starting from 1st element -->
  console.log(data.columns.slice(1).map(function(dummy){return dummy.toUpperCase();}));
  console.log(data.columns.slice(1).map(function(c){return c}));
  console.log(data.map(function(dummy){return dummy["Brazil"];})); <!-- creates a new array of length 365 -->
  console.log(d3.extent(data, function(d) { return d.year; }));

 //set the domains for the graph
  x.domain(d3.extent(data, function(d) { return d.year; }));

  y.domain([
    d3.min(countries, function(c) { return d3.min(c.values, function(d) { return d.epc; }); }),
    d3.max(countries, function(c) { return d3.max(c.values, function(d) { return d.epc; }); })
  ]);

  <!--console.log(countries.map(function(c) {return c.id;}));-->
  
    
  z.domain(countries.map(function(c) { return c.id; }));

//  svg.append("g")
//    .attr("class", "grid")
//    .attr("transform", "translate(0," + height + ")")
//      .call(gridXaxis()
//          .tickSize(-height)
//          .tickFormat("")
//      )

 //add the grid lines   
svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      )

  // add the Y gridlines
  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )

  svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("dx", "-.8em")
        .attr("dy", ".05em")
        .attr("transform", "rotate(-60)" )
        .style("text-anchor", "end")

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -130)
        .attr("y", -40)
        .style("text-anchor", "middle")

  var country = svg.selectAll(".country")
    .data(countries)
    .enter().append("g")
      .attr("class", "country");
    
    //creates the path according to the values
   var paths = country.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.id); })

    //creates the animations using the dashes
     paths.attr("stroke-dasharray", "1000 1000") /*Taken from MarkMcKay animation*/
       .attr("stroke-dashoffset", "1000") /*The dashes left to render*/
       .transition()
       .duration(2000)
       .ease(d3.easeLinear)
       .attr("stroke-dashoffset", 0);

    //adds the names of the countries to the side of the line
  country.append("text")
      .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.year) + "," + y(d.value.epc) + ")"; })
      .attr("x", "1em")
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) { return d.id; });  
});

function type(d, _, columns) {
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}



