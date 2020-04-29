import './styles/index.scss';
import { select, csv, scaleLinear, max, scaleBand, axisLeft, axisBottom, format } from 'd3';
import { sectorTotals } from './scripts/render_chart_sector';

window.addEventListener("DOMContentLoaded", () => {

    sectorTotals();

    
  });