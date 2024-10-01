import express from 'express';
import productsRouter from './routers/products.js';
import cartsRouter from './routers/carts.js';

const app = express();


app.use(express.json());


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
