import express from 'express';
import{ initializeDatabase, listTransactions } from '../Controllers/dataController.js';

const DataRoutes = express.Router();

// Initialize database
DataRoutes.get('/initialize-database', initializeDatabase);
// List transactions
DataRoutes.get('/list-transactions', listTransactions);

export default DataRoutes;
