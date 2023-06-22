function load_timeline(svg_name, data, title, x1_field, x2_field, y_field, x_title, type) {

      // General Variables
      let chart_width = $(svg_name).width()* 0.95;
      let chart_height = $(svg_name).height()* 0.95;
      let chart = d3.select(svg_name).append("svg")
                  .attr("viewBox", [0, 0, chart_width, chart_height])
                  .attr("width", chart_width)
                  .attr("height", chart_height);


      // Margins, Height & Width
      const margin = { top: 50, right: 220, bottom: 77, left: 140 };
      const innerWidth = chart_width - margin.left - margin.right;
      const innerHeight = chart_height - margin.top - margin.bottom;

      let x_max = -1;
      let x_min = Infinity;
      for (i = 0; i < data.length; i++) {
            x_max = Math.max(x_max, data[i].closed);
            x_min = Math.min(x_min, data[i].created)
      }

      // Date format
      //let parseDate = d3.time.format("%Y-%m-%d").parse;

      // Scales & Axis
      const xScale = d3.scaleTime()
            .domain([new Date(x_min), new Date(x_max)])
            .range([0, innerWidth]);

      const yScale = d3.scaleBand()
            .domain(data.map(d => d[y_field]))
            .range([0, innerHeight])
            .padding(0.2);

      const g = chart.append("g").attr("transform", `translate(${margin.left},${margin.top})`);


      g.append("text")
            .text(`${title}`)
            .attr("font-size", "30px")
            .attr("y", -20);


      const xAxis = d3.axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickValues(xScale.ticks())
            .tickFormat(d3.timeFormat("%b %d"));

      const xAxisG = g.append("g").attr("class", "x-axis").call(xAxis)
            .attr("transform", `translate(0,${innerHeight})`);


      xAxisG.append("text")
            .text(`${x_title}`)
            .attr("class", "axis-label")
            .attr("fill", "black")
            .attr("y", 40)
            .attr("x", innerWidth / 2)
            .attr("font-size", "16px");

      if (type === "state")
            load_issue_status(g, xScale, yScale, x1_field, x2_field, y_field, innerWidth)
      else {
            load_issue_label(g, xScale, yScale, x1_field, x2_field, y_field, innerWidth)
      }

      // Generate bars for commits
      // const COLOR_PALETTE = ["#68FF42", "#68FF42", "#FFFF54", "#FFFF54", "#EF8432", "#EF8432",
      //       "#EA3323", "#EA3323", "#8C1A4B", "#8C1A4B", "#721324", "#721324",
      //       "#721324", "#721324"];
      // var i = 0;
      // var commitRect = g.selectAll("rect_commit")
      //       .data(data).enter();
      // data.forEach(d => {
      //       let commits = getCommitBetween(d.created, d.closed, d.title);
      //       let offset = (xScale(d[x2_field]) - xScale(d[x1_field])) / commits.length;
      //       let delX = 0;
      //       var color = d3.scaleLinear()
      //             .domain(Array.from(Array(commits.length).keys()))
      //             .range(COLOR_PALETTE);
      //       commits.forEach(c => {

      //             commitRect.append("rect")
      //                   .attr("class", "commit_bars" + i)
      //                   .attr("fill", color(commits.indexOf(c)))
      //                   .attr("x", xScale(d[x1_field]) + delX)
      //                   .attr("y", yScale(d[y_field]) + 15)
      //                   .attr("rx", 6)
      //                   .attr("ry", 6)
      //                   .attr("width", offset)
      //                   .attr("height", yScale.bandwidth())
      //                   .style("visibility", "hidden")
      //                   .append("title")
      //                   .text(c.message);
      //             delX += offset;
      //       })
      //       i++;
      // });

      // var shadowScale = xScale.copy();

      function zoomed() {
            //chart.attr("transform", d3.event.transform);

            // xScale.domain(d3.event.transform.rescaleX(shadowScale).domain());
            // g.selectAll("rect[class='issue_duration_bars']")
            //       .attr("x", d => xScale(d[x1_field]))
            //       .attr("width", d => xScale(d[x2_field]) - xScale(d[x1_field]));
            // xAxisG.call(xAxis);
            // console.log("zoom");
      };

      return {
            chart: chart,
            chart_width: chart_width,
            chart_height: chart_height,
            x_scale: xScale,
            y_scale: yScale,
      }
}

