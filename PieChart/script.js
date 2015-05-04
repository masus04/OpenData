var windowWidth = window.innerWidth,
    windowWidth = windowWidth/1.5,
    windowHeight = windowWidth/1.5,
    color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#636363"],
    checked = "none";

function setFontSize(fontsize){    
    var labels = d3.selectAll("label")
    
    labels.style("font-size", fontsize+"px")
    
    if (d3.select("#selector").node().getBoundingClientRect().height > 2 * fontsize && fontsize > 8)
        setFontSize(fontsize -1)
}

setFontSize(35)

var pieSize = 50/1500*window.innerWidth
var numPies = 5

var displayDataList = new Array(numPies)

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

// ********** Tooltip ********** //

var tooltip = d3.select("body")
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip');

tooltip.append('div')
  .attr('class', 'subCathegory')

tooltip.append('div')
  .attr('class', 'count');

tooltip.append('div')
  .attr('class', 'percent');

var tooltip = d3.select(".tooltip")
    tooltip.style("width", Math.round(windowWidth / 4) + "px")
    tooltip.selectAll("div").style("font-size", Math.round(windowWidth/75) + "px")
// ********** /Tooltip ********** //

//d3.select("svg").attr("width", "100%");

var svg = d3.select("#chart").append("svg")
    .attr("width", windowWidth)
    .attr("height", windowHeight)
  .append("g")
    .attr("transform", "translate(" + windowWidth / 3 + "," + windowHeight / 2 + ")");      // TODO: translate to mouse position

d3.csv("VisualisierungsDaten_final.csv", type, function(error, d) {    
    data = d;
    
    // init
    for (var index=0; index<numPies; index++){
        
        displayDataList[index] = calculateDisplayData(pies[index].selector);
    
        path = svg.datum(displayData).selectAll("path.ring"+index)
            .data(pies[index].pie);
        
        path.enter().append("path")
            .attr('class', 'ring'+index)
            .attr("fill", function(d, i) { return calcColor(i, pies[index].selector); })
            .attr("d", pies[index].arc)
            .attr("data-index", index )
            .each(function(d) { this._current = d;})  // store the initial angles
            
            // ********** Tooltip ********** //
        
            .on("mouseover", function(d, displayIndex) {
            
                checkInput()
                var index = d3.select(this).attr('data-index');
                var selector = pies[index].selector
                
                var count = displayDataList[index][displayIndex]
                //console.log(displayDataList[index])
                
                var abschlüsse = getAbschlüsse(index, displayIndex)
                
                tooltip.select('.subCathegory').html(pies[index].selector + ": " + getCathegory(index, displayIndex))
                tooltip.select('.count').html("Abschlüsse absolut : " + abschlüsse)
                
                var numCathegories = getNoShades(pies[index].selector) + 1
                var relative = 100 * abschlüsse / (getTotalAbschlüsse(Math.floor(displayIndex / numCathegories)))
                
                tooltip.select('.percent').html("Abschlüsse Relativ: " + relative.toFixed(2) + "%")
                
                tooltip.style('display', 'block');
            
            })
            
            .on("mouseout", function(d) {
                tooltip.style('display', 'none');
            });
        
        
            setupLegend()
    }
    
    d3.selectAll("input")
        .on("change", change);
    // end init
    
    
    function change() {
        
        adjustRadii();
            
        for (var index=0; index<numPies; index++){ 
            displayDataList[index] = calculateDisplayData(pies[index].selector);
            path = svg.datum(displayData).selectAll("path.ring"+index).data(pies[index].pie);
            path.attr("fill", function(d, i) { return calcColor(i, pies[index].selector); });
            path.transition().duration(750).attrTween("d", arcTween);  // redraw the arcs
        }
        
        setupLegend()
    }
    
});

