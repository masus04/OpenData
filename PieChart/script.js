var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;

var color = d3.scale.category20();

var pie = d3.layout.pie()
    .value(function(d) {
        return d
    })
    .sort(null);

var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 20);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("VisualisierungsDaten_final.csv", type, function(error, d) {
    data = d
    
    init()
    console.log(displayData);
    
    d3.selectAll("input")
        .on("change", change);
    
    function change() {
        calculateDisplayData();
        path = svg.datum(displayData).selectAll("path").data(pie);
        path.transition().duration(750).attrTween("d", arcTween);  // redraw the arcs
    }
});

function color(i, numShades){
    return d3.rgb(color(i)).darker(numShades - (numShades/2))
}

var colorTest = new Array().push(color)

function init(){
    calculateDisplayData();
    
    path = svg.datum(displayData).selectAll("path")
        .data(pie);
    
    //update
    path
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc)
        .each(function(d) { this._current = d; }); // store the initial angles
    
    //enter
    path.enter().append("path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc)
        .each(function(d) { this._current = d; }); // store the initial angles
    
    //exit
    path.exit().remove();
    
}

function calculateDisplayData() {
    calculateTotalDisplay()
}

function calculateTotalDisplay(){
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {
            displayData[entry.Verwaltungsregion_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Schwerpunktfach").checked){
        data.forEach(function(entry) {
            displayData[entry.Bildungsart_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Sprache").checked){
       data.forEach(function(entry) {
            displayData[entry.Unterrichtssprache_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Geschlecht").checked){
        data.forEach(function(entry) {
            displayData[0] += entry.Anzahl_Männer
            displayData[1] += entry.Anzahl_Frauen
        });
    }
}

function calculateRegionDisplay(){
    
}

function calculateSPFDisplay(){

}

function calculateSpracheDisplay(){
    
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    if (document.getElementById("Region").checked){
            data.forEach(function(entry) {
                displayData[(entry.Verwaltungsregion_Code-1)*3 + (entry.Unterrichtssprache_Code - 1)] += entry.Anzahl_Total
            });
    }
    
    if (document.getElementById("Schwerpunktfach").checked){
            data.forEach(function(entry) {
                displayData[(entry.Bildungsart_Code-1)*3 + entry.Unterrichtssprache_Code - 1] += entry.Anzahl_Total
            });
    }
    
    if (document.getElementById("Sprache").checked){
            data.forEach(function(entry) {
                displayData[(entry.Unterrichtssprache_Code-1)*3 + entry.Unterrichtssprache_Code - 1] += entry.Anzahl_Total
            });
    }
    
    if (document.getElementById("Geschlecht").checked){
            data.forEach(function(entry) {
                displayData[(entry.Unterrichtssprache_Code-1)] += entry.Anzahl_Männer
                displayData[(entry.Unterrichtssprache_Code-1)+3] += entry.Anzahl_Frauen
            });
    }
}

function calculateGeschlechtDisplay(){
    displayData = new Array();
    
    displayDataMale = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    displayDataFemale = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {
            displayDataMale[entry.Verwaltungsregion_Code - 1] += entry.Anzahl_Männer
            displayDataFemale[entry.Verwaltungsregion_Code - 1] += entry.Anzahl_Frauen
        });
    }
    
    if (document.getElementById("Schwerpunktfach").checked){
        data.forEach(function(entry) {
            displayDataMale[entry.Bildungsart_Code - 1] += entry.Anzahl_Männer
            displayDataFemale[entry.Bildungsart_Code - 1] += entry.Anzahl_Frauen
        });
    }
    
    if (document.getElementById("Sprache").checked){
       data.forEach(function(entry) {
            displayDataMale[entry.Unterrichtssprache_Code - 1] += entry.Anzahl_Männer
            displayDataFemale[entry.Unterrichtssprache_Code - 1] += entry.Anzahl_Frauen
        });
    }
    
    if (document.getElementById("Geschlecht").checked){
        data.forEach(function(entry) {
            displayDataMale[0] += entry.Anzahl_Männer
            displayDataFemale[0] += entry.Anzahl_Frauen
        });
    }
    
    
    for (var i=0; i<displayDataMale.length; i++){
        displayData.push(displayDataMale[i])
        displayData.push(displayDataFemale[i])
    }
}

function type(d) {
  d.Jahr = Number(d.Jahr)
  d.Verwaltungsregion_Code = Number(d.Verwaltungsregion_Code)
  d.Träger_Code = Number(d.Träger_Code)
  d.Bildungsart_Code = Number(d.Bildungsart_Code)
  d.Typ_Code = Number(d.Typ_Code)
  d.Unterrichtssprache_Code = Number(d.Unterrichtssprache_Code)
  d.Anzahl_Total = Number(d.Anzahl_Total)
  d.Anzahl_Frauen = Number(d.Anzahl_Frauen)
  d.Anzahl_Männer = Number(d.Anzahl_Männer)
  return d;
}

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}