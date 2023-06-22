var radius;
var svg;
var color;
var totalUpdatedLines;
var radius_scale;
var inner_radius;

function load_file_update_summary(div_name, donut_data, freq_type) {
    d3.select(div_name).select("svg").remove();
    width = window.innerWidth;
    height = window.innerHeight * 0.6;
    margin = Math.min(width, height)  * 0.1;
    let chart_width = $(div_name).width();
    let chart_height = $(div_name).height();
    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    radius = Math.min(width, height) / 2 - margin;

    inner_radius = width / 20;

    let title = "File update summary";

    svg = d3.select(div_name)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("x", chart_width / 4)
        .attr("y", chart_height / 5)
        .style("background-color", "#f2f2f2")
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // svg.append("text")
    //     .text(`${title}`)
    //     .attr("font-size", "20px")
    //     .attr("x", -200)
    //     .attr("y", -100);


    const COLOR_PALETTE = ["#a6cee3",
                            "#1f78b4",
                            "#b2df8a",
                            "#33a02c",
                            "#fb9a99",
                            "#e31a1c",
                            "#fdbf6f",
                            "#ff7f00",
                            "#cab2d6",
                            "#6a3d9a",
                            "#ffff99",
                            "#b15928"];
    // set the color scale
    // var min = Math.min(...data.map(item => item.update_freq));
    // var max = Math.max(...data.map(item => item.update_freq));

    update_freq_arr = []

    donut_data.forEach(item => {
        update_freq_arr.push(item.update_freq);
    })

    update_freq_arr.sort(function (a, b) { return a - b });

    color = d3.scaleOrdinal()
        .domain(update_freq_arr)
        .range(update_freq_arr.map((_, i) => COLOR_PALETTE[i % COLOR_PALETTE.length]))

    radius_scale = d3.scaleOrdinal()
        .domain(update_freq_arr)
        .range([radius, radius])

    totalUpdatedLines = 0;
    donut_data.forEach(entry => {
        totalUpdatedLines += entry.update_freq;
    });
    updateDonutChart(donut_data, freq_type);
}

function updateDonutChart(data, freq_type) {
    // Compute the position of each group on the pie:
    const pie = d3.pie()
        .value(d => d ? d.update_freq : 0);

    const dataValues = Object.values(data);
    const data_ready = pie(dataValues);

    var arc = d3.arc()
        .innerRadius(inner_radius)         // This is the size of the donut hole
        .outerRadius(radius_scale);

    var arcOver = d3.arc()
        .innerRadius(inner_radius)         // This is the size of the donut hole
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
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
    svg.selectAll('arc')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
        .innerRadius(inner_radius) // Set the inner radius
        .outerRadius(function(d) { return radius_scale(d.data.update_freq); })
    )
        .attr('fill', function (d) { return (color(d.data.update_freq)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (d) {
            d3.select(this).transition()
                .duration(500)
                .attr("d", d3.arc()
                .innerRadius(inner_radius) // Set the inner radius
                .outerRadius(function(d) { return radius_scale(d.data.update_freq) + 20; }));
            var updatedLineCount = Math.round((d.currentTarget.__data__.data.update_freq / totalUpdatedLines) * 100) + "% of total change";
            svg.append("text")
                .attr("class", "updatedLineCount")
                .attr("text-anchor", "middle")
                .text(updatedLineCount);
            
            // Show tooltip
            tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);

            // Safely access event properties
            var pageX = event.pageX || d3.event.pageX;
            var pageY = event.pageY || d3.event.pageY;
            var tooltip_text = d.currentTarget.__data__.data.name;

            // Position the tooltip
            tooltip.html(tooltip_text)
                    .style("left", (pageX) + "px")
                    .style("top", (pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            d3.select(this).transition()
                .duration(500)
                .attr("d", d3.arc()
                .innerRadius(inner_radius) // Set the inner radius
                .outerRadius(function(d) { return radius_scale(d.data.update_freq); })
            );
            svg.select(".updatedLineCount").remove();
               // Hide tooltip
               tooltip.transition()
               .duration(500)
               .style("opacity", 0);
        });
}

function showNumberOfLines(data_ready, arc, arcOver) {
    var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);
    svg.selectAll('arc')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', d3.arc()
            .innerRadius(inner_radius) // Set the inner radius
            .outerRadius(function(d) { return radius_scale(d.data.update_freq); })
        )
        .attr('fill', function (d) { return (color(d.data.update_freq)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (d) {
            d3.select(this).transition()
                .duration(500)
                .attr("d", d3.arc()
                .innerRadius(inner_radius) // Set the inner radius
                .outerRadius(function(d) { return radius_scale(d.data.update_freq) + 20; }));
            var updatedLineCount = d.currentTarget.__data__.data.update_freq + " lines were updated";
            svg.append("text")
                .attr("class", "updatedLineCountTextClass")
                .attr("text-anchor", "middle")
                .text(updatedLineCount);
            // Show tooltip
            tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);

            // Safely access event properties
            var pageX = event.pageX || d3.event.pageX;
            var pageY = event.pageY || d3.event.pageY;
            var tooltip_text = d.currentTarget.__data__.data.name;

            // Position the tooltip
            tooltip.html(tooltip_text)
                    .style("left", (pageX) + "px")
                    .style("top", (pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            d3.select(this).transition()
                .duration(500)
                .attr("d", d3.arc()
                .innerRadius(inner_radius) // Set the inner radius
                .outerRadius(function(d) { return radius_scale(d.data.update_freq); })
            );
            svg.selectAll("text.updatedLineCountTextClass").remove();

            // Hide tooltip
            tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
        });

}