function load_issue_status(g, xScale, yScale, x1_field, x2_field, y_field, innerWidth) {
      clearChart();

      // Generate bars
      var selectedBar = null;
      var bars = g.selectAll("rect_issue")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "issue_group")
            .on('click', function (d) {
                  showCommitBetweenWithSankey(d.currentTarget.__data__);
                  // ...
            });

      bars.append("rect")
            .attr("class", "issue_duration_bars")
            .attr("fill", function (d) {
                  return "var(--" + d.state + "-issue-color)";
            })
            .attr("x", function (d) {
                  return xScale(d[x1_field]);
            })
            .attr("y", function (d) {
                  return yScale(d[y_field]);
            })
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("width", function (d) {
                  return Math.abs(xScale(d[x2_field]) - xScale(d[x1_field]) - 20);
            })
            .attr("height", yScale.bandwidth());

      bars.append("polygon")
            .attr("class", "bar_triangle")
            .attr("points", function (d) {
                  if (d.state == "closed")
                        return;

                  var x1 = xScale(d[x2_field]);
                  var x2 = x1 - 22;
                  var y1 = yScale(d[y_field]) + yScale.bandwidth() / 2;
                  var y2 = y1 + yScale.bandwidth() *0.5;
                  var y3 = y1 - yScale.bandwidth() *0.5;
                  return x1 + "," + y1 + " " + x2 + "," + y2 + " " + x2 + "," + y3;
            })
            .attr("fill", function (d) {
                  return "var(--" + d.state + "-issue-color)";
            });

      bars.append("title")
            .text(function (d) {
                  console.log(d)
                  var closed_time = d.state == 'open' ? '' : "\nclosed: " + new Date(d[x2_field]);
                  var tooltip = d["title"] + "\ncreated: " + new Date(d[x1_field]) + closed_time;
                  return tooltip;
            });



      // Legends for Gantt
      legend_distance_x = innerWidth + 30
      g.append("polygon").attr("points", function (d) {

            var x1 = legend_distance_x + 20;
            var x2 = legend_distance_x
            var y1 = -10;
            var y2 = y1 + 15;
            var y3 = y1 - 15;
            return x1 + "," + y1 + " " + x2 + "," + y2 + " " + x2 + "," + y3;
      }).style("fill", "var(--open-issue-color)")
      g.append("rect").attr("x", legend_distance_x - 2).attr("y", 20).attr("width", 20).attr("height", 20).style("fill", "var(--closed-issue-color)")
      g.append("text").attr("class", "legend-text").attr("x", legend_distance_x + 30).attr("y", -8).text("Open").style("font-size", "16px").style("font-weight", "600").attr("alignment-baseline", "middle")
      g.append("text").attr("class", "legend-text").attr("x", legend_distance_x + 30).attr("y", 30).text("Closed").style("font-size", "16px").style("font-weight", "600").attr("alignment-baseline", "middle")
}


