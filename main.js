const width = 1000;
const height = 600;
const svg = d3.select("#svg1")
    .attr("viewBox", [0, 0, width, height]);

async function main() {
    const data = await d3.json("json/WHO_YLL_Global_2.json");

    const treemap = d3.treemap()
    // .tile(d3.treemapResquarify)
    .size([width, height])
    .padding(2)
    
    const root = d3.hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);
    treemap(root);

    const color = d3.scaleOrdinal()
        .domain(["Infectious and parasitic diseases", "Noncommunicable diseases", "Injuries"])
        .range([ "#402D54", "#D18975", "#8FD175"]);

    // const opacity = d3.scaleLinear()
    //     .domain([0, 6])
    //     .range([.5,1]);
        
    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");
    
    cell.append("rect")
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("fill", (d) => color(d.parent.data.name))
        // .style("opacity", (d) => opacity(d.data.value));

    cell.append("title")
        .text((d) => d.data.name + "\n" + d3.format(d.value));
    
    cell.append("clipPath")
        .attr("id", (d) => "clip-" + d.data.code)
        .append("use")
        .attr("xlink:href", (d) => "#" + d.data.code);

    cell.append("text")
        .attr("clip-path", (d) => "url(#clip-" + d.data.code + ")")
        .selectAll("tspan")
            .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
            .enter().append("tspan")
            .attr("x", 4)
            .attr("y", 10)
            .text((d) => d);


    // svg.selectAll("text")
        // .data(root.leaves())
        // .join("text")
        // .attr("x", (d) => d.x0+5)    // +10 to adjust position (more right)
        // .attr("y", (d) => d.y0+10)    // +20 to adjust position (lower)
        // .text((d) => d.data.code )
        // .attr("font-size", "15px")
        // .attr("fill", "white");
}

main();
