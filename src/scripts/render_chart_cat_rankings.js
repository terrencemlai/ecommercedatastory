import {
    select, 
    selectAll,
    csv, 
    max, 
    scaleLinear, 
    scaleBand, 
    axisLeft, 
    descending,
    easeLinear} from 'd3';

const width = 800;
const height = 700;
const margin = { top: 50, right: 50, bottom: 50, left: 200 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const yValue = d => d.category;
const xValue = d => d.pct_ecomm;
const formatLabel = d => Math.floor(d.pct_ecomm * 100)+'%';

const svg = select('#chart-02')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'category-totals')

select('#chart-02')
    .append('div')
    .attr('id', 'ranking-tooltip')
    .attr('style', 'position: fixed; opacity: 0;');

const renderTooltip = (d) => {
    return(`
        <div><strong>${d.category}</strong></div>
        <div><strong>Category E-comm Sales:</strong> $${Math.floor(d.cat_ecomm/1000000000)}B</div>
        <div><strong>Sector Total E-Comm Sales:</strong> $${Math.floor(d.sector_ecomm/1000000000)}B</div>
    `)
}




const renderChart = data => {
    selectAll('#category-totals g, #category-totals text').remove();
    const fade = 800;

    const yScale = scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.2)
    
    const xScale = scaleLinear()
        .domain([0, max(data, xValue)])
        .range([0, innerWidth])
        .nice();

    const plotArea = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
    
        
    const yAxis = axisLeft(yScale);

    plotArea.append('g').call(yAxis)
        .attr('id', 'yAxisLabels')
        .selectAll('.domain, .tick line').remove();

    select('#category-totals')
        .append('text')
            .text(`Source: US Census Bureau Estimated Annual U.S. Electronic Shopping and Mail-Order Houses - E-commerce Sales by Merchandise Line`)
            .attr('class', 'caption')
            .style('fill', 'gray')
            .style('font-size', '0.8em')
            .attr('transform', `translate(${margin.left}, ${height - margin.bottom + 25})`)
    
    const bars =  plotArea.selectAll('rect').data(data, d => d.category);

    bars
        .enter().append('rect')
            .attr('x', d => xScale(0))
            .attr('height', yScale.bandwidth())
            .attr('y', (d, i) => yScale(yValue(d)))
            .attr('width', 0)
            .attr('class', 'ranking-bars')
        .on('mouseover', function(d) {
            select('#ranking-tooltip')
                .style('opacity', 1)
                .style("top",  event.target.getBoundingClientRect().y +  "px")
                .style('left', event.target.getBoundingClientRect().x + event.target.getBoundingClientRect().width + 40 + 'px')
                .html(renderTooltip(d))
            })
        .on('mouseout', function() {
            select('#ranking-tooltip')
                .style('opacity', 0)
            })
        .transition().duration(fade)
            .ease(easeLinear)
            .attr('x', d => xScale(0))
            .attr('y', d => yScale(yValue(d)))
            .attr('height', yScale.bandwidth())
            .attr('width', d => xScale(xValue(d)))
            
            
    const labels = plotArea.selectAll('text').data(data, d=> d.category)

    labels
        .enter().append('text')
            .attr('class', 'bar-labels')
            .attr('x', d => xScale(0))
            .attr('y', d => yScale(yValue(d)))
            .attr('dy', '3%' )
            .text(formatLabel)
        .transition().duration(fade)
            .ease(easeLinear)
            .attr('x', d => xScale(xValue(d))+10)
            .attr('y', d => yScale(yValue(d)))
};


export const reRenderChart = (data) => {
    const fade = 800;
    
    const yScale = scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.2)
    
    const xScale = scaleLinear()
        .domain([0, max(data, xValue)])
        .range([0, innerWidth])
        .nice();

    selectAll('.ranking-bars').data(data, d=>d.category)
        .transition().duration(fade)
        .attr('y', (d, i) => yScale(yValue(d)))
        .attr('width', d => xScale(xValue(d)))

    const yAxis = axisLeft(yScale);

    select('#yAxisLabels')
        .transition().duration(fade)
        .call(yAxis)
        .selectAll('.domain, .tick line').remove();

    selectAll('.bar-labels').data(data, d=>d.category)
        .transition().duration(fade)
        .attr('x', d => xScale(xValue(d)) + 10)
        .attr('y', d => yScale(yValue(d)))
        .text(formatLabel)
}


export const categoryRankings = () => {
    csv('./src/data/data-categories.csv').then(data => {
        data.forEach(d => {
            d.year = +d.year;
            d.cat_total = +d.cat_total * 1000000;
            d.cat_ecomm = +d.cat_ecomm * 1000000;
            d.sector_total = +d.sector_total * 1000000;
            d.sector_ecomm = +d.sector_ecomm * 1000000;
            d.pct_total = d.cat_total/d.sector_total;
            d.pct_ecomm = d.cat_ecomm/d.sector_ecomm;
        })

        const filterData = (year) => {
            return (
                data.filter(d => {return  d.year === year && d.category !== 'Nonmerchandise'})
                .sort((a,b) => descending(a.pct_ecomm, b.pct_ecomm))
            )
        };

        let year = 2000;
        renderChart(filterData(2000));
        
        select('#category-totals')
            .append('text')
                .text(`% of Industry Share in ${year}`)
                .attr('id', 'year-label')
                .attr('transform', `translate(${margin.left}, ${margin.top - 5})`)

        const loopYears = () => {
            year++;
            if (year === 2017) { 
                clearInterval(intervals); 
                svg.append('text')
                    .attr('x', width-margin.right)
                    .attr('y', margin.top)
                    .attr('id', 'replay-button')
                    .text('[Replay]')
                    .on('click', () => {
                        categoryRankings();
                    })
            }

        select('#year-label')
            .text(`% of Industry Share in ${year}`)
            .transition().duration(300);

        reRenderChart(filterData(year))
        }

        const intervals = setInterval(loopYears, 800);
    })
}
    