function adjustRadii(){
    
    checkInput()
    
    if (checked == "Region"){
        resetRadii()
    }
    
    if (checked == "Sprache"){
        resetRadii()
    }
    
    if (checked == "Geschlecht"){
        resetRadii()
    }
    
    if (checked == "Gymnasium"){
        resetRadii()
            pies[4].setRadius(5*pieSize, 5*pieSize)
    }
    
    if (checked == "Berufsmatur"){
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
    var shades = getNoShades(selector)
    var colors = createColors(selector, shades)
    
    return colors[n]
}

function createColors(selector, shades){
    var color = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]
    var colors = new Array()
    
    for (var i=0; i<10; i++){
        colors.push(d3.hsl(color[i]).toString())
        
        for (var j=1; j<=shades; j++)
            colors.push(d3.hsl(color[i]).brighter(j/shades*0.85).toString())
    }
    
    return colors
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
    
    return displayData
        
    //console.log("Selector: " + sel + " displayData: " + displayData);
}

function calculateDisplayedData(sel){    
    var code = setCode(sel)
    var mult = setMult(sel)
    var sub = setSub(sel)
    var flag = setFlagFunction(sel)
     
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    checkInput()
    
    if (checked == "Region"){
        data.forEach(function(entry) {
            if (flag(entry)){
                displayData[(entry.Verwaltungsregion_Code-1)*mult + (entry[code] - sub)] += entry.Anzahl_Total
            }
        });
    }
    
    if (checked == "Gymnasium"){
        if (sel == "Berufsmatur")
            displayData[0] =1;
        
        else 
            data.forEach(function(entry) {
                if (entry.Bildungsart_Code < 9 ){
                    displayData[(entry.Bildungsart_Code-1)*mult + entry[code] - sub] += entry.Anzahl_Total
                }
            });
    }
    
    if (checked == "Berufsmatur"){
        if (sel == "Gymnasium")
            displayData[0] =1;
        
        else 
            data.forEach(function(entry) {
                if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19){
                    displayData[(entry.Bildungsart_Code-9)*mult + entry[code] - sub] += entry.Anzahl_Total
                };
            });
    }
    
    if (checked == "Sprache"){
        data.forEach(function(entry) {
            if (flag(entry)){
                displayData[(entry.Unterrichtssprache_Code-1)*mult + entry[code] - sub] += entry.Anzahl_Total
            };
        });
    }
    
    if (checked == "Geschlecht"){
        data.forEach(function(entry) {
            if(flag(entry)){
                displayData[(entry[code]-sub)] += entry.Anzahl_Männer
                displayData[(entry[code]-sub)+mult] += entry.Anzahl_Frauen
            }
        });
    }
}

