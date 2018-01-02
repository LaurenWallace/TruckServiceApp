//Retrieves the data from rules.json
//Similar to how data from csv files are obtained
ruleJson = d3.json("rules.json", function(error, treeData) {
	
	//Initialize all needed variables
	var totalNodes = 0;
	var maxInfoLength = 0;
	
	//Vars needed for drap & drop functionality
	var selectedNode = null; 
	var draggedNode = null;
	
	//Vars for panning 
	var panSpeed = 200;
	var panBound = 20;  //Will pan based on location of mouse to node
	
	var incr = 0;
	var duration = 500;
	var root;
	
	//Determines the size of the diagram created
	var svgWidth = 750;
	var svgHeight = 750;
	
	//Creates a visualization great for denograms
	var tree = d3.layout.tree().size([svgHeight, svgWidth]);
	
	//Defines a diagonal projection for the nodes to use when dragged to new location
	var diagonal = d3.svg.diagonal()
						 .projection(function(d) {
							 return [d.y, d.x];
						 });
	
	//A recursive helper function to establish the value of a variable
	function visit(parentNode, visitFirstNode, childFirstNode) {
		if(!parentNode) {return;}
		
		visitFirstNode(parentNode);
		
		var children = childFirstNode(parentNode);
		
		if(children) {
			var count = children.length;
			
			for(var incr = 0; incr < count; incr++) {
				visit(children[incr], visitFirstNode, childFirstNode);
			}
		}
	}
	
	//Calls the visit function to establish maxInfoLength
	visit(treeData, function(d) {
		totalNodes++;
		maxInfoLength = Math.max(d.name.length, maxInfoLength);
	}, function(d) {
		return d.children && d.children.length > 0 ? d.children : null;
	});
	
	//Insert sorting code here if sorting is needed
	function sortTree() {
		tree.sort(function(a, b) {
			return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
		});
	}
	
	//Sorts the tree initially in case the JSON is not sorted
	sortTree();
	
	//Pan function
	function pan(pickedNode, direction) {
		var speed = panSpeed;
		
		if(panTimer) {
			clearTimeout(panTimer);
			translateCoords = d3.transform(svgGroup.attr("transform"));
			
			if(direction == 'left' || direction == 'right') {
				translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
				translateY = translateCoords.translate[1];
			}
			else if(direction == 'up' || direction == 'down') {
				translateX = translateCoords.translate[0];
				translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
			}
			
			scaleX = translateCoords.scale[0];
			scaleY = translateCoords.scale[1];
			scale = zoomListener.scale();
			svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
			d3.select(pickedNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
			zoomListener.scale(zoomListener.scale());
			zoomListener.translate([translateX, translateY]);
			panTimer = setTimeout(function() {
				pan(pickedNode, speed, direction);
			}, 50);
		}
	}
	
	//Defines the nodeZoom function for the tree
	function zoom() {
		svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
	
	//Defines the zoomListen that calls the zoom function on the zoom event constrained within the scaleExtents
	var zoomListener = d3.behavior.zoom().scaleExtent([0, 3]).on("zoom", zoom);
	
	function initiateDrag(d, pickedNode) {
		draggedNode = d;
		d3.select(pickedNode).select('.ghostCircle').attr('pointer-events', 'none');
		d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
		d3.select(pickedNode).attr('class', 'node activeDrag');
		
		//Selects the parent & figures out the path
		svgGroup.selectAll("g.node").sort(function(a, b) { 
			if(a.id != draggedNode.id) {
				return 1; //Returns 1 when a is not the hovered node, put a in the back
			}
			else {
				return -1; //Since a is the hovered element bring a to the front
			}
		});
		
		//Should the nodes have children, this will remove the links & nodes
		if(nodes.length > 1) {
			//Removes the link paths
			links = tree.links(nodes);
			nodePaths = svgGroup.selectAll("path.link")
								.data(links, function(d) {
									return d.target.id;
								}).remove();
			
			//Removes the child nodes
			nodesExit = svgGroup.selectAll("g.node")
								.data(nodes, function(d) {
									return d.id;
								}).filter(function(d, incr) {
									if(d.id == draggedNode.id) {
										return false;
									}
									return true;
								}).remove();
		}
		
		//Removes the parent link
		parentLink = tree.links(tree.nodes(draggedNode.parentNode));
		
		svgGroup.selectAll('path.link').filter(function(d, incr) {
			if(d.target.id == draggedNode.id) {
				return true;
			}
			return false;
		}).remove();
		
		dragStarted = null;
	}
	
	//Defines a base svg for a attaching a class 4 styling & the zoomListen
	var baseSvg = d3.select("#currentRules").append("svg")
													  .attr("width", svgWidth)
													  .attr("height", svgHeight)
													  .attr("class", "overlay")
													  .call(zoomListener);
	
	//Defines the drag listeners for the drag/drop behavior of nodes
	dragListener = d3.behavior.drag().on("dragstart", function(d) {
		if(d == root) {
			return;
		}
		
		/*
		 * Important to suppress the mouseover event on the node being
		 * dragged. If suppression of that event does not occur then the
		 * mouseover event will be absorbed and the underlying node will not 
		 * detect what we want it to do/not do
		 */
		dragStarted = true;
		nodes = tree.nodes(d);
		d3.event.sourceEvent.stopPropagation();
	}).on("drag", function(d) {
		if(d == root) {
			return;
		}
		if(dragStarted) {
			pickedNode = this;
			initiateDrag(d, pickedNode);
		}
		
		/*
		 * Gets the coordinates of the mouse event relative to the svg container
		 * to allow for panning
		 */
		relCoords = d3.mouse($('svg').get(0));
		
		if(relCoords[0] < panBound) {
			panTimer = true;
			pan(this, 'left');
		}
		else if(relCoords[0] > ($('svg'.width() - panBound))) {
			panTimer = true;
			pan(this, 'right');
		}
		else if(relCoords[1] < panBound) {
			panTimer = true;
			pan(this, 'up');
		}
		else if(relCoords[1] > ($('svg').height() - panBound)) {
			panTimer = true;
			pan(this, 'down');
		}
		else {
			try {
				clearTimeout(panTimer);
			} catch(e) {
				
			}
		}
		
		d.x0 += d3.event.dy;
		d.y0 += d3.event.dx;
		
		var node = d3.select(this);
		node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
		updateTempConnector();
	}).on("dragend", function(d) {
		if(d == root) {
			return;
		}
		
		pickedNode = this;
		
		if(selectedNode) {
			//This removes the element from the parent
			//inserting it into the new elements children
			var index = draggedNode.parentNode.children.indexOf(draggedNode);
			
			if(index > -1) {
				draggedNode.parentNode.children.splice(index, 1);
			}
			
			if(typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
				if(typeof selectedNode.children !== 'undefined') {
					selectedNode.children.push(draggedNode);
				} 
				else {
					selectedNode._children.push(draggedNode);
				}
			}
			else {
				selectedNode.children = [];
				selectedNode._children.push(draggedNode);
			}
			
			//The node being expanded must occur to allow the user to view the 
			//node has been correctly moved to its new location
			expand(selectedNode);
			//Add sort here if needed
			sortTree();
			endDrag();
		} else {
			endDrag();
		}
	});
	
	function endDrag() {
		selectedNode = null;
		d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
		d3.select(pickedNode).attr('class', 'node');
		
		//Need to restore the mouseover event otherwise, dragging nodes
		//will not work anymore
		d3.select(pickedNode).select('.ghostCircle').attr('pointer-events', '');
		updateTempConnector();
		
		if(draggedNode !== null) {
			updateRuleTree(root);
			centerNode(draggedNode);
			draggedNode = null;
		}
	}
	
	//Helper functions that collapse or expand nodes for easy visibility
	function collapse(d) {
		if(d.children) {
			d._children = d.children;
			d._children.forEach(collapse);
			d.children = null;
		}
	}
	
	function expand(d) {
		if(d._children) {
			d.children = d._children;
			d.children.forEach(expand);
			d._children = null;
		}
	}
	
	var overCircle = function(d) {
		selectedNode = d;
		updateTempConnector();
	};
	
	var outCircle = function(d) {
		selectedNode = null;
		updateTempConnector();
	};
	
	//Updates the temporary connector & indicates the dragging option
	var updateTempConnector = function() {
		var tempData = [];
		
		if(draggedNode !== null && selectedNode !== null) {
			//Need to flip coordinates since this was done for the existing connectors in the tree
			tempData = [{
				source: {
					x: selectedNode.y0,
					y: selectedNode.x0
				},
				target: {
					x: draggedNode.y0,
					y: draggedNode.x0
				}
			}];
		}
		
		var link = svgGroup.selectAll(".templink").data(tempData);
		
		link.enter().append("path")
			.attr("class", "templink")
			.attr("d", d3.svg.diagonal())
			.attr('pointer-events', 'none');
		
		link.attr("d", d3.svg.diagonal());
		
		link.exit().remove();
	};
	
	//Centers the node when clicked/dropped to prevent losing node 
	//when collapsing/moving with large amount of children
	function centerNode(source) {
		scale = zoomListener.scale();
		x = -source.y0;
		y = -source.x0;
		x = x * scale + svgWidth / 2;
		y = y * scale + svgHeight / 2;
		
		d3.select('g').transition().duration(duration)
		  	.attr("transform", "translate(" + x + "," + y +")scale(" + scale + ")");
		zoomListener.scale(scale);
		zoomListener.translate([x, y]);
	}
	
	//Toggles the children nodes
	function toggleChildren(d) {
		if(d.children) {
			d._children = d.children;
			d.children = null;
		}
		else if(d._children) {
			d.children = d._children;
			d._children = null;
		}
		return d;
	}
	
	//Toggles the children on click
	function click(d) {
		if(d3.event.defaultPrevented) {
			return; //Event click is suppressed
		}
		d = toggleChildren(d);
		updateRuleTree(d);
		centerNode(d);
	}
	
	/*
	 * Computes the new height, counts total children of root node
	 * and sets the tree height accordingly. This prevents the 
	 * layout from being squashed when new nodes are made visible
	 * or from looking sparse when nodes are removed. It provides
	 * a more consistent layout.
	 */
	function updateRuleTree(source) {
		var levelWidth = [1];
		var childCount = function(level, n) {
			if(n.children && n.children.length > 0) {
				if(levelWidth.length <= level + 1) {
					levelWidth.push(0);
				}
				
				levelWidth[level + 1] += n.children.length;
				n.children.forEach(function(d) {
					childCount(level + 1, d);
				});
			}
		};
		
		childCount(0, root);
		var newHeight = d3.max(levelWidth) * 25; //Makes it 25 px per line
		tree = tree.size([newHeight, svgWidth]);
		
		//Computes the new tree layout
		var nodes = tree.nodes(root).reverse(),
		    links = tree.links(nodes);
		
		//Sets the widths between levels based on maxInfoLength
		nodes.forEach(function(d) {
			/*
			 * The 10 in the below code is for px size therefore,
			 * maxInfoLength * 10px
			 * Alternatively one can set a fixed depth per level 
			 * to create a fixed scale. Normalize for fixed-depth 
			 * by commenting out the d.y = (d.depth * 500); line
			 */
			d.y = (10 * (maxInfoLength * 10)); //what is depth stand for
			//d.y = (d.depth * 500); //500px per level
		});
		
		//Updates the nodes
		node = svgGroup.selectAll("g.node")
			.data(nodes, function(d) {
				return d.id || (d.id = ++incr);
			});
		
		//Enters any new nodes at the parent's previous position
		var nodeEnter = node.enter().append("g")
			.call(dragListener)
			.attr("class", "node")
			.attr("transform", function(d) {
				return "translate(" + source.y + "," + source.x + ")";
			})
			.on('click', click);
		
		nodeEnter.append("circle")
			.attr('class', 'nodeCircle')
			.attr("r", 0)
			.style("fill", function(d) {
				return d._children ? "lightsteelblue" : "#fff";
			});
		
		nodeEnter.append("text").attr("x", function(d) {
			return d.children || d._children ? -10 : 10;
		})
		.attr("dy", ".35em")
		.attr('class', 'nodeText')
		.attr("text-anchor", function(d) {
			return d.children || d._children ? "end" : "start";
		})
		.text(function(d) {
			return d.name;
		})
		.style("fill-opactiy", 0);
		
		//Creates the phantom node during mouseover to have a 
		//radius appear around it
		nodeEnter.append("circle")
			.attr('class', 'ghostCircle')
			.attr("r", 30)
			//Change the opacity to 0 to hide target area
			.attr("opacity", 0.2)
		  .style("fill", "orange")
		  	.attr('pointer-events', 'mouseover')
		  	.on("mouseover", function(node) {
		  		overCircle(node);
		  	})
		  	.on("mouseout", function(node) {
		  		outCircle(node);
		  	});
		
		//Updates the text to reflect whether the node has children or not
		node.select('text')
			.attr("x", function(d) {
				return d.children || d._children ? -10 : 10;
			})
			.attr("text-anchor", function(d) {
				return d.children || d._children ? "end" : "start";
			})
			.text(function(d) {
				return d.name;
			});
		
		//Changes the circle fill depending on whether it has children & is collapsed
		node.select("circle.nodeCircle")
			.attr("r", 4.5)
			.style("fill", function(d) {
				return d._children ? "lightsteelblue" : "#fff";
			});
		
		//Transitions nodes to their new position
		var nodeUpdate = node.transition()
			.duration(duration)
			.attr("transform", function(d) {
				return "translate(" + d.y + "," + d.x + ")";
			});
		
		//Fade the text in
		nodeUpdate.select("text")
			.style("fill-opacity", 1);
		
		//Transitions existing nodes to the parent's new position
		var nodeExit = node.exit().transition()
			.duration(duration)
			.attr("transform", function(d) {
				return "translate(" + source.y + "," + source.x + ")";
			})
			.remove();
		
		nodeExit.select("circle")
			.attr("r", 0);
		
		nodeExit.select("text")
			.style("fill-opacity", 0);
		
		//Updates the links
		var link = svgGroup.selectAll("path.link")
			.data(links, function(d) {
				return d.target.id;
			});
		
		//Enters any new links at the parent's previous position
		link.enter().insert("path", "g")
			.attr("class", "link")
			.attr("d", function(d) {
				var o = {
					x: source.x0,
					y: source.y0
				};
				return diagonal({
					source: o,
					target: o
				});
			});
		
		//Transitions links to their new position
		link.transition()
			.duration(duration)
			.attr("d", diagonal);
		
		//Tansitions exiting nodes to the parent's new position
		link.exit().transition()
			.duration(duration)
			.attr("d", function(d) {
				var o = {
					x: source.x,
					y: source.y
				};
				return diagonal({
					source: o,
					target: o
				});
			})
			.remove();
		
		//Stashes the old positions for the transition
		nodes.forEach(function(d) {
			d.x0 = d.x;
			d.y0 = d.y;
		});
	}
	
	//Appends a group which holds all nodes & that the zoomListen
	//can act upon
	var svgGroup = baseSvg.append("g");
	
	//Defines the root
	root = treeData;
	root.x0 = svgHeight / 2;
	root.y0 = 0;
	
	//Lays out the tree initially & centers on the root node
	updateRuleTree(root);
	centerNode(root);
});