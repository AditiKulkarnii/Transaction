import Transaction from '../schema/Transaction.js';
import axios from 'axios';
import moment from 'moment-timezone';

// Get statistics
export const getStatistics = async (req, res) => {
    const { month } = req.query;
    
    try {
        const monthNumber = moment().month(month).month() + 1;

        const totalSaleAmount = await Transaction.aggregate([
            {
                $addFields: {
                    dateOfSale: {
                        $dateFromString: {
                            dateString: "$dateOfSale"
                        }
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$dateOfSale" },
                    price: 1
                }
            },
            { $match: { month: monthNumber } },
            { $group: { _id: null, total: { $sum: '$price' } } },
        ]);

        const soldItemsCount = await Transaction.aggregate([
            {
                $addFields: {
                    dateOfSale: {
                        $dateFromString: {
                            dateString: "$dateOfSale"
                        }
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$dateOfSale" },
                    sold: 1
                }
            },
            { $match: { month: monthNumber, sold: true } },
            { $count: "count" }
        ]);

        const notSoldItemsCount = await Transaction.aggregate([
            {
                $addFields: {
                    dateOfSale: {
                        $dateFromString: {
                            dateString: "$dateOfSale"
                        }
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$dateOfSale" },
                    sold: 1
                }
            },
            { $match: { month: monthNumber, sold: false } },
            { $count: "count" }
        ]);

        res.status(200).json({
            totalSaleAmount: totalSaleAmount[0] ? totalSaleAmount[0].total : 0,
            soldItemsCount: soldItemsCount[0] ? soldItemsCount[0].count : 0,
            notSoldItemsCount: notSoldItemsCount[0] ? notSoldItemsCount[0].count : 0,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get statistics', error: error.message });
    }
};

// Get bar chart data
export const getBarChartData = async (req, res) => {
    const { month } = req.query;

    try {
        const monthNumber = moment().month(month).month() + 1;
        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity },
        ];

        const barChartData = await Promise.all(
            priceRanges.map(async (range) => {
                const count = await Transaction.aggregate([
                    {
                        $addFields: {
                            dateOfSale: {
                                $dateFromString: {
                                    dateString: "$dateOfSale"
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            month: { $month: "$dateOfSale" },
                            price: 1
                        }
                    },
                    {
                        $match: {
                            month: monthNumber,
                            price: { $gte: range.min, $lt: range.max }
                        }
                    },
                    { $count: "count" }
                ]);

                return { range: range.range, count: count[0] ? count[0].count : 0 };
            })
        );

        res.status(200).json(barChartData);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get bar chart data', error: error.message });
    }
};

// Get pie chart data
export const getPieChartData = async (req, res) => {
    const { month } = req.query;

    try {
        const monthNumber = moment().month(month).month() + 1;

        const pieChartData = await Transaction.aggregate([
            {
                $addFields: {
                    dateOfSale: {
                        $dateFromString: {
                            dateString: "$dateOfSale"
                        }
                    }
                }
            },
            {
                $project: {
                    month: { $month: "$dateOfSale" },
                    category: 1
                }
            },
            { $match: { month: monthNumber } },
            { $group: { _id : '$category', count: { $sum: 1 } } },
        ]);

        res.status(200).json(pieChartData);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get pie chart data', error: error.message });
    }
};

// Get combined data
export const getCombinedData = async (req, res) => {
    const { month } = req.query;

    try {
        const [statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
            axios.post(`http://localhost:5000/api/statistics`, { month }),
            axios.post(`http://localhost:5000/api/bar-chart`, { month }),
            axios.post(`http://localhost:5000/api/pie-chart`, { month }),
        ]);

        res.status(200).json({
            statistics: statisticsResponse.data,
            barChart: barChartResponse.data,
            pieChart: pieChartResponse.data,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get combined data', error: error.message });
    }
};
