import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Statistics = () => {
  const [month, setMonth] = useState('March');
  const [stats, setStats] = useState({ totalSale: 0, totalSoldItems: 0, totalNotSoldItems: 0 });
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#D65DB1', '#FF6F91', '#FF9671', '#FFC75F'];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [month]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statisticsResponse, barChartResponse, pieChartResponse] = await Promise.all([
        axios.get('https://transaction-server.vercel.app/statistics', { params: { month } }),
        axios.get('https://transaction-server.vercel.app/bar-chart', { params: { month } }),
        axios.get('https://transaction-server.vercel.app/pie-chart', { params: { month } }),
      ]);

      setStats(statisticsResponse.data);
      setBarData(barChartResponse.data);
      setPieData(pieChartResponse.data);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Error fetching data');
      console.error('Error fetching data:', error);
    }
  };

  const handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    setMonth(selectedMonth);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 border border-gray-300 rounded">
          <p>{`${payload[0].payload._id}`} <span> {` :${payload[0].payload.count}`}</span> </p>
          
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Transactions Statistics</h1>
      <div className="mb-4">
        <label htmlFor="month" className="mr-2">Select Month:</label>
        <select
          value={month}
          onChange={handleMonthChange}
          className="ml-4 p-2 border border-gray-300 rounded"
        >
          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="stats-box p-4 bg-yellow-100 rounded mb-4">
        <h2 className="text-xl font-semibold">Statistics - {month}</h2>
        <p>Total sale: {stats.totalSaleAmount}</p>
        <p>Total sold items: {stats.soldItemsCount}</p>
        <p>Total not sold items: {stats.notSoldItemsCount}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Transactions Bar Chart - {month}</h2>
        <BarChart width={600} height={300} data={barData} className="mx-auto">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Transactions Pie Chart - {month}</h2>
        <PieChart width={600} height={300} className="mx-auto">
          <Pie
            data={pieData}
            cx={300}
            cy={150}
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="count"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </div>
    </div>
  );
};

export default Statistics;
