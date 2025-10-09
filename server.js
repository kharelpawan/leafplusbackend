// const express = require('express');
// const app = express();


const dotenv = require('dotenv');
const app = require('./app');
const connectDB = require('./config/dbConnection');
dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to the database
const port = process.env.PORT; // Use PORT from .env or default to 3000

// app.use(express.json()); // Middleware to parse JSON bodies
// app.use("/api/v1/users", require("./routes/userRoutes"));
//  app.listen(port, () => {
//    console.log(`Server is running on http://localhost:${port}`);
//  }); 
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://0.0.0.0:${port}`);
});