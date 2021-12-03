const {TwitterApi, ETwitterStreamEvent} = require("twitter-api-v2");

const appClient = new TwitterApi(process.env.twitterBearerToken);
let collections;

exports.setCollections = (initCollections) => {

  collections = initCollections;

};

exports.retweet = async (msg, tweetId) => {

  try {

    // Check if the collections are ready
    const collectionCheck = !collections && setInterval(() => collections && clearInterval(collectionCheck), 3000);

    // Check if we're authorized
    const twitterAuth = await collections.twitterAuthInfo.findOne({guildId: msg.channel.guild.id});
    if (!twitterAuth || !twitterAuth.access_token || !twitterAuth.access_secret) {

      console.log("I don't have permission to use Twitter");
      return;

    }

    // Create a temporary client
    const userClient = new TwitterApi({
      appKey: process.env.twitterAPIKey,
      appSecret: process.env.twitterAPIKeySecret,
      accessToken: twitterAuth.access_token,
      accessSecret: twitterAuth.access_secret
    });

    // Retweet the Tweet
    const user = await userClient.currentUser();
    await userClient.v2.retweet(user.id_str, tweetId);

  } catch (err) {

    console.log(err);

  }

};

exports.setupAppClient = async (bot) => {

  await appClient.v2.updateStreamRules({
    add: [
      { value: "from:TheShowrunners" }
    ],
  });

  const stream = await appClient.v2.searchStream({
    "user.fields": ["username", "name", "profile_image_url"],
    "media.fields": ["preview_image_url", "url", "width", "height", "type"],
    "expansions": ["attachments.media_keys"]
  });

  stream.on(ETwitterStreamEvent.ConnectionError, (event) => {

    console.log(event.data);

  });

  stream.on(ETwitterStreamEvent.Data, async (event) => {

    // Make sure we got the data
    const data = event && event.data;
    if (!data) return;

    // Post the Tweet to the server
    await bot.createMessage("891083321591890000", "https://twitter.com/i/" + data.id);

  });

};