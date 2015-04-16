var width = 1200,
    height = 800,
    radius = Math.min(width, height) / 2;

//var color = d3.scale.category20();
var color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#636363"]

var selector = "Geschlecht"
var pieSize = 75

var pie = d3.layout.pie()
    .value(function(d) {
        return d
    })
    .sort(null);

var pies = new Array;

// constructor for pie class
function Pie(rInner, sel, p){
    this.radius = rInner;
    this.selector =  sel;
    
    this.pie = p;
    this.arc = d3.svg.arc()
        .innerRadius(this.radius)
        .outerRadius(this.radius + pieSize);
}
for (var i=0; i<5; i++)
    pies.push(new Pie(pieSize + i*pieSize, selector, pie))

var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 20);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("VisualisierungsDaten_final.csv", type, function(error, d) {    
    data = d;
    
    // init
    calculateDisplayData(pies[0].selector);
    
    path = svg.datum(displayData).selectAll("path")
        .data(pies[0].pie);
    
    path.enter().append("path")
        .attr("fill", function(d, i) { return calcColor(i, pies[0].selector); })
        .attr("d", pies[0].arc)
        .each(function(d) { this._current = d; }); // store the initial angles
    
    d3.selectAll("input")
        .on("change", change);
    // end init
    
    
    function change() {
        calculateDisplayData(pies[0].selector);
        path = svg.datum(displayData).selectAll("path").data(pies[0].pie);
        path.attr("fill", function(d, i) { return calcColor(i, pies[0].selector); })
        path.transition().duration(750).attrTween("d", arcTween);  // redraw the arcs
    }
});

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
    
    console.log("displayData: " + displayData);
}

