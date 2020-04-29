import { csv } from 'd3';

csv('../assets/data-sector.csv').then(data => {
    console.log(data);
})