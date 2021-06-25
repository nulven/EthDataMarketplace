import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import config from '../config';

import apiRouter from './routes/api';
import adminRouter from './routes/admin';
import router from './routes';

const app = express();
const jsonParser = bodyParser.json();

const corsOptions = {
  origin: '*',
};

app.use('/', express.static(__dirname + '/../'));

app.use(jsonParser);
app.use(cors(corsOptions));
app.use('/api', apiRouter);
app.use('/admin', adminRouter);
app.use('/', router);

let route;
const routes: any = [];
app._router.stack.forEach(function(middleware){
  if(middleware.route){ // routes registered directly on the app
    routes.push(middleware.route);
  } else if(middleware.name === 'router'){ // router middleware
    middleware.handle.stack.forEach(function(handler: any){
      route = handler.route;
      route && routes.push(route);
    });
  }
});
const server = app.listen(config['port'], config['host']);

export default server;
