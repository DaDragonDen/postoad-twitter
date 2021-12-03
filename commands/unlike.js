const {TwitterApi} = require("twitter-api-v2");
const commands = require("../commands");

module.exports = (_, collections) => {

  new commands.new("unlike", "Unlike something on Twitter on behalf of the server.", async (bot, interaction) => {
    
    const twitterAuth = await collections.twitterAuthInfo.findOne({guildId: interaction.guildID});
    let twitter, user, match, tweetId;

    // Check if we're authorized
    if (!twitterAuth || !twitterAuth.access_token || !twitterAuth.access_secret) return await interaction.createFollowup("i don't have permission to use twitter in this server");

    // Set up the client 
    twitter = new TwitterApi({
      appKey: process.env.twitterAPIKey,
      appSecret: process.env.twitterAPIKeySecret,
      accessToken: twitterAuth.access_token,
      accessSecret: twitterAuth.access_secret
    });
    user = await twitter.currentUser();

    // Unlike the Tweet
    match = [...interaction.data.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];
    if (!match) return await interaction.createFollowup("that isn't a tweet");

    tweetId = match[0][1];

    await twitter.v2.unlike(user.id_str, tweetId);
    await interaction.createFollowup("done");

  }, 0, [
    {
      name: "tweet_url",
      description: "What do you want to unlike?",
      type: 3,
      required: true
    }
  ]);
  
}