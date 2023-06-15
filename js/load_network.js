var node_list = []

function linkStroke_mapper(link){
    if (node_list[link.target].label === "bugfix")  return "var(--bug)";

    if (node_list[link.target].label === "important")  return "marron";

    return "#999";
}

function node_redius_mapper(d){
    let mult = 1
    nodeRadius = 10
    if(node_list[d.index].type == 'issue')
        mult = 2;
    else if(node_list[d.index].type == 'commit')
        mult = 1.25

    return mult * nodeRadius;
}

function load_network(selected_issue_json, selected_issue) {
    clearDiv()
    node_list = selected_issue_json.nodes
    chart = ForceGraph(selected_issue_json, {
        nodeId: d => d.id,
        nodeGroup: d => d.type,
        nodeRadius: node_redius_mapper,
        nodeTitle: d => `${d.id}\n${d.type}`,
        linkStroke: linkStroke_mapper,
        linkStrokeWidth: l => Math.sqrt(l.value),
        width: window.innerWidth,
        height: window.innerHeight * 1.5,
        // // invalidation // a promise to stop the simulation when the cell is re-run
    })
    console.log(selected_issue_json)
    const div = d3.select("#network-container")
    div.node().appendChild(chart)
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/force-directed-graph
function ForceGraph({
    nodes, // an iterable of node objects (typically [{id}, …])
    links // an iterable of link objects (typically [{source, target}, …])
}, {
    nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels
    nodeStrength,
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 1, // link stroke opacity
    linkStrokeWidth = 4, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength,
    colors = ["#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00"], // an array of color strings, for the node groups
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    invalidation // when this promise resolves, stop the simulation
} = {}) {
    // Compute values.
    const test = d3.map(nodes, nodeId)
    const N = d3.map(nodes, nodeId).map(intern);
    const LS = d3.map(links, linkSource).map(intern);
    const LT = d3.map(links, linkTarget).map(intern);
    if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
    const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
    const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
    const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);
    const L = typeof linkStroke !== "function" ? null : d3.map(links, linkStroke);

    // Replace the input nodes and links with mutable objects for the simulation.
    nodes_copy = nodes;
    issue_node = nodes[1]
    nodes = d3.map(nodes, (_, i) => ({ id: N[i] }));
    links = d3.map(links, (_, i) => ({ source: LS[i], target: LT[i] }));

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

    // Construct the scales.
    const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    // Construct the forces.
    const forceNode = d3.forceManyBody();
    const forceLink = d3.forceLink(links).id(({ index: i }) => N[i]);
    if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
    if (linkStrength !== undefined) forceLink.strength(linkStrength);

    const simulation = d3.forceSimulation(nodes)
        .force("link", forceLink)
        .force("charge", forceNode)
        .force("center", d3.forceCenter())
        .on("tick", ticked);

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;  background-color: #f2f2f2");

        const link = svg.append("g")
        .attr("stroke", typeof linkStroke !== "function" ? linkStroke : null)
        .attr("stroke-opacity", linkStrokeOpacity)
        .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
        .attr("stroke-linecap", linkStrokeLinecap)
        .selectAll("line")
        .data(links)
        .join("line");

    const node = svg.append("g")
        .attr("fill", nodeFill)
        .attr("stroke", nodeStroke)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-width", nodeStrokeWidth)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", nodeRadius)
        .call(drag(simulation));

    if (W) link.attr("stroke-width", ({ index: i }) => W[i]);
    if (L) link.attr("stroke", ({ index: i }) => L[i]);
    if (G) node.attr("fill", ({ index: i }) => G[i] == 'issue' ? "var(--" + issue_node["state"] + "-issue-color)" : color(G[i]));
    if (T) node.append("title").text(({ index: i }) => nodes_copy[i]["name"]);
    if (invalidation != null) invalidation.then(() => simulation.stop());

    // Legends for Gantt
    legend_distance_x = innerWidth -100
    legend_distance_y = -550
    legend_dict = {}
    
    nodeGroups.forEach(group =>{
        if(legend_dict[group] != undefined) return;
        legend_dict[group] = true
        svg.append("rect").attr("x", 600).attr("y", legend_distance_y).attr("width", 20).attr("height", 20).style("fill", () => { return group == 'issue' ?  "var(--" + issue_node["state"] + "-issue-color)" : color(group)})
        svg.append("text").attr("class", "legend-text").attr("x", 650).attr("y", legend_distance_y + 10).text(group).style("font-size", "16px").style("font-weight", "600").attr("alignment-baseline", "middle")
        legend_distance_y = legend_distance_y + 30
    })

    function intern(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    return Object.assign(svg.node(), { scales: { color } });
}

function clearDiv() {
    // Select the div element
    const div = d3.select("#network-container");

    // Remove all children from the div
    div.selectAll("*").remove();
}