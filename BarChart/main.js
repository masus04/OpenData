d3.csv("VisualisierungsDaten.csv", function(error, data) {
    
    var keys = d3.keys(data[0]);
    keys = keys.filter(function(k){
        return (k !== "Anzahl_Total"
                && k !== "Anzahl_Frauen"
                && k !== "Anzahl_Männer");   
    });
    keys.push("Männer/Frauen");
    
    //create selector
    var newSpan = d3.select('#selector').selectAll('span').data(keys).enter()
        .append('div');
    
            var margin = {top: 20, right: 20, bottom: 30, left: 60},
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

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
        

    
    //TODO: necessary?
    var groupNames = [];
    var subgroups = [];
    
    newSpan.append('input')
        .attr({
            type: "radio",
            name: "selection",
            id: function(d) { return d }})
        .on('click', function(selected){
            groupNames = [];
            if(selected == "Männer/Frauen"){
                groupNames.push("Anzahl_Männer");   
                groupNames.push("Anzahl_Frauen");   
            }else{
                data.forEach(function(a){
                    if(groupNames.indexOf(a[selected])){
                        groupNames.push(a[selected]);   
                    }
                });
                groupNames = $.unique(groupNames);
            }
            console.log('groupnames', groupNames);
        
        data_object = [];
        groupNames.forEach(function(groupName){
            var count_m = 0;
            var count_f = 0;
            data.filter(function(d){ return d[selected] == groupName }).forEach(function(obj){
                count_m = +count_m + +obj.Anzahl_Männer;   
                count_f = +count_f + +obj.Anzahl_Frauen;   
            })
//            console.log('count', count);
            data_object.push({ key: groupName,
                            count: [{ name: "Anzahl Männer",
                                            value: +count_m },
                                    { name: "Anzahl Frauen",
                                            value: +count_f }]
                        });
        });
        console.log('groups', data_object);


        x0.domain(data_object.map(function(d) { return d.key; }));
        x1.domain(["Anzahl Männer", "Anzahl Frauen"]).rangeRoundBands([0, x0.rangeBand()]);
        y.domain([0, d3.max(data_object, function(d) { return d3.max( d.count, function(d)  { return d.value; }); })]);
        
        svg.select("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        
        svg.selectAll("rect").remove();
        
//        svg.selectAll("bar")
//            .data(data_object)
//            .enter().append("rect")
//            .style("fill", "steelblue")
//            .attr("x", function(d) { return x0(d.key); })
//            .attr("width", x0.rangeBand())
//            .attr("y", function(d) { return y(d.total); })
//            .attr("height", function(d) { return height - y(d.total); });

        var key = svg.selectAll(".key")
            .data(data_object)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; });
        
        console.log('obj', data_object);
        
        console.log('männer', x1("Anzahl_Männer"));
        console.log('frauen', x1("Anzahl_Frauen"));

        key.selectAll("rect")
            .data(function(d) { return d.count; })
            .enter().append("rect")
            .attr("width", x1.rangeBand())
            .attr("x", function(d) { return x1(d.name); })
            .attr("y", function(d) { return y(d.value); })
            .attr("height", function(d) { return height - y(d.value); })
            .style("fill", function(d) { return color(d.name); });

//        var legend = svg.selectAll(".legend")
//            .data(ageNames.slice().reverse())
//            .enter().append("g")
//            .attr("class", "legend")
//            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
//        
//        legend.append("rect")
//            .attr("x", width - 18)
//            .attr("width", 18)
//            .attr("height", 18)
//            .style("fill", color);
//
//        legend.append("text")
//            .attr("x", width - 24)
//            .attr("y", 9)
//            .attr("dy", ".35em")
//            .style("text-anchor", "end")
//            .text(function(d) { return d; });
        
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
    
//    newSpan.select("Jahr");

    console.log('keys', keys);
    

    
    console.log('data', data);
//    console.log('groups', groups);

//  data.forEach(function(d) {
//    d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
//  });
//
  
});
//})