function calculateGeschlechtDisplay(){
    
    displayData = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    
    checkInput()
    
    if (checked == "Region"){
        data.forEach(function(entry) {
            displayData[(entry.Verwaltungsregion_Code - 1) *2 ] += entry.Anzahl_Männer
            displayData[(entry.Verwaltungsregion_Code - 1) *2 +1] += entry.Anzahl_Frauen
        });
    }
    
    //  displayData[(entry.Verwaltungsregion_Code-1)*3 + (entry.Unterrichtssprache_Code - 1)] += entry.Anzahl_Total
    
    if (checked == "Gymnasium"){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code < 9){
                displayData[(entry.Bildungsart_Code - 1) *2 ] += entry.Anzahl_Männer
                displayData[(entry.Bildungsart_Code - 1) *2 +1] += entry.Anzahl_Frauen
            }
        });
    }
    
    if (checked == "Berufsmatur"){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19){
                displayData[(entry.Bildungsart_Code - 9) *2 ] += entry.Anzahl_Männer
                displayData[(entry.Bildungsart_Code - 9) *2 +1] += entry.Anzahl_Frauen
            }
        });
    }
    
    if (checked == "Sprache"){
       data.forEach(function(entry) {
            displayData[(entry.Unterrichtssprache_Code - 1) *2 ] += entry.Anzahl_Männer
            displayData[(entry.Unterrichtssprache_Code - 1) *2 +1] += entry.Anzahl_Frauen
        });
    }
    
    if (checked == "Geschlecht"){
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

function checkInput(){
    if (document.getElementById("Region").checked)
        checked = "Region"
    else if (document.getElementById("Gymnasium").checked)
        checked = "Gymnasium"
    else if (document.getElementById("Berufsmatur").checked)
        checked = "Berufsmatur"
    else if (document.getElementById("Sprache").checked)
        checked = "Sprache"
    else if (document.getElementById("Geschlecht").checked)
        checked = "Geschlecht"        
}

// Tooltip //

function getCathegory(index, displayIndex){
    var sel = pies[index].selector
    var numCathegories = getNoShades(sel)+1
    return legendText(displayIndex % numCathegories, sel)
}

function getAbschlüsse(index, displayIndex){
    return displayDataList[index][displayIndex]
}

function getTotalAbschlüsse(totalIndex){
    return calculateTotalAbschlüsse()[totalIndex]
}

function calculateTotalAbschlüsse(){
    var totalAbschlüsse = [0,0,0,0,0,0,0,0,0,0]
    
    if (checked == "Region"){
        data.forEach(function(entry) {
            totalAbschlüsse[(entry.Verwaltungsregion_Code - 1)] += entry.Anzahl_Total
        });
    }
    
    if (checked == "Gymnasium"){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code < 9){
                totalAbschlüsse[(entry.Bildungsart_Code - 1)] += entry.Anzahl_Total
            }
        });
    }
    
    if (checked == "Berufsmatur"){
        data.forEach(function(entry) {
            if (entry.Bildungsart_Code > 8 && entry.Bildungsart_Code < 19){
                totalAbschlüsse[(entry.Bildungsart_Code - 9)] += entry.Anzahl_Total
            }
        });
    }
    
    if (checked == "Sprache"){
       data.forEach(function(entry) {
            totalAbschlüsse[(entry.Unterrichtssprache_Code - 1)] += entry.Anzahl_Total
        });
    }
    
    if (checked == "Geschlecht"){
        data.forEach(function(entry) {
            totalAbschlüsse[0] += entry.Anzahl_Männer
            totalAbschlüsse[1] += entry.Anzahl_Frauen
        });
    }
    
    return totalAbschlüsse
    
}

// Legend //

function setupLegend(){

    var legendRectSize = windowWidth/25;
    var legendSpacing = windowWidth/100;

    checkInput()
    var legendArray = createColors(checked, 0).slice(0, getNoShades(checked)+1)
    
    svg.selectAll(".legend").remove()
    
    var legend = svg.selectAll('.legend')
      .data(legendArray)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = windowHeight/2.5;//height * legendArray.length / 2;
        var horz = windowWidth/2.5;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });
    
    

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', function(d, i) {return legendArray[i]})
      .style('stroke', function(d, i) {return legendArray[i]});


    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d, i) {return legendText(i, checked)})
      .style("font-size", Math.round(windowWidth/75));
}

function legendText(i, sel){

    var array = new Array();

    switch (sel) {
        case "Region":
            array = ["Bern Mittelland", "Biel Seeland", "Oberland", "Emmental-Oberargau", "Berner Jura"]
            break;
        case "Sprache":
            array = ["Deutsch", "Französisch", "Bilingual D/F"]
            break;
        case "Geschlecht":
            array = ["Männlich", "Weiblich"]
            break;
        case "Gymnasium":
            array = ["Alte Sprachen", "moderne Sprache", "Physik & Mathematik", "Biologie & Chemie", "Wirtschaft & Recht", "Philosophie, Pädagogik & Psychologie",
                     "Bildnerisches Gestalten", "Musik"]
            break;
        case "Berufsmatur":
            array = ["BM I: Technisch", "BM I: Gestalterisch", "BM I: Gewerblich", "BM I: Kaufmännisch", "BM II: Technisch", "BM II: Gestalterisch", "BM II: Gewerblich",
                     "BM II: Naturwissenschaftlich", "BM II: Gesundheitlich & Sozial", "BM II: Kaufmännisch"]
            break;
    }

    return array[i]
}
