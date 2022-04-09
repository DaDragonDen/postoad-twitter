import path, { dirname } from "path";
import express from "express";
import { fileURLToPath } from "url";
import { authorizeTwitter } from "./commands/authorization.js";

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(dirname(fileURLToPath(import.meta.url)), "views"));

export default (bot, collections) => {

  app.get("/callback/twitter", async (req, res) => {

    const {code, oauth_verifier} = req.query;

    try {

      await authorizeTwitter(code, oauth_verifier);
      res.send("Thanks! You may now close this window.");

    } catch ({message}) {

      console.log("[Callback] " + message);
      res.send("Sorry, something went wrong. You might have denied the authorization request. If you still want to authorize Postoad, run the command again.");

    }

  });

  app.get("*", (req, res) => res.sendStatus(200));

  app.listen(3000, () => console.log("\x1b[32m%s\x1b[0m", "[Web Server] Listening on port 3000"))

};
