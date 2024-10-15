import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const cartsFilePath = path.join(__dirname, '../data/carts.json');


router.post('/', (req, res) => {
  const newCart = { /* ... */ }; 

  res.status(201).json(newCart); 
});



export default router;
