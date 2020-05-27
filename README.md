![header screenshot](/src/images/header-screenshot.png "header screenshot")

## [Live Link](https://terrencemlai.github.io/ecommercedatastory/)

## Overview
“Rise of E-commerce and Mail-Order Houses in the US” is an interactive data story that highlights descriptive trends of annual e-commerce revenue over the past two decades.  It offers dynamic visualizations of economic data from the [US Census](https://www.census.gov/data/tables/2017/econ/e-stats/2017-e-stats.html) for the Electronic Shopping and Mail-Order House industry (NAICS Code 4541), which includes prominent companies like Amazon, eBay, Wayfair, QVC, and Expedia.

## Usage

The data story is a single-page application.  Scroll down to continue viewing content and charts.  Each graph offers different interactive opportunities, such as tooltips on mouseover or customizable filters.  Have fun exploring!

## Technologies

* JavaScript (ES6)
* D3.js (5.16.0)
* Webpack (4.43.0)
* HTML5
* CSS3

A challenge for this project was to achieve interactivity and data refreshes without additional libraries like jQuery and React.

## Features

* Charts illustrate annual trends with D3.  They wait to render chart until user scrolls to element.  They do not re-render again unless page refreshes or user prompts with filtering or replay. 

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

* Graphs display tooltips to view supplemental data and metrics when users mouse over bars.

   ![bar chart tooltips](/src/images/ecommdatastory-bar-tooltips-275.gif "bar chart tooltips")


* Data story utilizes animation to dynamically reflect changes in merchandise category rankings, starting with year 2000.  The chart updates rankings and title to reflect each year.  The animation stops when it reaches the final year (2017) and displays “Replay” button to animate again.

   ![bar chart animation](/src/images/ecommdatastory-bar-animation-275.gif "bar chart animation")

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

* The line chart showing each category's growth updates data and charts automatically as user filters merchandise categories.

   ![line chart filters](/src/images/ecommdatastory-lines-filtertrans-275.gif "line chart filters")

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

* Adheres to data visualization best practices for color palettes and minimal labeling.

## Future Features

* Display tooltip(s) for multi-line chart
* Export or save chart
* Change speed of ranking animation
* Pause and resume ranking animation