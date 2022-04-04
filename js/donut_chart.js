var radius;
var svg;
var color;
var totalUpdatedLines;

function load_file_update_summary(div_name, data, freq_type) {
    d3.select(div_name).select("svg").remove();
    var width = 450
    height = 450
    margin = 40
    let chart_width = $(div_name).width();
    let chart_height = $(div_name).height();
    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    radius = Math.min(width, height) / 2 - margin;

    let title = "Files update summary";



    svg = d3.select(div_name)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("x", chart_width / 4)
        .attr("y", chart_height / 5)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // svg.append("text")
    //     .text(`${title}`)
    //     .attr("font-size", "20px")
    //     .attr("x", 0)
    //     .attr("y", 0);

    // set the color scale
    color = d3.scaleOrdinal()
        .domain(data)
        .range(["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087", "#f95d6a", "#ff7c43", "#ffa600"
        ])

    totalUpdatedLines = 0;
    data.forEach(entry => {
        totalUpdatedLines += entry.update_freq; ''
    });
    updateDonutChart(data, freq_type);
}

function updateDonutChart(data, freq_type) {
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
    if (freq_type == "percentage") {
        showPercentage(data_ready, arc, arcOver);
    }
    else {
        showNumberOfLines(data_ready, arc, arcOver);
    }

}

function showPercentage(data_ready, arc, arcOver) {
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
            var updatedLineCount = Math.round((d.data.value.update_freq / totalUpdatedLines) * 100) + "% of total change";
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

            return d.data.value.name + '\n' + Math.round((d.data.value.update_freq / totalUpdatedLines) * 100) + "% of total change";
        });
}

function showNumberOfLines(data_ready, arc, arcOver){
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

}