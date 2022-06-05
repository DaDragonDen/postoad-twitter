import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import { Client as DiscordClient } from "eris";
import "dotenv/config";
import fetch from "node-fetch";
import initializeDB from "./database.js";
import {initialize as initializeCommands, listCommands} from "./commands.js";
import getTwitterClient from "./modules/twitter.js";
import launchWebServer from "./server.js";

// We need to wrap this in an async block because we're using promises.
(async () => {

  const allowedMediaTypes = {
    "image/png": 1,
    "image/jpg": 1,
    "image/gif": 1
  };
  const mediaList = {};
  const bot = new DiscordClient(process.env.discordToken, { requestTimeout: 30000 });
  const dbClient = await initializeDB();
  const db = dbClient.db("social");
  const collections = {
    twitterAuthInfo: db.collection("TwitterAuthorizationCredentials")
  };

  // Load the Discord client events.
  console.log("\x1b[36m%s\x1b[0m", "[Discord] Initializing events...");

  bot.on("messageCreate", async (msg) => {

    try {

      // Disallow bot interactions
      if (msg.author.bot) return;

      // Check if it's media
      const {referencedMessage} = msg;
      const mediaRequest = referencedMessage && mediaList[referencedMessage.id];

      if (mediaRequest) {

        // Make sure that this server has Twitter set up.
        const twitterClient = await getTwitterClient(msg.channel.guild.id, collections);

        if (twitterClient) {

          const {attachments} = msg;
          const mediaIds = [];

          // Iterate through every attachment.
          for (let i = 0; attachments.length > i; i++) {

            // Make sure the media type is allowed
            const attachment = attachments[i];

            if (!allowedMediaTypes[attachment.content_type]) continue;

            // Get the attachment buffers and get the media IDs
            const attachmentResponse = await fetch(attachment.url);
            const attachmentBody = await attachmentResponse.arrayBuffer();
            mediaIds.push(await twitterClient.v1.uploadMedia(Buffer.from(attachmentBody), { type: "png" }));

          }

          // Upload the Tweet.
          const { data: tweet } = await twitterClient.v2.tweet(mediaRequest.content, { media: { media_ids: mediaIds } });

          return await msg.channel.createMessage({
            content: "done https://twitter.com/i/status/" + tweet.id,
            allowedMentions: {
              repliedUser: true
            },
            messageReference: {
              messageID: msg.id
            }
          });

        }

      }

      // Check if it's a Tweet
      const tweets = [...msg.content.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];
      if (tweets && msg.member && msg.member.roles.find(roleId => roleId === "895145350397067274") && msg.channel.parentID === "790370734736146452") {

        const twitterClient = await getTwitterClient(msg.channel.guild.id, collections);

        if (twitterClient) {

          const twitterUser = await twitterClient.currentUser();

          for (let x = 0; tweets.length > x; x++) {

            // Retweet the Tweet
            twitterClient.v2.retweet(twitterUser.id_str, tweets[x].groups.tweetId);

          }

        }

      }

    } catch (err) {

      await msg.channel.createMessage("Sorry, I can't help you right now. If you see Christian, be a pal and show him this: \n```js\n" + err.stack + "\n```");

    }

  });

  bot.on("error", (err) => {

    console.log("\x1b[33m%s\x1b[0m", "[Eris]: " + err);

  });

  bot.once("ready", async () => {

    // Remember the start time.
    const startTime = new Date().getTime();

    // Tell the user everything is OK and that we're working on the next thing.
    console.log("\x1b[32m%s\x1b[0m", "[Discord] Logged in!");
    console.log("\x1b[36m%s\x1b[0m", "[Discord] Initializing commands...");
    
    // Initialize the commands with the collections.
    await initializeCommands(bot, collections);

    // Patch the commands wiht the client object and collections.
    const files = fs.readdirSync(path.join(dirname(fileURLToPath(import.meta.url)), "commands"));

    for (let x = 0; files.length > x; x++) {

      const { default: module } = await import("./commands/" + files[x]);

      if (typeof module === "function") {
        
        await module(bot, collections, async (interaction, content, type) => {

          const message = await interaction.createFollowup("reply to this message with the image(s) you want to upload");
        
          mediaList[message.id] = {
            poster: interaction.member.id,
            content: content,
            type: type
          };
        
        });

      }

    }

    // Upsert/delete slash commands where necessary
    const commandList = listCommands();
    const commandListNames = Object.keys(commandList);

    for (let i = 0; commandListNames.length > i; i++) {

      await commandList[commandListNames[i]].verifyInteraction();

    }

    // Load the web server.
    launchWebServer(bot, collections);

    // Display how long it took to load the commands.
    console.log("\x1b[32m%s\x1b[0m", "[Discord] Ready to roll! It took " + (new Date().getTime() - startTime) / 1000 + " seconds");

  });

  // Connect to Discord
  console.log("\x1b[36m%s\x1b[0m", "[Discord] Connecting to Discord...");
  bot.connect();

})();
