// controllers/transactionController.js
import axios from 'axios';
import Transaction from '../schema/Transaction.js';
import moment from 'moment-timezone'; // Import moment-timezone for date manipulation

// Initialize database with data from third-party API
export const initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;
    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initialize database', error: error.message });
  }
};

// List transactions with search and pagination

export const listTransactions = async (req, res) => {
  try {
    let { month, page = 1, perPage = 10, search = '' } = req.query;
    
    page = parseInt(page);
    perPage = parseInt(perPage);

    const query = {};

    if (search) {
      const isNumeric = !isNaN(search);
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { description: { $regex: new RegExp(search, 'i') } },
        { category: { $regex: new RegExp(search, 'i') } }
      ];
      if (isNumeric) {
        query.$or.push({ price: Number(search) });
      }
    }

    if (month) {
     
      const monthNumber = moment().month(month).month();

      // Construct an aggregation pipeline to match transactions within the specified month, ignoring the year
      const pipeline = [
        {
          // Convert dateOfSale to a date if it's not already
          $addFields: {
            dateOfSale: {
              $dateFromString: {
                dateString: "$dateOfSale"
              }
            }
          }
        },
        {
          // Project the month from the dateOfSale field
          $project: {
            month: { $month: "$dateOfSale" },
            dateOfSale: 1,
            // Include other fields as needed
            title: 1,
            description: 1,
            category: 1,
            price: 1,
            sold: 1,
            image: 1,
            id: 1
          }
        },
        {
          // Match documents where the month matches the specified month
          $match: {
            month: monthNumber + 1 // MongoDB $month operator returns 1-12
          }
        },
        {
          // Match documents based on the search query if provided
          $match: query
        },
        {
          // Pagination stage
          $skip: (page - 1) * perPage
        },
        {
          $limit: perPage
        }
      ];

      try {
        // Use the aggregation pipeline to find the matching transactions
        const transactions = await Transaction.aggregate(pipeline).exec();
        // console.log(transactions);

        // Count the total number of documents that match the query for the specified month
        const totalPipeline = [
          {
            // Convert dateOfSale to a date if it's not already
            $addFields: {
              dateOfSale: {
                $dateFromString: {
                  dateString: "$dateOfSale"
                }
              }
            }
          },
          {
            // Project the month from the dateOfSale field
            $project: {
              month: { $month: "$dateOfSale" },
              dateOfSale: 1
            }
          },
          {
            // Match documents where the month matches the specified month
            $match: {
              month: monthNumber + 1
            }
          },
          {
            // Match documents based on the search query if provided
            $match: query
          },
          {
            // Count the total number of documents
            $count: "total"
          }
        ];

        const totalResult = await Transaction.aggregate(totalPipeline).exec();
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        // Send the response
        res.status(200).json({ transactions, total });
      } catch (error) {
        console.error("Failed to list transactions", error);
        res.status(500).json({ message: 'Failed to list transactions', error: error.message });
      }
    } else {
      // Find the transactions with pagination if month is not provided
      const transactions = await Transaction.find(query)
        .skip((page - 1) * perPage)
        .limit(perPage);

      // Count the total number of documents that match the query
      const total = await Transaction.countDocuments(query);

      // Send the response
      res.status(200).json({ transactions, total });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to list transactions', error: error.message });
  }
};
