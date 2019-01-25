import express = require("express");
import * as http from 'http';
import cors from 'cors';
import {ServerLogger} from "./logger";
import {AddressInfo} from "net";
import {HttpError, Server} from "typescript-rest";
import services from './services';
import * as swaggerDoc from '../swagger/swagger.json';

const swaggerUi = require('swagger-ui-express');

export class ApiServer {
  private readonly app: express.Application;
  private server: http.Server = null;
  public PORT: number = +process.env.PORT || 3000;
  public HOST: string = process.env.HOST || 'localhost';

  private options:cors.CorsOptions = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: '',
    preflightContinue: false
  };

  constructor() {
    this.app = express();
    Server.buildServices(this.app, ...services);
  }

  private config() {
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err instanceof HttpError){
        if (res.headersSent) {
          return next(err)
        }
        res.set("Content-Type", "application/json");
        res.status(err.statusCode);
        res.json({error : err.message, code: err.statusCode});
      } else {
        next(err);
      }
    });
    this.app.use(cors(this.options));
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
  }

  start(): Promise<any> {
    this.config();

    return new Promise<any>((resolve, reject) => {
      this.server = this.app.listen(this.PORT, this.HOST,(err: any) => {
        if (err) {
          return reject(err);
        }

        typeof this.server.address() === 'string' ?
          ServerLogger.debug(`Listening to http://${this.server.address() as string}`) :
          ServerLogger.debug(`Listening to http://${(this.server.address() as AddressInfo).address}:${(this.server.address() as AddressInfo).port}`);
        return resolve();
      });
    });
  }

  stop(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.server) {
        this.server.close(() => {
          return resolve(true);
        });
      } else {
        return resolve(true);
      }
    });
  }
}
