const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const collectorUserRoutes = require('./routes/collectorUserRoutes');
const collectionRoutes = require('./routes/collection');
const sortingRoutes = require('./routes/sorting');
const washingRoutes = require('./routes/washing');
const productionRoutes = require('./routes/production');
const machineRoutes = require('./routes/machine');
const dieRoutes = require('./routes/die');
const packagingRoutes = require("./routes/packagingRoutes");
const gunRoutes = require('./routes/gunRoutes');
const leafRoutes = require("./routes/leaf");
const productRoute = require("./routes/productRoutes");
const productInventory = require('./routes/productInventoryRoutes');
const salesRoutes = require('./routes/salesRoutes');
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
app.use("/api/users", userRoutes);
app.use("/api/collectorUser", collectorUserRoutes);
app.use('/api/sorting', sortingRoutes);
app.use('/api/guns', gunRoutes);
app.use('/api/washing', washingRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/dies', dieRoutes);
app.use("/api/packaging", packagingRoutes);
app.use("/api/leafs", leafRoutes);
app.use("/api/products", productRoute);
app.use("/api/product-inventories", productInventory);
app.use("/api/sales", salesRoutes);
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
