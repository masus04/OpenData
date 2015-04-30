var width = 960,
    height =800,
    color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#636363"];

var pieSize = 50
var numPies = 5

var pie = d3.layout.pie()
    .value(function(d) {
        return d
    })
    .sort(null);

var pies = new Array;

// constructor for pie class
function Pie(rInner, sel, p){
    this.selector =  sel;
    
    this.pie = p;
    this.arc = d3.svg.arc()
        .innerRadius(rInner)
        .outerRadius(rInner + pieSize);
    
    this.setRadius = function(ri, ro){
        this.arc = d3.svg.arc()
        .innerRadius(ri)
        .outerRadius(ro);
    }
}
for (var i=0; i<numPies; i++)
    pies.push(new Pie(pieSize + i*pieSize, getSelector(i), pie))

function getSelector(i){
    switch (i) {
        case 0:
            return "Region"
            break;
        case 1:
            return "Sprache"
            break;
        case 2:
            return "Geschlecht"
            break;
        case 3:
            return "Gymnasium"
            break;
        case 4:
            return "Berufsmatur"
            break;
    }
    
    //return "Berufsmatur"
}

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("VisualisierungsDaten_final.csv", type, function(error, d) {    
    data = d;
    
    // init
    for (var index=0; index<numPies; index++){
    
        calculateDisplayData(pies[index].selector);
    
        path = svg.datum(displayData).selectAll("path.ring"+index)
            .data(pies[index].pie);
        
        path.enter().append("path")
            .attr('class', 'ring'+index)
            .attr("fill", function(d, i) { return calcColor(i, pies[index].selector); })
            .attr("d", pies[index].arc)
            .attr("data-index", index )
            .each(function(d) { this._current = d; });  // store the initial angles
        
        //console.log(d3.select(this).attr("data-index"))
        
        // ********** Tooltip ********** //
        
        path.on("mouseover", function(d) {
            
        });
            
        path.on("mouseout", function(d) {
        
        });
        
    }
    
    d3.selectAll("input")
        .on("change", change);
    // end init
    
    
    function change() {
            
        adjustRadii();
            
        for (var index=0; index<numPies; index++){ 
            calculateDisplayData(pies[index].selector);
            path = svg.datum(displayData).selectAll("path.ring"+index).data(pies[index].pie);
            path.attr("fill", function(d, i) { return calcColor(i, pies[index].selector); });
            path.transition().duration(750).attrTween("d", arcTween);  // redraw the arcs
        }
    }
    
});

function adjustRadii(){
    
    if (document.getElementById("Region").checked){
        resetRadii()
    }
    
    if (document.getElementById("Sprache").checked){
        resetRadii()
    }
    
    if (document.getElementById("Geschlecht").checked){
        resetRadii()
    }
    
    if (document.getElementById("Gymnasium").checked){
        resetRadii()
            pies[4].setRadius(5*pieSize, 5*pieSize)
    }
    
    if (document.getElementById("Berufsmatur").checked){
        resetRadii()
            pies[3].setRadius(4*pieSize, 4*pieSize)
            pies[4].setRadius(4*pieSize, 5*pieSize)
    }
}

function resetRadii(){
    for (var i=0; i<numPies; i++)
        pies[i].setRadius(pieSize + i*pieSize, 2*pieSize + i*pieSize)
}

var currentIndex = 0;

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
    var index = parseInt( d3.select(this).attr('data-index') );
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
        return pies[index].arc(i(t));
    };
}

function calcColor(n, selector){
    var color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
    var shades = getNoShades(selector)
    
    var colors = new Array()
    
    for (var i=0; i<10; i++){
        colors.push(d3.hsl(color[i]).toString())
        
        for (var j=1; j<=shades; j++)
            colors.push(d3.hsl(color[i]).brighter(j/shades*0.85).toString())
    }
    
    return colors[n]
}

function getNoShades(sel){
    switch (sel) {
        case "Region":
            return 4;
            break;
        case "Gymnasium":
            return 7;
            break;
        case "Berufsmatur":
            return 9;
            break;
        case "Sprache":
            return 2;
            break;
        case "Geschlecht":
            return 1;
            break;
    }
}

function init(){
    
    
    //exit
    path.exit().remove(); 
}

function calculateDisplayData(sel) {    
    if (sel == "Geschlecht")
        calculateGeschlechtDisplay(sel)
    else
        calculateDisplayedData(sel)
    
    //console.log("Selector: " + sel + " displayData: " + displayData);
}

