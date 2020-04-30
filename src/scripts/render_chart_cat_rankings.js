import {
    select, 
    selectAll,
    csv, 
    max, 
    scaleLinear, 
    scaleBand, 
    axisLeft, 
    descending,
    format, 
    easeLinear} from 'd3';

const width = 800;
const height = 700;
const margin = { top: 50, right: 50, bottom: 50, left: 200 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;
const yValue = d => d.category;
const xValue = d => d.pct_ecomm;
const formatLabel = d => Math.floor(d.pct_ecomm * 100)+'%';

const svg = select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'category-totals')


const renderChart = data => {
    const fade = 500;
    const year = data[0].year;

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
    
    const bars =  plotArea.selectAll('rect').data(data, d => d.category);

    bars
        .enter().append('rect')
            .attr('x', d => xScale(0))
            .attr('height', yScale.bandwidth())
            .attr('y', (d, i) => yScale(yValue(d)))
            .attr('width', 0)
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
    const fade = 300;
    
    const yScale = scaleBand()
        .domain(data.map(yValue))
        .range([0, innerHeight])
        .padding(0.2)
    
    const xScale = scaleLinear()
        .domain([0, max(data, xValue)])
        .range([0, innerWidth])
        .nice();

    selectAll('rect').data(data, d=>d.category)
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
    csv('./src/assets/data-categories.csv').then(data => {
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
                .text(`% Share in ${year}`)
                .attr('id', 'year-label')
                .attr('transform', `translate(${margin.left}, ${margin.top - 5})`)

        const loopYears = () => {
            year++;
            if (year === 2017) { clearInterval(intervals); }

            select('#year-label')
                .text(`% Share in ${year}`)
                .transition().duration(300);

            reRenderChart(filterData(year))
        }

        const intervals = setInterval(loopYears, 600);
    })
}
    