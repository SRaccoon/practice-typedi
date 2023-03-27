require("app-module-path").addPath(__dirname);
import "reflect-metadata";

import { App } from "./app";

(async () => {
	let app = new App(3000);
	await app.initServer();
})();