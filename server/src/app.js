import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import recordRoutes from './routes/recordRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'https://drone-stress-mapping.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'Drone Stress Mapping Backend is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running successfully' });
});

app.use('/api/records', recordRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;