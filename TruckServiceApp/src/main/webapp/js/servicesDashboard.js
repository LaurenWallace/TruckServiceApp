//I used Pasha's block as an example to create my simple dashboards for 
//this site. The link to the block is here: http://bl.ocks.org/NPashaP/96447623ef4d342ee09b

var serData = [
	{State: 'AL', freq: {morning: 2564, afternoon: 1650, night: 300}},
	{State: 'AZ', freq: {morning: 1630, afternoon: 412, night: 547}},
	{State: 'CA', freq: {morning: 4604, afternoon: 548, night: 2006}},
	{State: 'CT', freq: {morning: 1000, afternoon: 3200, night: 1250}},
	{State: 'DE', freq: {morning: 800, afternoon: 1152, night: 1862}},
	{State: 'FL', freq: {morning: 4481, afternoon: 3304, night: 948}},
	{State: 'GA', freq: {morning: 1619, afternoon: 167, night: 1063}},
	{State: 'IA', freq: {morning: 1819, afternoon: 247, night: 1203}},
	{State: 'IL', freq: {morning: 1198, afternoon: 3852, night: 942}},
	{State: 'IN', freq: {morning: 797, afternoon: 1849, night: 1534}},
	{State: 'KS', freq: {morning: 162, afternoon: 379, night: 471}},
	{State: 'MD', freq: {morning: 3652, afternoon: 376, night: 2392}},
	{State: 'NJ', freq: {morning: 1248, afternoon: 500, night: 840}},
];

