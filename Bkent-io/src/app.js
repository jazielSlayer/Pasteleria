import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { options } from './swaggerOptions';

const specs = swaggerJSDoc(options);


import provedores from './routes/Proovedor'
import materiaprima from './routes/MateriasPrimas';
import Compras from './routes/compras';
import producto from './routes/Productos';
import receta from './routes/Receta';
import MovimientoInventario from './routes/MovimientoInventario';
import ProduccionDiaria from './routes/ProduccionDiaria';
import Clientes from './routes/Clientes';
import Promociones from './routes/Promociones';
import Ventas from './routes/Venta'

import Vistas from './routes/Vistas';



import PdfsRoutes from './routes/Pdfs';
import ArchiivoRouts from './routes/ArchivosRoutes'

const app = express();




app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(provedores);
app.use(materiaprima);
app.use(Compras);
app.use(producto);
app.use(receta);
app.use(MovimientoInventario);
app.use(ProduccionDiaria);
app.use(Clientes);
app.use(Promociones);
app.use(Ventas)


app.use(Vistas);




app.use(PdfsRoutes)
app.use(ArchiivoRouts)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

export default app;