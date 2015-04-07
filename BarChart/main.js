d3.csv("VisualisierungsDaten.csv", function(error, data) {
    
    var keys = d3.keys(data[0]);
    keys = keys.filter(function(k){
        return (k !== "Anzahl_Total"
                && k !== "Anzahl_Frauen"
                && k !== "Anzahl_Männer"
                && k !== "Jahr" );   
    });
    
    //create selector
    var newSpan = d3.select('#selector').selectAll('span').data(keys).enter()
        .append('div');    
    
    //help variables and functions (scaling etc.)
    var margin = {top: 50, right: 20, bottom: 1500, left: 60},
        width = 1200 - margin.left - margin.right,
        height = 2000 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));
    
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    //function to render the whole diagramm
    var render = function(selected, subSelected){
        
        //get groupings of selected attribute
        var getGroupNames = function (attribute) {
            var groupNames = [];
            if(attribute == "Männer/Frauen"){
                groupNames.push("Anzahl Männer");   
                groupNames.push("Anzahl Frauen");   
            }else if(attribute == "Total"){
                groupNames.push("Anzahl Total");
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
        
        if(subSelected == "Männer/Frauen"){
            groupNames.forEach(function(groupName){
                var count_m = 0;
                var count_f = 0;
                data.filter(function(d){ return d[selected] == groupName }).forEach(function(obj){
                    count_m = +count_m + +obj.Anzahl_Männer;   
                    count_f = +count_f + +obj.Anzahl_Frauen;   
                })

                data_object.push({ key: groupName,
                                count: [{ name: "Anzahl Männer",
                                                value: +count_m },
                                        { name: "Anzahl Frauen",
                                                value: +count_f }]
                            });
            });
        }else if(subSelected == "Total"){
            groupNames.forEach(function(groupName){
                var count = 0;
                data.filter(function(d){ return d[selected] == groupName }).forEach(function(obj){
                    count = +count + +obj.Anzahl_Total;  
                })

                data_object.push({ key: groupName,
                                count: [{ name: "Anzahl Total",
                                                value: +count }]
                            });
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
                console.log('sgd', subGroupData);

                var subGroupArray = [];
                subGroupNames.forEach(function(subGroup) { 
                    console.log("subgroup", subGroup);

                    subGroupArray.push({name: subGroup, value: subGroupData[subGroup] });
                });
                console.log("subgrouparray", subGroupArray);
               data_object.push({ key: groupName,
                                count: subGroupArray
                                })
            });
        }
            console.log('data_obj', data_object);
//        //create data_object
//        groupNames.forEach(function(groupName){
//            var count_m = 0;
//            var count_f = 0;
//            data.filter(function(d){ return d[selected] == groupName }).forEach(function(obj){
//                count_m = +count_m + +obj.Anzahl_Männer;   
//                count_f = +count_f + +obj.Anzahl_Frauen;   
//            })
//            data_object.push({ key: groupName,
//                            count: [{ name: "Anzahl Männer",
//                                            value: +count_m },
//                                    { name: "Anzahl Frauen",
//                                            value: +count_f }]
//                        });
//        });
//        console.log('groups', data);


        x0.domain(data_object.map(function(d) { return d.key; }));
        x1.domain(subGroupNames).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(data_object, function(d) { return d3.max( d.count, function(d)  { return d.value; }); })]);
        
        svg.select("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        
        svg.select("g.y.axis").call(yAxis);

        if(selected == "Bildungsart"){
            svg.select("g")
            .attr("class", "x axis")
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-90)" );
        }
        
        
        svg.selectAll(".bars").remove();

        var key = svg.selectAll(".key")
            .data(data_object)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; });

        key.selectAll("rect")
            .data(function(d) { return d.count; })
            .enter().append("rect")
            .attr("class", "bars")
            .attr("width", x1.rangeBand())
            .attr("x", function(d) { return x1(d.name); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .style("fill", function(d) { return color(d.name); });
        
        svg.selectAll(".legend").remove();

        var legend = svg.selectAll(".legend")
            .data(subGroupNames.slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
        
        legend.append("rect")
            .attr("y", -18)
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", -9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });
        
    };
    
    keys.push("Männer/Frauen");
    keys.push("Total");
    var createSubSelector = function(selected) {
            //create sub selector
        var newSubSpan = d3.select('#subSelector').selectAll('span').data(keys.filter(function(d) { return d !== selected } )).enter()
            .append('div');
        
        newSubSpan.append('input')
            .attr({
                type: "radio",
                name: "subSelection",
                id: function(d) { return d }})
            .on('click', function (subSelected) { render(selected, subSelected) });


        newSubSpan.append('label')
            .attr('for', function(d){return d})
            .text(function(d){return d});
    }
    
    newSpan.append('input')
        .attr({
            type: "radio",
            name: "selection",
            id: function(d) { return d }})
        .on('click', function (selected) {        
                        d3.select('#subSelector').selectAll('div').remove();
                        createSubSelector(selected); 
                        render(selected, "Total"); 
            });
    
    

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

    newSpan.append('label')
        .attr('for', function(d){return d})
        .text(function(d){return d});

    createSubSelector("Verwaltungsregion");
    render("Verwaltungsregion", "Total");
    radiobtn_vwlt = document.getElementById("Verwaltungsregion");
    radiobtn_vwlt.checked = true;
    radiobtn_total = document.getElementById("Total");
    radiobtn_total.checked = true;
  
});