function load_issue_label(g, xScale, yScale, x1_field, x2_field, y_field, innerWidth) {
      clearChart();

      let labels = []
      let label_dict = {}
      
      data.forEach(d =>{
            labels.push(d.labels)
            d.labels.forEach(label => {
                  label_dict[label["id"]] = {"name": label["name"], "color": '#'+label["color"]}
            })
            
      })
      console.log(label_dict)
      
      
      // Generate bars
      var labelRect = g.selectAll("rect_label")
            .data(data).enter();

      let color_dict = {}
      let end_point_dict = {}
      data.forEach(d => {
            let labels = d.labels;
            let segment_length = Math.abs(xScale(d[x2_field]) - xScale(d[x1_field]) - 20) / (labels.length * 10) ;
            let j = 0
            let offset =  10;
            let delX = 0;
            while (j < segment_length){

                  for(let k = 0; k < labels.length; k++){
                              let l = labels[k]
                              color_dict[d["title"]] = label_dict[l["id"]]["color"]
                              labelRect.append("rect")
                              .attr("class", "issue_label_bars" + i)
                              .attr("fill", label_dict[l["id"]]["color"])
                              .attr("x", xScale(d[x1_field]) + delX)
                              .attr("y", yScale(d[y_field]))
                              .attr("width", offset)
                              .attr("height", yScale.bandwidth())
                              .attr("rx", 2)
                              .attr("ry", 2)
                              .on('click', function () {
                                    showCommitBetweenWithSankey(d);
                                    // ...
                              })
                              .append("title")
                              .text(d["title"]);

                              delX += offset;
                              if(d["state"] == "open" && xScale(d[x1_field]) + delX + 20 >= xScale(d[x2_field])){
                                    end_point_dict[d["title"]] = xScale(d[x1_field]) + delX
                                    break;
                              }
                              if(xScale(d[x1_field]) + delX >= xScale(d[x2_field])){
                                    end_point_dict[d["title"]] = xScale(d[x1_field]) + delX
                                    break;
                              }

                              end_point_dict[d["title"]] = xScale(d[x1_field]) + delX
                              
                  }

                  i++;
                  j++
            }
            
      });

      labelRect.append("polygon")
      .attr("class", "bar_triangle")
      .attr("points", function (d) {
            if (d.state == "closed")
                  return;

            var x1 = xScale(d[x2_field]);
            var x2 = end_point_dict[d["title"]];
            var y1 = yScale(d[y_field]) + yScale.bandwidth() / 2;
            var y2 = y1 + yScale.bandwidth() *0.5;
            var y3 = y1 - yScale.bandwidth() *0.5;
            return x1 + "," + y1 + " " + x2 + "," + y2 + " " + x2 + "," + y3;
      })
      .attr("fill", function (d) {
            return color_dict[d["title"]];
      });

      labelRect.append("title")
      .text(function (d) {
            console.log(d)
            var closed_time = d.state == 'open' ? '' : "\nclosed: " + new Date(d[x2_field]);
            var tooltip = d[y_field] + "\ncreated: " + new Date(d[x1_field]) + closed_time;
            return tooltip;
      });


      
      // labelRect.append("title")
      //       .text(function (d) {
      //             var closed_time = d.state == 'open' ? '' : "\nclosed: " + new Date(d[x2_field]);
      //             var tooltip = d[y_field] + "\ncreated: " + new Date(d[x1_field]) + closed_time;
      //             return tooltip;
      //       });

      // Legends for Gantt
      legend_distance_x = innerWidth + 28
      legend_distance_y = 20

      Object.keys(label_dict).forEach(key =>{
            g.append("rect").attr("x", legend_distance_x).attr("y", legend_distance_y).attr("width", 20).attr("height", 20).style("fill", label_dict[key]["color"])
            g.append("text").attr("class", "legend-text").attr("x", legend_distance_x + 30).attr("y", legend_distance_y + 10).text(label_dict[key]["name"]).style("font-size", "16px").style("font-weight", "600").attr("alignment-baseline", "middle")
            legend_distance_y = legend_distance_y + 30
      })
       


      // Legends for Gantt

}

function clearChart(){
      var svgElement = document.getElementById('timeline');

      // Remove all <rect> elements within the SVG
      var rectElements = svgElement.querySelectorAll('rect');
      rectElements.forEach(function(rect) {
        rect.remove();
      });
      
      // Remove all <polygon> elements within the SVG
      var polygonElements = svgElement.querySelectorAll('polygon');
      polygonElements.forEach(function(polygon) {
        polygon.remove();
      });

       // Remove all <text> elements within the SVG
       var textElements = svgElement.querySelectorAll('.legend-text');
       textElements.forEach(function(text) {
         text.remove();
       });
}
