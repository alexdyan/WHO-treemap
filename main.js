import uid from './uid.js';

const width = 1000;
const height = 800;
const svg = d3.select("#svg1")
    .attr("viewBox", [0, 0, width, height])
    .style("font", "10px sans-serif");

async function main() {
    const data = await d3.json("json/WHO_YLL_Global_mini.json");

    const treemap = d3.treemap()
    // .tile(d3.treemapResquarify)
    .size([width, height])
    .paddingOuter(3)
    .paddingTop(19)
    .paddingInner(1)
    
    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);
    treemap(root);

    const color = d3.scaleSequential([-1, 5], d3.interpolateGnBu);
        
    const cell = svg.selectAll("g")
        .data(d3.group(root, d => d.height))
        .join("g")
        .selectAll("g")
        .data(d => d[1])
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
    cell.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${d3.format(d.value)}`);
    
    cell.append("rect")
        .attr("id", d => (d.cellUid = uid("cell")).id)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .style("fill", d => {
            console.log(d.height)
            return color(d.height)})

    cell.append("title")
        .text((d) => d.data.name + "\n" + d3.format(d.value));
    
    cell.append("clipPath")
        .attr("id", d => (d.clipUid = uid("clip")).id)
        .append("use")
        .attr("xlink:href", d => d.cellUid.href);

    cell.append("text")
        .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
            .data(d => (d=== root ? d.ancestors().reverse().map(d => d.data.name).join("/") : d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(d3.format(d.value))))
            .join("tspan")
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .text(d => d);
    
    cell.filter(d => d.children).selectAll("tspan")
        .attr("dx", 3)
        .attr("y", 13);
    cell.filter(d => !d.children).selectAll("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`);
}

main();
