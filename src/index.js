import './styles/index.scss';
import { sectorTotals } from './scripts/render_chart_sector';
import { categoryRankings } from './scripts/render_chart_cat_rankings';
import { categoryGrowth } from './scripts/render_chart_cat_growth';


window.addEventListener("DOMContentLoaded", () => {

  sectorTotals();
  categoryRankings();
  categoryGrowth();
    
});