import {
    select, 
    selectAll,
    csv, 
    scaleLinear, 
    scaleBand, 
    axisLeft, 
    axisBottom, 
    line,
    curveBasis,
    extent,
    event,
    nest,
    scaleOrdinal,
    format} from 'd3';
    
const width = 800;
const height = 400;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;


const svg = select('#chart-03')
    .append('svg')
    .attr("width", width)
    .attr("height", height)
    .attr("id", "category-growth")

const categories = {
    'Apparel' : true, 
    'Other Merchandise' : false,
    'Furniture and Home Furnishings' : true,
    'Electronics and Appliances': false,
    'Personal Care': false,
    'Computer and Cell Phones': false,
    'Sporting Goods': false,
    'Toys, Hobby, and Games': false,
    'Books': false,
    'Computer Software': true,
    'Food, Beverage and Alcohol': false,
    'Audio and Video Recordings': false,
    'Office Supplies': false,
    'Jewelry': false,
}

const colorScale = scaleOrdinal()
    .domain(Object.keys(categories))
    .range(["#49006a","#700174","#99037c","#c01788","#e03e98","#f369a3","#f993b0","#4394c3","#1a7db6","#0667a1","#045281","#023858"]);

const R = 6;

let mainData;

const toggleFilterBackground = (category) => {
    if (categories[category]) {
        return `${colorScale(category)}`;
    } else {
        return 'white';
    }
}

const toggleFilterTextColor = (category) => {
    if (categories[category]) {
        return 'white';
    } else {
        return 'inherit';
    }
}

select('#chart-03')
    .append('div')
    .attr('class', 'filter-container')

Object.keys(categories).map( category => {
    select('#chart-03 .filter-container').append('span')
        .attr('class','filter')
        .attr('id', category)
        .text(category)
        .style('background-color', toggleFilterBackground(category))
        .style('color', toggleFilterTextColor(category))
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .on('click', () => {
            categories[category] = !categories[category];
            const filteredData = 
                    mainData.filter(d => {return categories[d.category]})
            ;
            reRenderChart(filteredData);
   
            select(event.currentTarget).style('background-color' , toggleFilterBackground(category));
            select(event.currentTarget).style('color' , toggleFilterTextColor(category));
        })
})

select('#chart-03')
    .append('p')
        .text(`Source: US Census Bureau Estimated Annual U.S. Electronic Shopping and Mail-Order Houses - E-commerce Sales by Merchandise Line`)
        .attr('class', 'caption')
        .style('color', 'gray')
        .style('text-align', 'center')
        .style('font-size', '10px')


const yAxisTickFormat = number =>
        format('$.0s')(number).replace('G','B');


const renderChart = data => {
    const xValue = d => d.year;
    const yValue = d => d.cat_ecomm;
    
    const xScale = scaleBand()
        .domain(data.map(xValue))
        .range([0, innerWidth])
        .padding(0.2);

    const yScale = scaleLinear()
        .domain(extent(data, yValue))
        .range([innerHeight, 0])
        .nice();

    const lineGenerator = line()
        .x(d => xScale(xValue(d))+18)
        .y(d => yScale(yValue(d)))
        .curve(curveBasis);
    
    const flatlineGenerator = line()
        .x(d => xScale(xValue(d))+18)
        .y(d => yScale(0))
        .curve(curveBasis);
    
    const plotArea = svg.append('g')
        .attr('id', 'plotarea-growth')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    const xAxis = axisBottom(xScale);
    
    plotArea.append('g').call(xAxis)
        .attr('transform', `translate(0, ${innerHeight})`)
        .selectAll('.domain, .tick line').remove();

    const yAxis = axisLeft(yScale)
        .ticks(5)
        .tickFormat(yAxisTickFormat)
        .tickSize(-innerWidth);
    
    plotArea.append('g').call(yAxis)
        .attr('id', 'yAxisLabels-growth')
        .select('.domain').remove();
    
    const nested = nest()
        .key(d => d.category)
        .entries(data);

    select('#category-growth')
    .append('text')
        .text(`Annual E-commerce Sales (Billions) by Category and Year`)
        .style('fill', 'gray')
        .attr('id', 'growth-axis-label')
        .attr('transform', `translate(${margin.left}, ${margin.top - 15})`)

    const lines = plotArea.selectAll('.line-path').data(nested, d=> d.key);

    lines
        .enter().append('path')
            .attr('class', 'line-path')
            .attr('stroke', d => colorScale(d.key))
            .attr('d', d => flatlineGenerator(d.values))
        .on('mouseover', function() {
                select(".mouse-line")
                  .style("opacity", "1");
                selectAll(".mouse-per-line circle")
                  .style("opacity", "1");
                selectAll(".mouse-per-line text")
                  .style("opacity", "1");
              })
        .transition().delay(200)
              .attr('d', d => lineGenerator(d.values));

};


const reRenderChart = data => {
    const xValue = d => d.year;
    const yValue = d => d.cat_ecomm;

    const xScale = scaleBand()
        .domain(data.map(xValue))
        .range([0, innerWidth])
        .padding(0.2);

    const yScale = scaleLinear()
        .domain(extent(data, yValue))
        .range([innerHeight, 0])
        .nice();

    const lineGenerator = line()
        .x(d => xScale(xValue(d))+18)
        .y(d => yScale(yValue(d)))
        .curve(curveBasis);
    
    const flatlineGenerator = line()
        .x(d => xScale(xValue(d))+18)
        .y(d => yScale(0))
        .curve(curveBasis);

    const yAxis = axisLeft(yScale)
        .ticks(5)
        .tickFormat(yAxisTickFormat)
        .tickSize(-innerWidth);
    
    select('#yAxisLabels-growth')
        .transition().duration(300)
        .call(yAxis)
        .select('.domain').remove();
    
    const nested = nest()
        .key(d => d.category)
        .entries(data);
    
    const plotArea = select('#plotarea-growth')
    const lines = plotArea.selectAll('.line-path').data(nested, d => d.key);

    lines
        .enter().append('path')
            .attr('class', 'line-path')
            .attr('stroke', d => colorScale(d.key))
            .attr('d', d => flatlineGenerator(d.values))
        .merge(lines)
            .transition().duration(300)
            .attr('d', d => lineGenerator(d.values))
        ;

    lines
        .exit()
        .transition().duration(500)
            .attr('d', d => flatlineGenerator(d.values))
            .style('opacity', 0.5)
        .remove();
    
};








export const categoryGrowth = () => {
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

        mainData = data;

        const filterData = () => {
            return (
                data.filter(d => {return categories[d.category]})
            )
        };

        renderChart(filterData());
    })
}
