var radius;
var svg;
var color;

function load_file_update_summary(div_name, data) {
    d3.select(div_name).select("svg").remove();
    var width = 450
    height = 450
    margin = 40
    let chart_width = $(div_name).width();
    let chart_height = $(div_name).height();
    //console.log(data);
    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    radius = Math.min(width, height) / 2 - margin

    svg = d3.select(div_name)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("x", chart_width / 4)
        .attr("y", chart_height / 5)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // set the color scale
    color = d3.scaleOrdinal()
        .domain(data)
        .range(["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"
        ])

    // // Compute the position of each group on the pie:
    // var pie = d3.pie()
    //     .value(function (d) { if(d.value >= selectedLowerRange && selectedUpperRange!= undefined && d.value <= selectedUpperRange )return d.value; })
    // var data_ready = pie(d3.entries(data))

    // // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    // svg.selectAll('arc')
    //     .data(data_ready)
    //     .enter()
    //     .append('path')
    //     .attr('d', d3.arc()
    //         .innerRadius(100)         // This is the size of the donut hole
    //         .outerRadius(radius)
    //     )
    //     .attr('fill', function (d) { return (color(d.data.key)) })
    //     .attr("stroke", "black")
    //     .style("stroke-width", "2px")
    //     .style("opacity", 0.7)
    //     .append("title")
    //     .text(function (d) {
    //         return d.data.key + '\n' + d.data.value + " lines were updated";
    //     });
    updateDonutChart(data);
}

function updateDonutChart(data) {
    // Compute the position of each group on the pie:
    var pie = d3.pie()
        .value(function (d) { return d.value.update_freq; });
    var data_ready = pie(d3.entries(data));

    var arc = d3.arc()
        .innerRadius(100)         // This is the size of the donut hole
        .outerRadius(radius);

    var arcOver = d3.arc()
        .innerRadius(100)         // This is the size of the donut hole
        .outerRadius(radius + 20);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.

    svg.selectAll('arc')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d) { return (color(d.data.value.update_freq)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (d) {
            d3.select(this).transition()
                .duration(500)
                .attr("d", arcOver);
            var updatedLineCount = d.data.value.update_freq + " lines were updated";
            svg.append("text")
            .attr("text-anchor", "middle")
            .text(updatedLineCount);
        })
        .on("mouseout", function (d) {
            d3.select(this).transition()
                .duration(500)
                .attr("d", arc);
            svg.select("text").remove();
        })
        .append("title")
        .text(function (d) {
            return d.data.value.name + '\n' + d.data.value.update_freq + " lines were updated";
        });

    // var u = svg.selectAll("path")
    //     .data(data_ready);

    // u.enter()
    // .append('path')
    // .merge(u)
    // .transition()
    // .duration(1000)
    // .attr('d', d3.arc()
    //     .innerRadius(100)
    //     .outerRadius(radius)
    // )
    // .attr('fill', function (d) { return (color(d.data.value.update_freq)) })
    // .attr("stroke", "white")
    // .style("stroke-width", "2px")
    // .style("opacity", 1)

}