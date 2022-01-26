function load_timeline(svg_name, data, title, x1_field, x2_field, y_field, x_title) {

      // General Variables
      let chart = d3.select(svg_name);
      let chart_width = $(svg_name).width();
      let chart_height = $(svg_name).height();


      // Margins, Height & Width
      const innerWidth = chart_width - margin.left - margin.right;
      const innerHeight = chart_height - margin.top - margin.bottom;

      let x_max = -1;
      let x_min = Infinity;
      for (i = 0; i < data.length; i++) {
            x_max = Math.max(x_max, data[i].closed);
            x_min = Math.min(x_min, data[i].created)
      }

      // Scales & Axis
      const xScale = d3.scaleLinear()
            .domain([1637650000, 1638200000])
            .range([0, innerWidth]);

      const yScale = d3.scaleBand()
            .domain(data.map(d => d[y_field]))
            .range([0, innerHeight])
            .padding(0.2);

      const g = chart.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);


      g.append("text")
            .text(`${title}`)
            .attr("font-size", "20px")
            .attr("y", -20);


      const xAxis = d3.axisBottom(xScale)
            .tickSize(-innerHeight)
            .tickValues(xScale.ticks().concat(xScale.domain()));

      const xAxisG = g.append("g").call(xAxis)
            .attr("transform", `translate(0,${innerHeight})`);


      xAxisG.append("text")
            .text(`${x_title}`)
            .attr("class", "axis-label")
            .attr("fill", "black")
            .attr("y", 40)
            .attr("x", innerWidth / 2)
            .attr("font-size", "16px");

      // Generate bars
      var selectedBar = null;
      var bars = g.selectAll("rect_issue")
            .data(data).enter()
            .append("rect")
            .attr("class", "issue_duration_bars")
            .attr("fill", "cornflowerblue")
            .attr("x", d => xScale(d[x1_field]))
            .attr("y", d => yScale(d[y_field]))
            .attr("rx", 6)
            .attr("ry", 6)
            .attr("width", d => xScale(d[x2_field]) - xScale(d[x1_field]))
            .attr("height", yScale.bandwidth())
            .on('click', function (d) {
                  showCommitBetween(d.created, d.closed);
                  // focusing the selected bar and reducing opacity of all other bars
                  if(selectedBar != this){
                        g.selectAll("rect[class='issue_duration_bars']")
                              .style("opacity", 0.5)
                              .attr("height", yScale.bandwidth());
                        
                        d3.select(this)
                              .style("opacity", 1)
                              .attr("height", yScale.bandwidth() * 2 );
                        //g.selectAll("rect[class='commit_bars']").style("visibility", "visible");
                        data.forEach(item =>{
                              g.selectAll("rect[class='commit_bars"+ data.indexOf(item) +"']").style("visibility", "hidden");
                        })
                        g.selectAll("rect[class='commit_bars" + data.indexOf(d) +"']").style("visibility", "visible");
                        // g.selectAll("rect[id='"+ d.title + "']").style("visibility", "visible");
                        selectedBar = this;
                  }
                  else{
                        g.selectAll("rect[class='issue_duration_bars']")
                              .style("opacity", 1)
                              .attr("height", yScale.bandwidth());;
                        data.forEach(item =>{
                              g.selectAll("rect[class='commit_bars"+ data.indexOf(item) +"']").style("visibility", "hidden");
                        });

                        selectedBar = null;
                        // g.selectAll("rect[id='"+ d.title + "']").style("visibility", "hidden");
                        //g.selectAll("rect[class='commit_bars']").style("visibility", "hidden");
                  }

            })
            .append("title")
            .text(function (d) {
                  return d[y_field];
            });



      // Generate bars for commits
      const COLOR_PALETTE = ["#FFFF54", "#EF8432", "#EA3323"];
      var i = 0;
      var commitRect = g.selectAll("rect_commit")
                        .data(data).enter();
      data.forEach(d => {
            let commits = getCommitBetween(d.created, d.closed); 
            let offset = (xScale(d[x2_field]) - xScale(d[x1_field])) / commits.length;  
            let delX = 0;
            var color = d3.scaleLinear()
                              .domain(Array.from(Array(commits.length).keys()))
                              .range(COLOR_PALETTE);         
            commits.forEach(c =>{
                        
                  commitRect.append("rect")
                        .attr("class", "commit_bars" + i)
                        .attr("fill", color(commits.indexOf(c)) )
                        .attr("x", xScale(d[x1_field]) + delX)
                        .attr("y", yScale(d[y_field]) + 15)
                        .attr("rx", 6)
                        .attr("ry", 6)
                        .attr("width", offset)
                        .attr("height", yScale.bandwidth())
                        .style("visibility", "hidden")
                        .append("title")
                        .text(c.message); 
                  delX += offset;
            })
            i++;
      });



      return {
            chart: chart,
            chart_width: chart_width,
            chart_height: chart_height,
            x_scale: xScale,
            y_scale: yScale,
      }
}