function dashboard(loc, serviceData) {
	
	//Sets the default bar color
	var barColor = 'steelblue';
	
	//Determines the color for each segment of data
	function segColor(c) {
		return {morning: "#e08214", afternoon: "#41ab5d", night: "#807dba"}[c];
	}

	//Computes the total for each state
	serviceData.forEach(function(d){d.total = d.freq.morning + d.freq.afternoon + d.freq.night;});
	
	//Creates the histogram based on data
	function histoGram(sD) {
		var hG = {}, hGDim = {t: 60, r: 0, b: 30, l: 0};
		hGDim.w = 500 - hGDim.l - hGDim.r,
		hGDim.h = 300 - hGDim.t - hGDim.b;
		
		//Creates the SVG for the histogram.
		//SVG - Scalable Vector Graphic
		var hGsvg = d3.select(loc).append("svg")
								  .attr("width", hGDim.w + hGDim.l + hGDim.r)
								  .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
								  .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");
		
		//Generates the x-axis mapping
		var xmap = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
							  .domain(sD.map(function(d){return d[0];}));
		
		//Adds the x-axis to the histogram svg
		hGsvg.append("g").attr("class", "x-axis")
						 .attr("transform", "translate(0," + hGDim.h + ")")
						 .call(d3.svg.axis().scale(xmap).orient("bottom"));
		
		//Generates the y-axis mapping
		var ymap = d3.scale.linear().range([hGDim.h, 0])
								   .domain([0, d3.max(sD, function(d){return d[1];})]);
		
		//Creates the bars for the histogram & labels
		var bars = hGsvg.selectAll(".bar").data(sD).enter()
										  .append("g").attr("class", "bar");
		
		//Creates the rectangle bars for the data
		bars.append("rect")
			.attr("x", function(d){return xmap(d[0]);})
			.attr("y", function(d){return ymap(d[1]);})
			.attr("width", xmap.rangeBand())
			.attr("height", function(d){return hGDim.h - ymap(d[1]);})
			.attr('fill', barColor)
			.on("mouseover", updateCharts) //updateCharts is defined on line 
			.on("mouseout", resetCharts);  //resetCharts is defined on line
			
		//Creates the labels above the rectangles
		bars.append("text").text(function(d){return d3.format(",")(d[1])})
			.attr("x", function(d) {return xmap(d[0]) + xmap.rangeBand() / 2;})
			.attr("y", function(d) {return ymap(d[1]) - 5;})
			.attr("text-anchor", "middle");
		
		//Updates the charts based on which state is picked
		function updateCharts(d) {
			
			//Filter for the selected state
			var selected = serviceData.filter(function(s){return s.State == d[0];})[0],
				newData  = d3.keys(selected.freq).map(function(s){return {type: s, freq: selected.freq[s]};});
			
			//Calls update functions of pie chart and legend
			pC.update(newData);
			leg.update(newData);
		}
		
		//Resets the charts after nothing is selected
		function resetCharts(d) {
			
			pC.update(totalData);
			leg.update(totalData);
		}
		
		//Updates the bars of the histogram based on pie chart selection
		hG.update = function(newData, color) {
			
			//Updates the domain of the y-axis map to reflect the change in frequencies
			ymap.domain([0, d3.max(newData, function(d){return d[1];})]);
			
			//Attaches the new data to the bars
			var bars = hGsvg.selectAll(".bar").data(newData);
			
			//Transitions the height and color of the rectangles
			bars.select("rect").transition().duration(500)
				.attr("y", function(d){return ymap(d[1]);})
				.attr("height", function(d){return hGDim.h - ymap(d[1]);})
				.attr("fill", color);
			
			//Transitions the frequency labels location & change value
			bars.select("text").transition().duration(500)
				.text(function(d){return d3.format(",")(d[1])})
				.attr("y", function(d){return ymap(d[1]) - 5;});
		}
		return hG;
	}
	
	//Creates the pie chart
	function pieChart(pieData) {
		
		var pC = {}, pieDim = {w: 250, h: 250};
			pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
			
		//Creates the svg for the pie chart
		var pieSvg = d3.select(loc).append("svg")
					   .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
					   .attr("transform", "translate(" + pieDim.w / 2 + "," + pieDim.h / 2 + ")");
		
		//Draws the arcs of the pie slices
		var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);
		
		//Computes the pie slice angles
		var pie = d3.layout.pie().sort(null).value(function(d){return d.freq;});
		
		//Draw the pie slices
		pieSvg.selectAll("path").data(pie(pieData)).enter().append("path").attr("d", arc)
			  .each(function(d){this._current = d;})
			  .style("fill", function(d){return segColor(d.data.type);})
			  .on("mouseover", updateCharts).on("mouseout", resetCharts);
		
		//Updates the pie chart based on mouseover event of histogram
		pC.update = function(newData) {
			pieSvg.selectAll("path").data(pie(newData)).transition().duration(500)
				  .attrTween("d", arcTween);
		}
		
		//Updates the histogram chart based on mouseover event on pie chart
		function updateCharts(d) {
			
			//Calls the update function of histogram with new data
			hG.update(serviceData.map(function(v) {
				return [v.State, v.freq[d.data.type]];}), segColor(d.data.type));
		}
		
		//Resets the histogram with all the cumulative data
		function resetCharts(d) {
			
			//Calls the update function of histogram with all data
			hG.update(serviceData.map(function(v){
				return [v.State, v.total];
			}), barColor);
		}
		
		//Animates the pie slices to change based on histogram selection
		//Requires a custom function to determine how the intermediate paths 
		//should be drawn
		function arcTween(a) {
			var i = d3.interpolate(this._current, a);
			this._current = i(0);
			return function(t){return arc(i(t));};
		}
		return pC;
	}
	
	//Creates and handles the legend
	function legend(legendData) {
		
		var leg = {};
		
		//Creates the table for the legend
		var legend = d3.select(loc).append("table").attr('class', 'legend');
		
		var title = legend.append("thead").append("tr").select("th").data("Legend").enter();
		
		//Creates one row per segment
		var tr = legend.append("tbody").selectAll("tr").data(legendData).enter().append("tr");
		
		//Creates the first column for each segment
		tr.append("td").append("svg").attr("width", '16')
									 .attr("height", '16')
									 .append("rect")
									 .attr("width", '16')
									 .attr("height", '16')
									 .attr("fill", function(d){return segColor(d.type);});
		
		//Creates the second column for each segment
		tr.append("td").text(function(d){return d.type;});
		
		//Creates the third column for each segment
		tr.append("td").attr("class", 'legendFreq').text(function(d){return getLegend(d, legendData);});
		
		//Updates the legend
		leg.update = function(newData) {
			
			//Updates the data attached to the row elements
			var l = legend.select("tbody").selectAll("tr").data(newData);
			
			//Updates the frequencies
			l.select(".legendFreq").text(function(d){return d3.format(",")(d.freq);});
			
			//Updates the percentage column of the table
			l.select(".legendPerc").text(function(d){return getLegend(d, newData);});
		}
			
		//Computes the percentage for each segment
		function getLegend(d, aD) {
			return d3.format("%")(d.freq / d3.sum(aD.map(function(v){return v.freq;})));
		}
			
		return leg;
	}
		
	//Calculates the total frequency by segment for all states
	var totalData = ['morning', 'afternoon', 'night'].map(function(d) {
		return {type: d, freq: d3.sum(serviceData.map(function(t){return t.freq[d];}))};
	});
		
	//Calculates the total values by state for all segments
	var sTotal = serviceData.map(function(d){return [d.State, d.total];});
		
	var hG = histoGram(sTotal),   //Creates the histogram
		pC = pieChart(totalData), //Creates the pie chart
		leg = legend(totalData);  //Creates the legend

	d3.select(loc).on("zoom", null);
	
	//To add sortable functionality to this dashboard
	d3.select("select").on("change", sortServiceDash);
	
	var sortTimeout = setTimeout(function() {
		d3.select("select").property("checked", true).each(sortServiceDash);
	}, 2000);
	
	function sortServiceDash() {
		
		clearTimeout(sortTimeout);
		
		//Copy-on-write since tweens are evaluated after a delay.
		var xchange = x.domain(serviceData.sort(this.checked
				? function(fstat, sstat) {return sstat.freq - fstat.freq;}
				: function(fstat, sstat) {return d3.ascending(fstat.State, sstat.State);})
				.map(function(d) {return d.State;}))
				.copy();
		
		hGsvg.selectAll(".bar").sort(function(fstat, sstat) {return xchange(fstat.State) - xchange(sstat.State);});
		
		var transition = hGsvg.transition().duration(750),
			delay = function(d, amt) {return amt * 50;};
			
		transition.selectAll(".bar")
			.delay(delay)
			.attr("x", function(d) {return xchange(d.State);});
		
		transition.select(".x.axis").selectAll("g").delay(delay);
	}
}

dashboard('#currentServiceRequests', serData);