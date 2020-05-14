# E-commerce Data Story


## Overview
“Rise of E-commerce and Mail-Order Houses in the US” is an interactive data story that highlights descriptive trends of annual e-commerce revenue over the past two decades.  It offers dynamic visualizations of economic data from the [US Census](https://www.census.gov/data/tables/2017/econ/e-stats/2017-e-stats.html) for the Electronic Shopping and Mail-Order House industry (NAICS Code 4541), which includes prominent companies like Amazon, eBay, Wayfair, QVC, and Expedia.

## How to Interact
<img src="https://raw.githubusercontent.com/terrencemlai/ecommercedatastory/master/src/images/ecommdatastory-bar-tooltips.gif" width="30%"/>
<img src="https://raw.githubusercontent.com/terrencemlai/ecommercedatastory/master/src/images/ecommdatastory-bar-animation.gif" width="30%"/>
<img src="https://raw.githubusercontent.com/terrencemlai/ecommercedatastory/master/src/images/ecommdatastory-lines-filters.gif" width="30%"/>



The data story is a single-page application.  Scroll down to continue viewing content and charts.  Each graph offers different interactive opportunities, such as tooltips on mouseover or customizable filters.  Have fun exploring!

## Technologies

* JavaScript
* D3.js
* HTML5
* CSS3

A challenge for this project was to achieve interactivity and data refreshes without additional libraries like JQuery and React.


## Features and MVP's
* Illustrates annual trends with D3
* Displays tooltips for users to view supplemental data and metrics
* Animates changing merchandise category ranks over 20 years, with a button to replay the animation
* Updates data and charts automatically as user filters merchandise categories
* Adheres to data visualization best practices for color palettes and minimal labeling



## Sample Code Snippets
Wait to render chart until user scrolls to element, but do not re-render again unless page refreshes or user prompts with filtering or replay.

```javascript
//Part of anonymous function in index.js triggered on DOMContentLoaded
const isInViewport = (ele) => {
    const bounding = ele.getBoundingClientRect();
    return(
        bounding.top + 150 <= (window.innerHeight || document.documentElement.clientHeight)
    )
}

const totals = document.querySelector('#sector-totals');
const rankings = document.querySelector('#category-totals');
const growth = document.querySelector('#category-growth');

let totalsLoaded = false;
let rankingsLoaded = false;
let growthLoaded = false;

window.addEventListener('scroll', function (event) {
    if (!totalsLoaded && isInViewport(totals)) {
        sectorTotals();
        totalsLoaded = true;
    }

    if (!rankingsLoaded && isInViewport(rankings))  {
        categoryRankings();
        rankingsLoaded = true;
    }

    if (!growthLoaded && isInViewport(growth)) {
        categoryGrowth();
        growthLoaded = true;
    }
})
```

Animate changes in merchandise category rankings, starting with year 2000.  Update rankings and title to reflect the new year.  Stop animation when year is 2017 and display “Replay” button to animate again.

```javascript
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
        )};

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
            } else {
                select('#year-label')
                    .text(`% of Industry Share in ${year}`)
                    .transition().duration(300);
    
                reRenderChart(filterData(year))
            }
        }

        const intervals = setInterval(loopYears, 500);
    })
}
```

Update line chart with appropriate transitions when user changes merchandise category filters.

```javascript
//Part of re-render function
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
        .attr('d', d => lineGenerator(d.values));

lines
    .exit()
    .transition().duration(500)
        .attr('d', d => flatlineGenerator(d.values))
        .style('opacity', 0.5)
    .remove();
```