import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');


const getCarts = () => {
  const data = fs.readFileSync(cartsFilePath);
  return JSON.parse(data);
};


const saveCarts = (carts) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};


const getProducts = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};


router.post('/', (req, res) => {
  const carts = getCarts();
  const newCart = {
    id: carts.length ? carts[carts.length - 1].id + 1 : 1,
    products: [],
  };
  carts.push(newCart);
  saveCarts(carts);
  res.status(201).json(newCart);
});


router.get('/:cid', (req, res) => {
  const carts = getCarts();
  const cart = carts.find(c => c.id === parseInt(req.params.cid));
  if (!cart) {
    return res.status(404).send('Carrito no encontrado');
  }
  res.json(cart);
});


router.post('/:cid/product/:pid', (req, res) => {
  const carts = getCarts();
  const products = getProducts();
  const cart = carts.find(c => c.id === parseInt(req.params.cid));
  const product = products.find(p => p.id === parseInt(req.params.pid));

  if (!cart) {
    return res.status(404).send('Carrito no encontrado');
  }
  if (!product) {
    return res.status(404).send('Producto no encontrado');
  }

  const cartProduct = cart.products.find(p => p.id === product.id);
  if (cartProduct) {
    cartProduct.quantity += 1;
  } else {
    cart.products.push({ id: product.id, quantity: 1 });
  }
  saveCarts(carts);
  res.json(cart);
});


export default router;
