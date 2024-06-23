import express from 'express';
import { getStatistics, getPieChartData , getBarChartData, getCombinedData } from '../Controllers/statisticsControllers.js';

const StatRoutes = express.Router();

// Get statistics
StatRoutes.get('/statistics', getStatistics);
// Get pie chart data
StatRoutes.get('/pie-chart', getPieChartData);
// Get bar chart data
StatRoutes.get('/bar-chart', getBarChartData);
// Get combined data
StatRoutes.get('/combined-data', getCombinedData);

export default StatRoutes;