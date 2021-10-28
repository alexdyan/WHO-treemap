import uid from './uid.js';

const width = 960;
const height = 570;
const x = d3.scaleLinear().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([0, height]);

const svg = d3.select("#svg1")
    .attr("viewBox", [0.5, -30.5, width, height + 30]);
const color = d3.scaleOrdinal(d3.schemePastel2)

async function main() {
    const data = await d3.json("WHO_YLL_Global_2.json");

    function treemap(data) {
        return d3.treemap()
        .size([width, height])
        // .tile(tile)
      (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));
    }

    let group = svg.append("g")
        .call(render, treemap(data));

    function render(group, root) {
        const node = group
            .selectAll("g")
            .data(root.children.concat(root))
            .join("g");

        node.filter(d => d === root ? d.parent : d.children)
            .attr("cursor", "pointer")
            .on("click", (event, d) => d === root ? zoomout(root) : zoomin(d));

        node.append("title")
            .text(d => d.data.name + "\n" + d3.format(d.value));

        node.append("rect")
            .attr("id", d => (d.leafUid = uid("leaf")).id)
            .attr("fill", d => d === root ? "#fff" : d.children ? color(d.data.name) : "#ddd")
            .attr("stroke", "#fff");

        node.append("clipPath")
            .attr("id", d => (d.clipUid = uid("clip")).id)
            .append("use")
            .attr("xlink:href", d => d.leafUid.href);

        node.append("text")
            .attr("clip-path", d => d.clipUid)
            .attr("font-weight", d => d === root ? "bold" : null)
            .selectAll("tspan")
            .data(d => (d=== root ? d.ancestors().reverse().map(d => d.data.name).join("/") : d.data.name.split(/(?=[A-Z][^A-Z])/g).concat(d3.format(d.value))))
            .join("tspan")
            .attr("x", 3)
            .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
            // .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            // .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
            .text(d => d);

        group.call(position, root);
}

function position(group, root) {
    group.selectAll("g")
        .attr("transform", d => d === root ? "translate(0,-30)" : `translate(${d.x0}, ${d.y0})`)
        .select("rect")
        .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
        .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
  }

  // When zooming in, draw the new nodes on top, and fade them in.
  function zoomin(d) {
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = svg.append("g").call(render, d);

    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    svg.transition()
        .duration(750)
        .call(t => group0.transition(t).remove()
          .call(position, d.parent))
        .call(t => group1.transition(t)
          .attrTween("opacity", () => d3.interpolate(0, 1))
          .call(position, d));
  }

  // When zooming out, draw the old nodes on top, and fade them out.
  function zoomout(d) {
    const group0 = group.attr("pointer-events", "none");
    const group1 = group = svg.insert("g", "*").call(render, d.parent);

    x.domain([d.parent.x0, d.parent.x1]);
    y.domain([d.parent.y0, d.parent.y1]);

    svg.transition()
        .duration(750)
        .call(t => group0.transition(t).remove()
          .attrTween("opacity", () => d3.interpolate(1, 0))
          .call(position, d))
        .call(t => group1.transition(t)
          .call(position, d.parent));
  }
}
main();
