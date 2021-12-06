// Packages and services
const path = require("path");
const fs = require("fs");
const Eris = require("eris");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

require("dotenv").config();

const bot = new Eris(process.env.token, {requestTimeout: 30000});
const mediaList = {};
const allowedMediaTypes = {
  "image/png": 1,
  "image/jpg": 1,
  "image/gif": 1
};
const prepareForMedia = async (interaction, content) => {

  const message = await interaction.createFollowup("reply to this message with the image(s) you want to upload. `you have 2 minutes` 👻");

  mediaList[message.id] = {
    poster: interaction.member.id,
    content: content
  }

};
const loadDB = async () => {

  console.log("\x1b[36m%s\x1b[0m", "[Client] Updating database variables...");

  database = await require("./database");
  dbClient = database.mongoClient;
  db = dbClient.db("guilds");
  collections = {
    twitterAuthInfo: db.collection("TwitterAuthorizationInfo")
  };

  console.log("\x1b[32m%s\x1b[0m", "[Client] Database variables updated");
  
};
let commandList;
let database;
let dbClient;
let db;
let collections;
let commands;

// Load Discord
bot.once("ready", async () => {
  
  const startTime = new Date().getTime();

  console.log("\x1b[32m%s\x1b[0m", "[Client] Logged in!");

  // Load the database
  await loadDB();
  
  // Load all commands
  commands = require("./commands");
  await commands.initialize(bot, collections);
  const files = fs.readdirSync(path.join(__dirname, "commands"));
  for (let x = 0; files.length > x; x++) {

    const file = require("./commands/" + files[x]);
    if (typeof(file) === "function") await file(bot, collections, prepareForMedia);

  }

  // Upsert/delete slash commands where necessary
  commandList = Object.keys(commands.list);

  for (let i = 0; commandList.length > i; i++) {
    
    await commands.list[commandList[i]].verifyInteraction();

  }
  
  // Set up events
  console.log("\x1b[36m%s\x1b[0m", "[Client] Initializing events...");

  bot.on("messageCreate", async (msg) => {

    let referencedMessage;
    let mediaRequest;
    let attachments;
    let mediaIds;
    let attachment;
    let attachmentBody;
    let attachmentResponse;
    let twitterClient;

    try {

      // Disallow bot interactions
      if (msg.author.bot) return;

      // Check if it's media
      referencedMessage = msg.referencedMessage;
      mediaRequest = referencedMessage && mediaList[referencedMessage.id];
      
      if (mediaRequest) {

        // Prepare the Twitter client
        twitterClient = require("./modules/twitter")(msg.channel.guild.id, collections);

        if (twitterClient) {

          attachments = msg.attachments;
          mediaIds = [];

          for (let i = 0; attachments.length > i; i++) {

            // Make sure the media type is allowed
            attachment = attachments[i];

            if (!allowedMediaTypes[attachment.content_type]) continue;

            // Get the attachment buffers and get the media IDs
            attachmentResponse = await fetch(attachment.url);
            attachmentBody = await attachmentResponse.arrayBuffer();
            mediaIds.push(await twitterClient.v1.uploadMedia(Buffer.from(attachmentBody), {type: "png"}));

          }

          // Upload the Tweet
          const {data: tweet} = await twitterClient.v2.tweet(mediaRequest.content, {media: {media_ids: mediaIds}});

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

        twitterClient = await require("./modules/twitter")(msg.channel.guild.id, collections);
        twitterUser = await twitterClient.currentUser();

        if (twitterClient) {

          for (let x = 0; tweets.length > x; x++) {

            // Retweet the Tweet
            twitterClient.v2.retweet(twitterUser.id_str, tweets[x].groups.tweetId);

          }

        }

      };
    
    } catch (err) {

      await msg.channel.createMessage("Sorry, I can't help you right now. If you see Christian, be a pal and show him this: \n```js\n" + err.stack + "\n```");

    }

  });

  bot.on("error", (err) => {

    console.log("\x1b[33m%s\x1b[0m", "[Eris]: " + err);

  });
  
  // Load the web server
  require("./server")(bot, collections);

  console.log("\x1b[32m%s\x1b[0m", "[Client] Ready to roll! It took " + (new Date().getTime() - startTime) / 1000 + " seconds");

});

// Connect to Discord
console.log("\x1b[36m%s\x1b[0m", "[Client] Connecting to Discord...");
bot.connect();