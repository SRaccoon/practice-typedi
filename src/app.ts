import express, { Application } from "express";
import morgan from "morgan";
import { Server } from "http";
import { useContainer, useExpressServer } from "routing-controllers";
import Container from "typedi";
import { join } from "path";
import { createConnection, useContainer as useDBContainer } from "typeorm";
import bodyParser from "body-parser";
import { GlobalErrorHandler } from "middleware/global-error.handler";
import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { AuthorizationHandler } from "middleware/authorization.handler";


export class App {
	public app: Application;
	public server: Server;
	public port: number;

	constructor(port: number) {
		this.app = express();
		this.port = port;
		this.setMiddleWare();
	}

	public async initServer() {
		await new Promise(async (resolve) => {
			await this.createDatabaseConnection();

			useContainer(Container);

			useExpressServer(this.app, {
				controllers: [
					join(__dirname + "/api/**/*.controller.js")
				],
				middlewares: [GlobalErrorHandler],
				authorizationChecker: AuthorizationHandler,
				defaultErrorHandler: false
			});

			this.server = this.app.listen(this.port, () => {
				console.log("Service Start");
				resolve(true);
			});
		});
	}

	private setMiddleWare() {
		this.app.use(morgan("dev"));
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));
	}

	private async createDatabaseConnection() {
		try {
			const connectionOpts: SqliteConnectionOptions = {
				type: "sqlite",
				database: "simsamo.db",
				entities: [
					join(__dirname + "/api/**/*.entity.js")
				],
				synchronize: true
			};

			useDBContainer(Container);
			await createConnection(connectionOpts);
		} catch (error) {
			throw error;
		}
	}
}
