import './styles/index.scss';
import { sectorTotals } from './scripts/render_chart_sector';
import { categoryRankings } from './scripts/render_chart_cat_rankings';
import { categoryGrowth } from './scripts/render_chart_cat_growth';


window.addEventListener("DOMContentLoaded", () => {

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
    
});