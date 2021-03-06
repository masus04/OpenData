d3.csv("BarChartData.csv", function(error, data) {
    
    
    
//    var resize = function () {
//        windowWidth = window.innerWidth,
//            windowWidth = windowWidth/1.2;
//        
//        window.innerHeight < windowWidth/1.5 ? windowHeight = windowWidth/1.5 : window.innerHeight;
//            
//        
//        //help variables and functions (scaling etc.)
//        margin = {top: 100, right: 20, bottom: 200, left: 60},
//            width = windowWidth - margin.left - margin.right,
//            height = windowHeight - margin.top - margin.bottom;
//        
//        x0 = d3.scale.ordinal()
//            .rangeRoundBands([0, width], .1);
//
//        x1 = d3.scale.ordinal();
//
//        y = d3.scale.linear()
//            .range([height, 0]);
//
//        color = d3.scale.ordinal()
//            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
//
//        xAxis = d3.svg.axis()
//            .scale(x0)
//            .orient("bottom");
//
//        yAxis = d3.svg.axis()
//            .scale(y)
//            .orient("left")
//            .tickFormat(d3.format(".2s"));
//        
//        d3.select("svg").attr("width", width + margin.left + margin.right)
//            .attr("height", height + margin.top + margin.bottom)
//            .select("g")
//            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//        
//        render('Träger', 'Total');
//    }
//    
//    d3.select(window).on('resize', resize); 
    
    var windowWidth = window.innerWidth,
        windowWidth = windowWidth*0.75,
        windowHeight = windowWidth*0.64;
    
    
    //help variables and functions (scaling etc.)
    var margin = {top: 75, right: 20, bottom: windowWidth/100, left: 80},
        width = windowWidth - margin.left - margin.right,
        height = windowHeight - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#ff8c00", "#d0743c", "#a05d56", "#6b486b", "#7b6888", "#8a89a6", "#98abc5"]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));
    
    if(window.innerWidth < 700){
        svgWidth = '90%';
    }else{
        svgWidth = '79%';
    }
    
    var svg = d3.select("body").select("svg")
        .attr("width", svgWidth)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    //Helper function to darken/lighten colors (used in hover over a bar)
    var shadeColor = function(color, percent) {
        var f = color.split(","),
            t = percent < 0 ? 0 : 255,
            p = percent < 0 ? percent * -1 : percent,
            R = parseInt(f[0].slice(4)), 
            G = parseInt(f[1]),
            B = parseInt(f[2]);
        return "rgb(" + (Math.round((t-R)*p)+R) + "," + (Math.round((t-G)*p)+G) + "," + (Math.round((t-B)*p)+B)+")";
    }
      
    //function to render the whole diagramm
    var render = function(selected, subSelected, detail){
        
        //method to get names of groupings of selected attribute
        var getGroupNames = function (attribute) {
            var groupNames = [];
            if(attribute == "Geschlecht"){
                groupNames.push("Männer");   
                groupNames.push("Frauen");   
            }else if(attribute == "Total"){
                groupNames.push("Total");
            }else{
                data.forEach(function(d){
                    groupNames.push(d[attribute]);   
                });
                groupNames = $.unique(groupNames);
            }
            return groupNames;
        }
        
        var groupNames = getGroupNames(selected);
        var subGroupNames = getGroupNames(subSelected);
        
        //create data object, special cases: total, Anzahl_Frauen, Anzahl_Männer
        var data_object = [];
        
        if(subSelected == "Geschlecht"){
            groupNames.forEach(function(groupName){
                var count_m = 0;
                var count_f = 0;
                data.filter(function(d){ return d[selected] == groupName }).forEach(function(obj){
                    count_m = +count_m + +obj.Anzahl_Männer;   
                    count_f = +count_f + +obj.Anzahl_Frauen;
                })
                data_object.push({ key: groupName, 
                                  count: [{ name: "Männer", value: +count_m, group: groupName }, 
                                          { name: "Frauen", value: +count_f, group: groupName }]});
            });
        }else if(subSelected == "Total"){
            groupNames.forEach(function(groupName){
                var count = 0;
                data.filter(function(d){ return d[selected] == groupName }).forEach(function(obj){
                    count = +count + +obj.Anzahl_Total;  
                })
                data_object.push({ key: groupName, 
                                  count: [{ name: "Total", value: +count, group: groupName }]});
            });
        }else{
            groupNames.forEach(function(groupName){
                var subGroupData = [];
                subGroupNames.forEach(function(subGroupName) {
                   subGroupData[subGroupName] = 0; 
                });
                data.filter(function(d) { return d[selected] == groupName }).forEach(function(d){
                    subGroupData[d[subSelected]] = subGroupData[d[subSelected]] + +d.Anzahl_Total;
                });
                var subGroupArray = [];
                subGroupNames.forEach(function(subGroup) { 
                    subGroupArray.push({name: subGroup, 
                                        value: subGroupData[subGroup], 
                                        group: groupName });
                });
                data_object.push({ key: groupName, 
                                  count: subGroupArray });
            });
        }
            
        //set domains for each axis
        x0.domain(data_object.map(function(d) { return d.key; }));
        x1.domain(subGroupNames).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(data_object, function(d) { return d3.max( d.count, function(d)  { return d.value; }); })]);
        
        //(re)create x axis
        svg.select("g.x.axis").attr("transform", "translate(0," + height + ")").call(xAxis);
        
        //(re)create y axis
        svg.select("g.y.axis").call(yAxis);

        svgHeight = height + margin.bottom + margin.top;

        // display text vertical if Bildungsart is selected, because there are a lot of values
        if(selected == "Bildungsart" || windowWidth < 780){
            svg.select("g")
            .attr("class", "x axis")
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-45)" );
            
            d3.select("svg").style("height", svgHeight*1.35);
        }else{
            d3.select("svg").style("height", svgHeight);   
        }
        
        //clear all bars before creating new ones
        svg.selectAll(".bars").remove();
        
        //ToolTip
        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            var bardata = {};
            bardata[selected] = d.group;
            bardata[subSelected] = d.name;
            bardata['Anz. Absolventen'] = d.value;

            var html = '';

            for(var k in bardata) {
                html += '<li><strong>'+k+'</strong> : '+bardata[k]+'</li>';
            }
            return html;
          });
        
        svg.call(tip);

        //Create bars
        var bars = svg.selectAll(".bars")
            .data(data_object)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; });

        bars.selectAll("rect")
            .data(function(d) { return d.count; })
            .enter().append("rect")
            .attr("class", "bars")
            .attr("width", x1.rangeBand())
            .attr("x", function(d) { return x1(d.name); })
            .attr("y", function(d) { return y(0); })
            .style("fill", function(d) { return color(d.name); })
            .attr("height", 0)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .transition()
            .attr("height", function(d) { return height - y(d.value); })
            .attr("y", function(d) { return y(d.value) })
            .duration(800);
                    
        //build the legend in the top right corner
        svg.selectAll(".legend").remove();      //clear legend first
        var legend = svg.selectAll(".legend")
            .data(subGroupNames.slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        
        legend.append("rect")
            .attr("y", -48)
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", -39)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
        
    };
    
    //keys for the selector
    var keys = d3.keys(data[0]);
        keys = keys.filter(function(k){
            return (k !== "Anzahl_Total"
                    && k !== "Anzahl_Frauen"
                    && k !== "Anzahl_Männer"
                    && k !== "Jahr" );   
    });
    //Additional keys for subselector
    subKeys = keys.slice(0).filter(function(d){ return d != "Bildungsart"; });
    subKeys.push("Geschlecht");
    subKeys.push("Total");
    
    
    //method to create subselector
    var createSubSelector = function(selected) {

        var subselector = d3.select('#subSelector')
                            .selectAll('span')
                            .data(subKeys.filter(function(d) { 
                                return (d !== selected && !(d == "Typ" && selected == "Bildungsart") )
                            }))
                            .enter()
                            .append('div');
        
        subselector.append('input')
            .attr({
                type: "radio",
                name: "subSelection",
                id: function(d) { return (d + " sub") }})
            .on('click', function (subSelected) { render(selected, subSelected) });


        subselector.append('label')
            .attr('for', function(d){return (d + " sub")})
            .text(function(d){return d});
        
        //Total is checked by default
        radiobtn_total = document.getElementById("Total sub");
        radiobtn_total.checked = true;
    }
    
    //create selector
    var selector = d3.select('#selector').selectAll('span').data(keys).enter()
        .append('div');    
    
    selector.append('input')
        .attr({
            type: "radio",
            name: "selection",
            id: function(d) { return d }})
        .on('click', function (selected) {        
                        d3.select('#subSelector').selectAll('div').remove();
                        createSubSelector(selected); 
                        render(selected, "Total"); 
            });
    
    selector.append('label')
        .attr('for', function(d){return d})
        .text(function(d){return d});
    
    

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);    


    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Absolventen");


    createSubSelector("Verwaltungsregion");
    render("Verwaltungsregion", "Total");
    radiobtn_vwlt = document.getElementById("Verwaltungsregion");
    radiobtn_vwlt.checked = true;
  

});