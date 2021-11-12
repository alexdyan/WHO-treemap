import uid from './uid.js';

const width = 1000;
const height = 800;
const svg = d3.select("#svg1")
    .attr("viewBox", [0, 0, width, height])
    .style("font", "10px sans-serif");

async function main() {
    const data = await d3.json("json/WHO_YLL_Global_mini.json");
    const totalYLLs = 1706630.49819042;

    const treemap = d3.treemap()
    .size([width, height])
    .paddingOuter(4)
    .paddingTop(19)
    .paddingInner(1)
    
    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);
    treemap(root);


    // const color = d3.scaleSequential([-1, 5], d3.interpolateGnBu);
    const colorRange1 = ['#5765f5', '#e5e9ff']
    const color1 = d3.scaleLinear()
        .domain([0, 4])
        .interpolate(d3.interpolateHcl)
        .range([d3.hcl(colorRange1[1]), d3.hcl(colorRange1[0])])
    const colorRange2 = ['#29a5f6', '#dcf7ff']
    const color2 = d3.scaleLinear()
        .domain([0, 4])
        .interpolate(d3.interpolateHcl)
        .range([d3.hcl(colorRange2[1]), d3.hcl(colorRange2[0])])
    const colorRange3 = ['#e33674', '#ffe5f2']
    const color3 = d3.scaleLinear()
        .domain([0, 4])
        .interpolate(d3.interpolateHcl)
        .range([d3.hcl(colorRange3[1]), d3.hcl(colorRange3[0])])
    
        
    const cell = svg.selectAll("g")
        .data(d3.group(root, d => d.height))
        .join("g")
        .selectAll("g")
        .data(d => d[1])
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);
    
    // the cell boxes
    cell.append("rect")
        .attr("id", d => (d.cellUid = uid("cell")).id)
        // .attr("fill", d => color(d.height))
        .attr('fill', (d) => {
            if (getRoot(d, root) == "Communicable, maternal, perinatal and nutritional conditions") {
                return color1(d.height);
            }
            else if (getRoot(d, root) == "Noncommunicable diseases") {
                return color2(d.height);
            }
            else if (getRoot(d, root) == "Injuries") {
                return color3(d.height);
            }
            else {
                return "#ffffff"
            }
        } )
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)


    // hover text
    cell.append("title")
        .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${d3.format(".1f")(totalYLLs * (d.value / 100))}`)
        .style("fill", "yellow")
    
    // prevents text from overflowing its cell
    cell.append("clipPath")
        .attr("id", d => (d.clipUid = uid("clip")).id)
        .append("use")
        .attr("xlink:href", d => d.cellUid.href);

    // name and info
    cell.append("text")
        .attr("clip-path", d => d.clipUid)
        .selectAll("tspan")
            .data(d => (d === root ? d.ancestors().reverse().map(d => d.data.name).join("/") : d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(d3.format(".1f")(totalYLLs * (d.value / 100)))))
            .join("tspan")
            .text(d => d);

    cell.filter(d => d.children).selectAll("tspan")
        .attr("dx", 3)
        .attr("y", 13);
    cell.filter(d => !d.children).selectAll("tspan")
        .attr("x", 3)
        .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`);
}

function getRoot(d, root) {
    if ((d !== root) && d.parent.data.name) return getRoot(d.parent)
    else return d.data.name;
}

main();
