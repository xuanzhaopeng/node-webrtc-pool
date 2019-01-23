import express = require("express");
import * as http from 'http';
import cors from 'cors';
import {ServerLogger} from "./logger";
import {AddressInfo} from "net";
import {Server} from "typescript-rest";
import services from './services';

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
    this.app.use(cors(this.options));
    Server.buildServices(this.app, ...services);
  }

  start(): Promise<any> {
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
    return new Promise<boolean>((resolve, reject) => {
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
