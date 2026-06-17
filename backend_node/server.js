import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import visitasRoutes from './api/visitas.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', visitasRoutes);

app.listen(3000, () => {
  console.log('API Rentalia corriendo en puerto 3000');
});