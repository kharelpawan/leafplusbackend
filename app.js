const express = require('express');
//const helmet = require('helmet');
//const cors = require('cors');
//const morgan = require('morgan');
//const path = require('path');

const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collection');
const sortingRoutes = require('./routes/sorting');
const washingRoutes = require('./routes/washing');


const errorHandler = require('./middleware/errorHandler');


const app = express();

//app.use(helmet());
//app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
//app.use(morgan('dev'));

// expose uploaded files (signatures/photos)
//app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use('/api/sorting', sortingRoutes);
app.use('/api/washing', washingRoutes);


app.get('/', (req, res) => res.json({ message: 'Leaf Plus Backend API' }));

// centralized error handler
app.use(errorHandler);

module.exports = app;
