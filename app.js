// const express = require('express');
// //const helmet = require('helmet');
// const cors = require('cors');
// //const morgan = require('morgan');
// //const path = require('path');

// const authRoutes = require('./routes/auth');
// const collectionRoutes = require('./routes/collection');
// const sortingRoutes = require('./routes/sorting');
// const washingRoutes = require('./routes/washing');
// const productionRoutes = require('./routes/production');
// const machineRoutes = require('./routes/machine');
// const dieRoutes = require('./routes/die');



// const errorHandler = require('./middleware/errorHandler');


// const app = express();

// //app.use(helmet());
// app.use(cors());
// app.use(cors({
//   origin: 'https://admin-leafplus.ibis.com.np', // frontend URL
//   methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.options(/.*/, cors());
// app.use(express.json());
// //app.use(express.urlencoded({ extended: true }));
// //app.use(morgan('dev'));

// // expose uploaded files (signatures/photos)
// //app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// // routes
// app.use('/api/auth', authRoutes);
// app.use('/api/collections', collectionRoutes);
// app.use("/api/users", require("./routes/userRoutes"));
// app.use('/api/sorting', sortingRoutes);
// app.use('/api/washing', washingRoutes);
// app.use('/api/production', productionRoutes);
// app.use('/api/machines', machineRoutes);
// app.use('/api/dies', dieRoutes);

// app.get('/', (req, res) => res.json({ message: 'Leaf Plus Backend API' }));
// // Catch invalid routes
// app.all(/.*/, (req, res) => {
//   res.status(404).json({
//     success: false,
//     title: 'Route Not Found',
//     message: `No route matches ${req.originalUrl}`,
//   });
// });
// // centralized error handler
// app.use(errorHandler);

// module.exports = app;


const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const collectionRoutes = require('./routes/collection');
const sortingRoutes = require('./routes/sorting');
const washingRoutes = require('./routes/washing');
const productionRoutes = require('./routes/production');
const machineRoutes = require('./routes/machine');
const dieRoutes = require('./routes/die');
const packagingRoutes = require("./routes/packagingRoutes");
const gunRoutes = require('./routes/gunRoutes');
const leafRoutes = require("./routes/leaf");
require("./models/Production");
const productRoute = require("./routes/productRoutes");


const errorHandler = require('./middleware/errorHandler');

const app = express();

// Safe CORS configuration
const allowedOrigins = [
  'https://admin-leafplus.ibis.com.np',
  'https://factory-leafplus.ibis.com.np',
  'http://127.0.0.1:5500' // live frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // allow live frontend
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);

    // allow any localhost port dynamically
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }

    // otherwise block
    callback(new Error(`CORS policy does not allow access from ${origin}`), false);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // if you plan to use cookies/auth headers
}));

// handle preflight requests for all routes
//app.options(/.*/, cors());

app.use(express.json());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/collectorUser", require("./routes/collectorUserRoutes"));
app.use('/api/sorting', sortingRoutes);
app.use('/api/guns', gunRoutes);
app.use('/api/washing', washingRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/dies', dieRoutes);
app.use("/api/packaging", packagingRoutes);
app.use("/api/leafs", leafRoutes);
app.use("/api/products", productRoute);
// root route
app.get('/', (req, res) => res.json({ message: 'Leaf Plus Backend API' }));

// catch invalid routes
app.all(/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    title: 'Route Not Found',
    message: `No route matches ${req.originalUrl}`,
  });
});

// centralized error handler
app.use(errorHandler);

module.exports = app;
