const width = 960;
const height = 570;
const svg = d3.select("#svg1")
.attr("width", width)
.attr("height", height);

// function loadData(url) {
//     return new Promise((resolve, reject) => {
//         Papa.parse(url, {
//             download: true,
//             complete: (results) => {
//                 console.log(results)
//                 return resolve(results);
//             }
//         })
//     })
// }

async function main() {
    // const data = await loadData("./testCSV.csv");
    const data = await d3.json("WHO_YLL_Global_2.json");

    const root = d3.hierarchy(data)
        .sum((d) => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);
        
        const treemap = d3.treemap()
        .size([width, height])
        .padding(2)
        
        treemap(root)
        
        const cell = svg.selectAll("g")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")")
        cell.append("rect")
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .style("stroke", "black")
            .style("fill", "purple");
        
        svg.selectAll("text")
            .data(root.leaves())
            .join("text")
            .attr("x", (d) => d.x0+5)    // +10 to adjust position (more right)
            .attr("y", (d) => d.y0+10)    // +20 to adjust position (lower)
            .text((d) => d.data.code )
            .attr("font-size", "15px")
            .attr("fill", "white")
}

main();


// d3.json("test1.json")
//     .then((data) => {
//         const root = d3.hierarchy(data)
//         .sum((d) => d.size)
        
//         const treemap = d3.treemap()
//         .size([width, height])
//         .padding(2)
        
//         treemap(root)
        
//         const cell = svg.selectAll("g")
//             .data(root.leaves())
//             .enter().append("g")
//             .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")")
//         cell.append("rect")
//             .attr("width", (d) => d.x1 - d.x0)
//             .attr("height", (d) => d.y1 - d.y0)
//             .style("stroke", "black")
//             .style("fill", "purple")
        
//         svg.selectAll("text")
//             .data(root.leaves())
//             .join("text")
//             .attr("x", (d) => d.x0+5)    // +10 to adjust position (more right)
//             .attr("y", (d) => d.y0+20)    // +20 to adjust position (lower)
//             .text((d) => d.data.name )
//             .attr("font-size", "15px")
//             .attr("fill", "white")
//     })
//     .catch((error) => console.log(error));