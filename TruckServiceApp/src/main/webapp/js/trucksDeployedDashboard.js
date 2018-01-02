//I used Pasha's block as an example to create my simple dashboards for 
//this site. The link to the block is here: http://bl.ocks.org/NPashaP/96447623ef4d342ee09b

var truckData = [
	{State: 'AL', statTotals: {green: 1354, yellow: 1264, red: 1896}},
	{State: 'AZ', statTotals: {green: 1295, yellow: 259, red: 1035}},
	{State: 'CA', statTotals: {green: 2147, yellow: 3579, red: 1432}},
	{State: 'CT', statTotals: {green: 1090, yellow: 3270, red: 1090}},
	{State: 'DE', statTotals: {green: 1525, yellow: 420, red: 1869}},
	{State: 'FL', statTotals: {green: 4112, yellow: 2430, red: 2191}},
	{State: 'GA', statTotals: {green: 570, yellow: 855, red: 1424}},
	{State: 'IA', statTotals: {green: 980, yellow: 981, red: 1308}},
	{State: 'IL', statTotals: {green: 2397, yellow: 1200, red: 2395}},
	{State: 'IN', statTotals: {green: 2090, yellow: 1254, red: 836}},
	{State: 'KS', statTotals: {green: 608, yellow: 202, red: 202}},
	{State: 'MD', statTotals: {green: 642, yellow: 3852, red: 1926}},
	{State: 'NJ', statTotals: {green: 1035, yellow: 1042, red: 511}},
];

