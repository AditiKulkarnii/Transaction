
import axios from 'axios';
import Transaction from '../schema/Transaction.js';
import moment from 'moment-timezone'; 

//initialize database with 3rd party api
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


//listing the transactions with pagination and search by month
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

     
      const pipeline = [
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
            dateOfSale: 1,
            
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
         
          $match: {
            month: monthNumber + 1 
          }
        },
        {
         
          $match: query
        },
        {
         
          $skip: (page - 1) * perPage
        },
        {
          $limit: perPage
        }
      ];

      try {
        
        const transactions = await Transaction.aggregate(pipeline).exec();
       
        const totalPipeline = [
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
              dateOfSale: 1
            }
          },
          {
           
            $match: {
              month: monthNumber + 1
            }
          },
          {
           
            $match: query
          },
          {
           
            $count: "total"
          }
        ];

        const totalResult = await Transaction.aggregate(totalPipeline).exec();
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

       
        res.status(200).json({ transactions, total });
      } catch (error) {
        console.error("Failed to list transactions", error);
        res.status(500).json({ message: 'Failed to list transactions', error: error.message });
      }
    } else {
    
      const transactions = await Transaction.find(query)
        .skip((page - 1) * perPage)
        .limit(perPage);

      
      const total = await Transaction.countDocuments(query);

     
      res.status(200).json({ transactions, total });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to list transactions', error: error.message });
  }
};
