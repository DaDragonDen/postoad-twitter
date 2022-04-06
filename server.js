import path, { dirname } from "path";
import express from "express";
import { fileURLToPath } from "url";

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(dirname(fileURLToPath(import.meta.url)), "views"));

export default (bot, collections) => {

  app.get("*", (req, res) => res.sendStatus(200));

  app.listen(3000, () => console.log("\x1b[32m%s\x1b[0m", "[Web Server] Listening on port 3000"))

};
