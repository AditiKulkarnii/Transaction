import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [month, setMonth] = useState("March");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [month, search, page]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('https://transaction-server.vercel.app/list-transactions', {
        params: { month, search, page, perPage }
      });
      setTransactions(response.data.transactions);
      setTotalTransactions(response.data.total); // Assuming the API returns the total number of transactions
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const isLastPage = page * perPage >= totalTransactions;

  const truncateDescription = (description) => {
    const words = description.split(' ');
    if (words.length > 15) {
      return words.slice(0, 15).join(' ') + '...';
    }
    return description;
  };

  const handleViewStats = () => {
    // Handle click to view stats
    navigate("/statistics");
  };


  return (
    <div className="min-h-screen bg-slate-300 flex flex-col items-center">
      <h1 className="text-3xl font-bold mt-8">Transaction Dashboard</h1>
      <div className="flex mt-6">
        <input
          type="text"
          placeholder="Search transaction"
          value={search}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 rounded"
        />
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
        <button
          onClick={handleViewStats}
          className="ml-4 p-2 bg-blue-500 text-white rounded"
        >
          View Stats
        </button>
      </div>
      <div className="mt-6 w-full max-w-4xl bg-yellow-100 p-6 shadow-md rounded">
        <table className="min-w-full bg-white divide-y divide-gray-200 shadow-xl">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Sold</th>
              <th className="py-2 px-4 border-b">Image</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td className="py-2 px-4 border-b">{transaction.id}</td>
                <td className="py-2 px-4 border-b">{transaction.title}</td>
                <td className="py-2 px-4 border-b">
                  {truncateDescription(transaction.description)}
                </td>
                <td className="py-2 px-4 border-b">{transaction.price}</td>
                <td className="py-2 px-4 border-b">{transaction.category}</td>
                <td className="py-2 px-4 border-b">{transaction.sold ? "Yes" : "No"}</td>
                <td className="py-2 px-4 border-b">
                  <img src={transaction.image} alt="transaction" className="h-15 w-15 object-cover shadow-xl" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center mt-4">
          <button
            onClick={handlePreviousPage}
            className="p-2 bg-red-500 text-white rounded mr-2"
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            className="p-2 bg-red-500 text-white rounded"
            disabled={isLastPage}
          >
            Next
          </button>
          <span className="ml-4">Page No: {page}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
