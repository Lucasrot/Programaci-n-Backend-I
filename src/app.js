import express from 'express'; 
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 
import { engine } from 'express-handlebars'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import productsRouter from './routers/products.js'; 
import cartsRouter from './routers/carts.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); 
const httpServer = createServer(app); 
const io = new Server(httpServer); 


app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, 'views/layouts'), 
  defaultLayout: 'main', 
}));
app.set('view engine', 'handlebars'); 
app.set('views', path.join(__dirname, 'views')); 


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public'))); 


app.use('/api/products', productsRouter); 
app.use('/api/carts', cartsRouter); 


import { getProducts, saveProducts } from './routers/products.js'; 
app.get('/', (req, res) => {
  const products = getProducts(); 
  res.render('home', { products }); 
});

app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts'); 
});


io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado'); 
  
  socket.on('newProduct', (productData) => {
    const products = getProducts(); 
    const newProduct = {
      id: products.length ? products[products.length - 1].id + 1 : 1,
      ...productData,
    };
    products.push(newProduct);
    saveProducts(products); 
    io.emit('updateProducts', products);
  });


  socket.on('deleteProduct', (productId) => {
    const products = getProducts(); 
    const updatedProducts = products.filter(p => p.id !== productId);
    saveProducts(updatedProducts); 
    io.emit('updateProducts', updatedProducts); 
  });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); 
});