function calculateDisplayedData(sel){    
    var code = setCode(sel)
    var mult = setMult(sel)
    var sub = setSub(sel)
    var flag = setFlagFunction(sel)
    
    console.log("code: " + code + " mult: " + mult + " sub: " + sub + " flag: " + flag)
    
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {
            if (flag(entry)){
                //console.log(entry[])
                displayData[(entry.Verwaltungsregion_Code-1)*mult + (entry[code] - sub)] += entry.Anzahl_Total
            }
        });
    }
    
    if (document.getElementById("Gymnasium").checked){
        data.forEach(function(entry) {
            if (flag(entry) && entry.Bildungsart_Code < 9 ){
                displayData[(entry.Bildungsart_Code-1)*mult + entry[code] - sub] += entry.Anzahl_Total
            }
        });
    }
    
    if (document.getElementById("Berufsmatur").checked){
            data.forEach(function(entry) {
                if (flag(entry) && entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19){
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
            displayData[1] += entry.Anzahl_Frauen
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

function setFlagFunction(){
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

// Store the displayed angles in _current.
// Then, interpolate from _current to the new angles.
// During the transition, _current is updated in-place by d3.interpolate.
function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return pies[0].arc(i(t));
  };
}

//              *****       ******         *****               //
// ***** Old calculate[..]Display functions (refactored) ***** //
//              *****       ******         *****               //


/*switch (sel) {
        case "Region":
            calculateRegionDisplay()
            break;
        case "Gymnasium":
            calculateGymnasiumDisplay()
            break;
        case "Berufsmatur":
            calculateBMDisplay()
            break;
        case "Sprache":
            calculateSpracheDisplay()
            break;
        case "Geschlecht":
            calculateGeschlechtDisplay()
            break;
        default:
            calculateTotalDisplay()
            break;
    }*/


/*
function calculateTotalDisplay(){
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {
            displayData[entry.Verwaltungsregion_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Gymnasium").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code < 9)
                displayData[entry.Bildungsart_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Berufsmatur").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19)
                displayData[entry.Bildungsart_Code - 9] += entry.Anzahl_Total
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
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {
            displayData[(entry.Verwaltungsregion_Code - 1)*5] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Gymnasium").checked){
        data.forEach(function(entry) {
            if(entry.Bildungsart_Code < 9)
                displayData[(entry.Bildungsart_Code-1)*5 + entry.Verwaltungsregion_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Berufsmatur").checked){
        data.forEach(function(entry) {
            if(entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19)
                displayData[(entry.Bildungsart_Code-9)*5 + entry.Verwaltungsregion_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Sprache").checked){
        data.forEach(function(entry) {
            displayData[(entry.Unterrichtssprache_Code-1)*5 + entry.Verwaltungsregion_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Geschlecht").checked){
        data.forEach(function(entry) {
            displayData[(entry.Verwaltungsregion_Code-1)] += entry.Anzahl_Männer
            displayData[(entry.Verwaltungsregion_Code-1)+5] += entry.Anzahl_Frauen
        });
    }
    
}

function calculateGymnasiumDisplay(){
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {
            if(entry.Bildungsart_Code < 9)
                displayData[(entry.Verwaltungsregion_Code-1)*8 + (entry.Bildungsart_Code - 1)] += entry.Anzahl_Total // example
        });
    }
    
    if (document.getElementById("Gymnasium").checked){
        data.forEach(function(entry) {
            if(entry.Bildungsart_Code < 9)
                displayData[(entry.Bildungsart_Code - 1)*8] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Berufsmatur").checked){
        // do nothing since data should not be displayed
    }
    
    if (document.getElementById("Sprache").checked){
        data.forEach(function(entry) {
            if(entry.Bildungsart_Code < 9)
                displayData[(entry.Unterrichtssprache_Code-1)*8 + entry.Bildungsart_Code - 1] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Geschlecht").checked){
        data.forEach(function(entry) {
            
            displayData[(entry.Bildungsart_Code-1)] += entry.Anzahl_Männer
            displayData[(entry.Bildungsart_Code-1)+8] += entry.Anzahl_Frauen
        });
    }
}

function calculateBMDisplay(){
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]    
    
    if (document.getElementById("Region").checked){
        data.forEach(function(entry) {            
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19)
                displayData[(entry.Verwaltungsregion_Code-1)*10 + (entry.Bildungsart_Code - 9)] += entry.Anzahl_Total // example
        });
    }
    
    if (document.getElementById("Gymnasium").checked){
        // do nothing since data should not be displayed
    }
    
    if (document.getElementById("Berufsmatur").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19)
               displayData[(entry.Bildungsart_Code - 9) *10] += entry.Anzahl_Total 
        });
    }
    
    if (document.getElementById("Sprache").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19)
                displayData[(entry.Unterrichtssprache_Code-1)*10 + entry.Bildungsart_Code - 9] += entry.Anzahl_Total
        });
    }
    
    if (document.getElementById("Geschlecht").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19){
                displayData[(entry.Bildungsart_Code - 9)] += entry.Anzahl_Männer
                displayData[(entry.Bildungsart_Code - 9)+10] += entry.Anzahl_Frauen
            }
        });
    }
}

function calculateSpracheDisplay(){
    
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    if (document.getElementById("Region").checked){
            data.forEach(function(entry) {
                displayData[(entry.Verwaltungsregion_Code-1)*3 + (entry.Unterrichtssprache_Code - 1)] += entry.Anzahl_Total
            });
    }
    
    if (document.getElementById("Gymnasium").checked){
            data.forEach(function(entry) {
                if(entry.Bildungsart_Code < 9)
                    displayData[(entry.Bildungsart_Code-1)*3 + entry.Unterrichtssprache_Code - 1] += entry.Anzahl_Total
            });
    }
    
    if (document.getElementById("Berufsmatur").checked){
            data.forEach(function(entry) {
                if(entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19)
                    displayData[(entry.Bildungsart_Code-9)*3 + entry.Unterrichtssprache_Code - 1] += entry.Anzahl_Total
            });
    }
    
    if (document.getElementById("Sprache").checked){
            data.forEach(function(entry) {
                displayData[(entry.Unterrichtssprache_Code-1)*3 + entry.Unterrichtssprache_Code - 1] += entry.Anzahl_Total
            });
    }
    
    if (document.getElementById("Geschlecht").checked){
            data.forEach(function(entry) {
                if(entry.Bildungsart_Code < 9){
                    displayData[(entry.Unterrichtssprache_Code-1)] += entry.Anzahl_Männer
                    displayData[(entry.Unterrichtssprache_Code-1)+3] += entry.Anzahl_Frauen
                }
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
    
    if (document.getElementById("Gymnasium").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code < 9){
                displayDataMale[entry.Bildungsart_Code - 1] += entry.Anzahl_Männer
                displayDataFemale[entry.Bildungsart_Code - 1] += entry.Anzahl_Frauen
            }
        });
    }
    
    if (document.getElementById("Berufsmatur").checked){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19){
                displayDataMale[entry.Bildungsart_Code - 9] += entry.Anzahl_Männer
                displayDataFemale[entry.Bildungsart_Code - 9] += entry.Anzahl_Frauen
            }
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
*/
