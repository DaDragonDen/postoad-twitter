const {TwitterApi} = require("twitter-api-v2");
const commands = require("../commands");

module.exports = (_, collections) => {

  new commands.new("reply", "Reply to a Tweet on behalf of the server.", async (bot, interaction) => {
    
    const twitterAuth = await collections.twitterAuthInfo.findOne({guildId: interaction.guildID});
    const subcommand = interaction.data.options[0];
    const content = subcommand.options && subcommand.options[1] && subcommand.options[1].value;
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

    // Retweet the Tweet
    match = [...subcommand.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];
    if (!match) return await interaction.createFollowup("that isn't a tweet");

    tweetId = match[0][1];

    switch (subcommand.name) {

      case "text": {
        
        // Tweet the text
        const {data: tweet} = await twitter.v2.reply(content, tweetId);
        return await interaction.createFollowup("done https://twitter.com/i/status/" + tweet.id);

      }

      case "media":

        // Prepare to get media
        await prepareForMedia(interaction, content);

      default:
        break;

    }

  }, 0, [
    {
      name: "text",
      description: "Reply to a Tweet with text on behalf of the server",
      type: 1,
      options: [
        {
          name: "tweet_url",
          description: "What do you want to reply to?",
          type: 3,
          required: true
        },
        {
          name: "content",
          description: "What do you want to say?",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "media",
      description: "Reply to a Tweet with media, and optionally text on behalf of the server",
      type: 1,
      options: [
        {
          name: "tweet_url",
          description: "What do you want to reply to?",
          type: 3,
          required: true
        },
        {
          name: "content",
          description: "What do you want to say?",
          type: 3
        }
      ]
    }
  ]);
  
}