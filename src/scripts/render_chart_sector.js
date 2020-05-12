import {
    select, 
    csv, 
    max, 
    scaleLinear, 
    scaleBand, 
    axisLeft, 
    axisBottom, 
    format, 
    event,
    easeLinear} from 'd3';

const width = 800;
const height = 400;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;


const svg = select('#chart-01')
    .append('svg')
    .attr("width", width)
    .attr("height", height)
    .attr("id", "sector-totals")

select('#chart-01')
    .append('div')
    .attr('id', 'sector-tooltip')
    .attr('style', 'position: fixed; opacity: 0;');

const renderTooltip = (d) => {
    return(`
        <div><strong>Year:</strong> ${d.year}</div>
        <div><strong>Industry Sales:</strong> $${Math.floor(d.eshop_total/1000000000)}B</div>
        <div><strong>US Sales:</strong> $${Math.floor(d.us_total/1000000000)}B</div>
    `)
}

const renderChart = data => {
    const svg = select('#sector-totals');
    const xValue = d => d.year;
    const yValue = d => d.pct_total;
    
    const xScale = scaleBand()
        .domain(data.map(xValue))
        .range([0, innerWidth])
        .padding(0.2)
    
    const yScale = scaleLinear()
        .domain([0, max(data, yValue)])
        .range([innerHeight, 0])
        .nice();

    const plotArea = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
    
    const xAxis = axisBottom(xScale);

    plotArea.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`)
        .selectAll('.domain, .tick line').remove();
        
    const yAxis = axisLeft(yScale)
        .tickFormat(format('.0%'))
        .tickSize(-innerWidth);

    plotArea.append('g').call(yAxis)
        .select('.domain').remove();

    select('#sector-totals')
    .append('text')
        .text(`% of Total Annual U.S. Retail Revenue by Year`)
        .style('fill', 'gray')
        .attr('id', 'sector-axis-label')
        .attr('transform', `translate(${margin.left}, ${margin.top - 10})`)
    
    select('#sector-totals')
    .append('text')
        .text(`Source: US Census Bureau Estimated Annual U.S. Retail Trade Sales - Total and E-commerce: 1998-2017`)
        .attr('class', 'caption')
        .style('fill', 'gray')
        .style('font-size', '0.8em')
        .attr('transform', `translate(${margin.left}, ${height - margin.bottom + 45})`)

    
    plotArea.selectAll('rect').data(data)
    .enter()
        .append('rect')
        .attr('x', d => xScale(xValue(d)))
        .attr('y', d => yScale(0) - yScale(yValue(d)))
        .attr('width', xScale.bandwidth())
        .attr('height', d =>  yScale(yValue(d)))
        .on('mouseover', function(d) {
            select('#sector-tooltip')
                .style('opacity', 1)
                .style("top",  event.target.getBoundingClientRect().y - 100 + "px")
                .style('left', event.target.getBoundingClientRect().x - 70 + 'px')
                .html(renderTooltip(d))
            })
        .on('mouseout', function() {
            select('#sector-tooltip')
                .style('opacity', 0)
            })
        .transition()
            .duration(800)
            .ease(easeLinear)
            .attr('x', d => xScale(xValue(d)))
            .attr('y', d => yScale(yValue(d)))
            .attr('width', xScale.bandwidth())
            .attr('height', d => yScale(0) - yScale(yValue(d)))


};


export const sectorTotals = () => {
    csv('./src/assets/data-sector.csv').then(data => {
        data.forEach(d => {
            d.eshop_total = +d.eshop_total * 1000000;
            d.eshop_ecomm = +d.eshop_ecomm * 1000000;
            d.us_total = +d.us_total * 1000000;
            d.us_ecomm = +d.us_ecomm * 1000000;
            d.pct_total = d.eshop_total/d.us_total;
        })

        renderChart(data);
    })
}