function truckDashboard(id, tData){
    var barsColor = 'steelblue';
    function segColors(sc){ return {green:"#66ff66", yellow:"#ffff4d", red:"ff3333"}[sc]; }
    
    //Computes the combined status totals for each state
    tData.forEach(function(td){td.total = td.statTotals.green + td.statTotals.yellow +td.statTotals.red;});
    
    //Creates the trucks deployed for services by State histogram
    function truckHistogram(tD){
        var thG={},    thGDim = {top: 60, right: 0, bottom: 30, left: 0};
        thGDim.wid = 500 - thGDim.left - thGDim.right, 
        thGDim.hei = 300 - thGDim.top - thGDim.bottom;
            
        //create svg for histogram.
        var thGsvg = d3.select(id).append("svg")
            .attr("width", thGDim.wid + thGDim.left + thGDim.right)
            .attr("height", thGDim.hei + thGDim.top + thGDim.bottom).append("g")
            .attr("transform", "translate(" + thGDim.left + "," + thGDim.top + ")");

        // create function for x-axis mapping.
        var xMap = d3.scale.ordinal().rangeRoundBands([0, thGDim.wid], 0.1)
                .domain(tD.map(function(td) { return td[0]; }));

        // Add x-axis to the histogram svg.
        thGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + thGDim.hei + ")")
            .call(d3.svg.axis().scale(xMap).orient("bottom"));

        // Create function for y-axis map.
        var yMap = d3.scale.linear().range([thGDim.hei, 0])
                .domain([0, d3.max(tD, function(td) { return td[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var tbars = thGsvg.selectAll(".bar").data(tD).enter()
                .append("g").attr("class", "bar");
        
        //create the rectangles.
        tbars.append("rect")
            .attr("x", function(td) { return xMap(td[0]); })
            .attr("y", function(td) { return yMap(td[1]); })
            .attr("width", xMap.rangeBand())
            .attr("height", function(td) { return thGDim.hei - yMap(td[1]); })
            .attr('fill', barsColor)
            .on("mouseover", updateTCharts)// mouseover is defined below.
            .on("mouseout", resetTCharts);// mouseout is defined below.
            
        //Create the frequency labels above the rectangles.
        tbars.append("text").text(function(td){ return d3.format(",")(td[1])})
            .attr("x", function(td) { return xMap(td[0]) + xMap.rangeBand() / 2; })
            .attr("y", function(td) { return yMap(td[1]) - 5; })
            .attr("text-anchor", "middle");
        
        function updateTCharts(td){  // utility function to be called on mouseover.
            // filter for selected state.
            var tst = tData.filter(function(sf){ return sf.State == td[0];})[0],
                tnD = d3.keys(tst.freq).map(function(sf){ return {type:sf, statTotals:tst.statTotals[sf]};});
               
            // call update functions of pie-chart and legend.    
            tpC.updateT(tnD);
            tleg.updateT(tnD);
        }
        
        function resetTCharts(td){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            tpC.updateT(ttF);
            tleg.updateT(ttF);
        }
        
        // create function to update the bars. This will be used by pie-chart.
        thG.updateT = function(tnD, tcolor){
            // update the domain of the y-axis map to reflect change in frequencies.
            yMap.domain([0, d3.max(tnD, function(td) { return td[1]; })]);
            
            // Attach the new data to the bars.
            var tbars = thGsvg.selectAll(".bar").data(tnD);
            
            // transition the height and color of rectangles.
            tbars.select("rect").transition().duration(500)
                .attr("y", function(td) {return yMap(td[1]); })
                .attr("height", function(td) { return thGDim.hei - yMap(td[1]); })
                .attr("fill", tcolor);

            // transition the frequency labels location and change value.
            tbars.select("text").transition().duration(500)
                .text(function(td){ return d3.format(",")(td[1])})
                .attr("y", function(td) {return yMap(td[1]) - 5; });            
        }        
        return thG;
    }
    
    // function to handle pieChart.
    function tpieChart(tpD){
        var tpC ={},    tpieDim ={tw:250, th: 250};
        tpieDim.tr = Math.min(tpieDim.tw, tpieDim.th) / 2;
                
        // create svg for pie chart.
        var tpiesvg = d3.select(id).append("svg")
            .attr("width", tpieDim.tw).attr("height", tpieDim.th).append("g")
            .attr("transform", "translate(" + tpieDim.tw / 2 + "," + tpieDim.th / 2 + ")");
        
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(tpieDim.tr - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(td) { return td.statTotals; });

        // Draw the pie slices.
        tpiesvg.selectAll("path").data(pie(tpD)).enter().append("path").attr("d", arc)
            .each(function(td) { this._current = td; })
            .style("fill", function(td) { return segColors(td.data.type); })
            .on("mouseover", updateTCharts).on("mouseout", resetTCharts);

        // create function to update pie-chart. This will be used by histogram.
        tpC.updateT = function(tnD){
            tpiesvg.selectAll("path").data(pie(tnD)).transition().duration(500)
                .attrTween("d", tarcTween);
        }        
        
        // Utility function to be called on mouseover a pie slice.
        function updateTCharts(td){
            // call the update function of histogram with new data.
            thG.updateT(tData.map(function(tv){ 
                return [tv.State, tv.statTotals[td.data.type]];}), segColors(td.data.type));
        }
        
        //Utility function to be called on mouseout a pie slice.
        function resetTCharts(td){
            // call the update function of histogram with all data.
            thG.updateT(tData.map(function(tv){
                return [tv.State, tv.total];}), barsColor);
        }
        
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function tarcTween(ta) {
            var ti = d3.interpolate(this._current, ta);
            this._current = ti(0);
            return function(tt) { return arc(ti(tt));    };
        }    
        return tpC;
    }
    
    // function to handle legend.
    function tlegend(tlD){
        var tleg = {};
            
        // create table for legend.
        var tlegend = d3.select(id).append("table").attr('class','legend');
        
        // create one row per segment.
        var ttr = tlegend.append("tbody").selectAll("tr").data(tlD).enter().append("tr");
            
        // create the first column for each segment.
        ttr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
			.attr("fill",function(td){ return segColors(td.type); });
            
        // create the second column for each segment.
        ttr.append("td").text(function(td){ return td.type;});

        // create the third column for each segment.
        ttr.append("td").attr("class",'legendFreq')
            .text(function(td){ return d3.format(",")(td.statTotals);});

        // create the fourth column for each segment.
        ttr.append("td").attr("class",'legendPerc')
            .text(function(td){ return getTLegend(td, tlD);});

        // Utility function to be used to update the legend.
        tleg.updateT = function(tnD){
            // update the data attached to the row elements.
            var tl = legend.select("tbody").selectAll("tr").data(tnD);

            // update the frequencies.
            tl.select(".legendFreq").text(function(td){ return d3.format(",")(td.statTotals);});

            // update the percentage column.
            tl.select(".legendPerc").text(function(td){ return getTLegend(td, tnD);});        
        }
        
        function getTLegend(td, taD){ // Utility function to compute percentage.
            return d3.format("%")(td.statTotals / d3.sum(taD.map(function(tv){ return tv.statTotals; })));
        }

        return tleg;
    }
    
    // calculate total frequency by segment for all state.
    var ttF = ['green','yellow','red'].map(function(td){ 
        return {type:td, statTotals: d3.sum(tData.map(function(tt){ return tt.statTotals[td];}))}; 
    });    
    
    // calculate total frequency by state for all segment.
    var tsF = tData.map(function(td){return [td.State, td.total];});

    var thG = truckHistogram(tsF), // create the histogram.
        tpC = tpieChart(ttF), // create the pie-chart.
        tleg= tlegend(ttF);  // create the legend.
}

truckDashboard('#trucksCurrentDispatch', truckData);
