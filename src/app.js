import express from 'express'; // Importar Express
import { createServer } from 'http'; // Importar createServer para crear un servidor HTTP
import { Server } from 'socket.io'; // Importar Socket.IO
import { engine } from 'express-handlebars'; // Importar Handlebars
import path from 'path'; // Importar path para manejar rutas de archivos
import { fileURLToPath } from 'url'; // Importar fileURLToPath para manejar URLs de archivos
import productsRouter from './routers/products.js'; // Importar rutas de productos
import cartsRouter from './routers/carts.js'; // Importar rutas de carritos

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // Crear una instancia de Express
const httpServer = createServer(app); // Crear el servidor HTTP
const io = new Server(httpServer); // Inicializar Socket.IO

// Configurar Handlebars como motor de plantillas
app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, 'views/layouts'), // Ruta a los layouts
  defaultLayout: 'main', // Nombre del layout por defecto
}));
app.set('view engine', 'handlebars'); // Establecer el motor de vista
app.set('views', path.join(__dirname, 'views')); // Ruta a las vistas

// Middleware
app.use(express.json()); // Middleware para parsear JSON
app.use(express.urlencoded({ extended: true })); // Middleware para parsear datos URL-encoded
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos desde la carpeta public

// Usar las rutas de productos y carritos
app.use('/api/products', productsRouter); // Rutas para productos
app.use('/api/carts', cartsRouter); // Rutas para carritos

// Vista principal (home)
import { getProducts, saveProducts } from './routers/products.js'; // Importar funciones getProducts y saveProducts
app.get('/', (req, res) => {
  const products = getProducts(); // Obtener productos para la vista
  res.render('home', { products }); // Renderizar la vista 'home' y pasar los productos
});

// Vista de productos en tiempo real
app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts'); // Renderizar la vista 'realTimeProducts'
});

// Manejo de WebSocket
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado'); // Mensaje de conexión exitosa

  // Manejar el evento de nuevo producto
  socket.on('newProduct', (productData) => {
    const products = getProducts(); // Obtener productos existentes
    const newProduct = {
      id: products.length ? products[products.length - 1].id + 1 : 1,
      ...productData,
    };
    products.push(newProduct); // Agregar el nuevo producto
    saveProducts(products); // Guardar el nuevo producto
    io.emit('updateProducts', products); // Emitir la lista actualizada a todos los clientes
  });

  // Manejar el evento de eliminación de producto
  socket.on('deleteProduct', (productId) => {
    const products = getProducts(); // Obtener productos existentes
    const updatedProducts = products.filter(p => p.id !== productId); // Filtrar productos para eliminar el deseado
    saveProducts(updatedProducts); // Guardar los productos actualizados
    io.emit('updateProducts', updatedProducts); // Emitir la lista actualizada a todos los clientes
  });
});

// Iniciar el servidor
const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); // Mensaje al iniciar el servidor
});
