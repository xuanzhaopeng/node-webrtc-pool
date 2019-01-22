import {getLogger, Logger} from "log4js";

export const PCLogger:Logger = getLogger("peer-connection");
PCLogger.level = 'debug';

export const ServerLogger:Logger = getLogger("server");
ServerLogger.level = 'debug';
