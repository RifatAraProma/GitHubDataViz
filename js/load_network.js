function load_network(issue) {
    // Assuming you have a container element with id "network-container" for the network diagram
    const container = d3.select("#network-container");

    // Sample data
    const data = {
        assignees: "John Doe",
        issueTitle: "Issue with Quality Assurance certification coding challenge",
        prCreator: "Jane Smith",
        prCommits: 5
        // Add more properties as needed
    };

    // Create a SVG element within the container
    const svg = container.append("svg")
        .attr("width", 400)
        .attr("height", 200);

    // Define colors for different node types
    const colors = {
        user: "blue",
        issueTitle: "green",
        assignees: "red",
        pr: "orange",
        commits: "purple"
    };

    // Create nodes and assign corresponding colors
    const nodes = Object.keys(data).map((key, index) => ({
        id: key,
        color: colors[key],
        value: data[key],
        x: 100 + index * 80,
        y: 100
    }));

    // Bind nodes data to circle elements
    const circles = svg.selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 20)
        .attr("fill", d => d.color);

    // Add labels to the circles
    svg.selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "black")
        .text(d => d.value);

}