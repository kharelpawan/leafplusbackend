// const express = require('express');
// const app = express();


const dotenv = require('dotenv');
const app = require('./app');
// const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/dbConnection');
dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to the database
const port = process.env.PORT; // Use PORT from .env or default to 3000

// app.use(express.json()); // Middleware to parse JSON bodies
// app.use("/api/v1/users", require("./routes/userRoutes"));
// app.use(errorHandler); // Custom error handling middleware
 app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
 }); 