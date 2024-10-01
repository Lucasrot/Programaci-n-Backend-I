import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const productsFilePath = path.join(__dirname, '../data/products.json');

const getProducts = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};

const saveProducts = (products) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};


router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || undefined;
  const products = getProducts();
  res.json(limit ? products.slice(0, limit) : products);
});


router.get('/:pid', (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === parseInt(req.params.pid));
  if (!product) {
    return res.status(404).send('Producto no encontrado');
  }
  res.json(product);
});


router.post('/', (req, res) => {
  const { title, description, code, price, stock, category } = req.body;
  const products = getProducts();
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    title,
    description,
    code,
    price,
    stock,
    category,
    status: true,
    thumbnails: [],
  };
  products.push(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});


router.put('/:pid', (req, res) => {
  const products = getProducts();
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.pid));
  if (productIndex === -1) {
    return res.status(404).send('Producto no encontrado');
  }
  const updatedProduct = { ...products[productIndex], ...req.body };
  products[productIndex] = updatedProduct;
  saveProducts(products);
  res.json(updatedProduct);
});


router.delete('/:pid', (req, res) => {
  const products = getProducts();
  const updatedProducts = products.filter(p => p.id !== parseInt(req.params.pid));
  if (products.length === updatedProducts.length) {
    return res.status(404).send('Producto no encontrado');
  }
  saveProducts(updatedProducts);
  res.status(204).send();
});


export default router;