function calculateDisplayedData(sel){    
    var code = setCode(sel)
    var mult = setMult(sel)
    var sub = setSub(sel)
    var flag = setFlagFunction(sel)
     
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {
            if (flag(entry)){
                displayData[(entry.Verwaltungsregion_Code-1)*mult + (entry[code] - sub)] += entry.Anzahl_Total
            }
        });
    }
    
    if (document.getElementById("Gymnasium").checked){
        if (sel == "Berufsmatur")
            displayData[0] =1;
        
        else 
            data.forEach(function(entry) {
                if (entry.Bildungsart_Code < 9 ){
                    displayData[(entry.Bildungsart_Code-1)*mult + entry[code] - sub] += entry.Anzahl_Total
                }
            });
    }
    
    if (document.getElementById("Berufsmatur").checked){
        if (sel == "Gymnasium")
            displayData[0] =1;
        
        else 
            data.forEach(function(entry) {
                if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19){
                    displayData[(entry.Bildungsart_Code-9)*mult + entry[code] - sub] += entry.Anzahl_Total
                };
            });
    }
    
    if (document.getElementById("Sprache").checked){
        data.forEach(function(entry) {
            if (flag(entry)){
                displayData[(entry.Unterrichtssprache_Code-1)*mult + entry[code] - sub] += entry.Anzahl_Total
            };
        });
    }
    
    if (document.getElementById("Geschlecht").checked){
        data.forEach(function(entry) {
            if(flag(entry)){
                displayData[(entry[code]-sub)] += entry.Anzahl_Männer
                displayData[(entry[code]-sub)+mult] += entry.Anzahl_Frauen
            }
        });
    }
}

function calculateGeschlechtDisplay(){
    
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {
            displayData[(entry.Verwaltungsregion_Code - 1) *2 ] += entry.Anzahl_Männer
            displayData[(entry.Verwaltungsregion_Code - 1) *2 +1] += entry.Anzahl_Frauen
        });
    }
    
    //  displayData[(entry.Verwaltungsregion_Code-1)*3 + (entry.Unterrichtssprache_Code - 1)] += entry.Anzahl_Total
    
    if (document.getElementById("Gymnasium").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code < 9){
                displayData[(entry.Bildungsart_Code - 1) *2 ] += entry.Anzahl_Männer
                displayData[(entry.Bildungsart_Code - 1) *2 +1] += entry.Anzahl_Frauen
            }
        });
    }
    
    if (document.getElementById("Berufsmatur").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19){
                displayData[(entry.Bildungsart_Code - 9) *2 ] += entry.Anzahl_Männer
                displayData[(entry.Bildungsart_Code - 9) *2 +1] += entry.Anzahl_Frauen
            }
        });
    }
    
    if (document.getElementById("Sprache").checked){
       data.forEach(function(entry) {
            displayData[(entry.Unterrichtssprache_Code - 1) *2 ] += entry.Anzahl_Männer
            displayData[(entry.Unterrichtssprache_Code - 1) *2 +1] += entry.Anzahl_Frauen
        });
    }
    
    if (document.getElementById("Geschlecht").checked){
        data.forEach(function(entry) {
            displayData[0] += entry.Anzahl_Männer
            displayData[2] += entry.Anzahl_Frauen
        });
    }
}
            
function setCode(sel){
    switch (sel) {
        case "Region":
            return "Verwaltungsregion_Code"
            break;
        case "Gymnasium":
            return "Bildungsart_Code"
            break;
        case "Berufsmatur":
            return "Bildungsart_Code"
            break;
        case "Sprache":
            return "Unterrichtssprache_Code"
            break;
        case "Geschlecht":
            return "Geschlecht"
            break;
    }
}
    
function setMult(sel){
    switch (sel) {
        case "Region":
            return 5
            break;
        case "Gymnasium":
            return 8
            break;
        case "Berufsmatur":
            return 10
            break;
        case "Sprache":
            return 3
            break;
        case "Geschlecht":
            return 2
            break;
    }
}

function setSub(sel){
    if (sel == "Berufsmatur")
        return 9;
    else
        return 1;
}

function setFlagFunction(selector){
    if (selector == "Gymnasium"){
        return function(entry){return (entry.Bildungsart_Code < 9)}
    }
    else if (selector == "Berufsmatur"){
        return function(entry){return (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19)}
    }
    else
        return function(){return true}
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


// ***************************** //
// ********** Tooltip ********** //
// ***************************** //

var tooltip = d3.select("body")
  .append('div')
  .attr('class', 'tooltip');

tooltip.append('div')
  .attr('class', 'label');

tooltip.append('div')
  .attr('class', 'count');

tooltip.append('div')
  .attr('class', 'percent');

function printTooltip(){
    //console.log(d3.select(this)).attr("data-index"))
    //var index = parseInt( d3.select(this).attr('data-index') );
    //console.log("index: " + index)
    //var label = pies[index].selector
    
}