const {TwitterApi} = require("twitter-api-v2");
const commands = require("../commands");

module.exports = (_, collections, prepareForMedia) => {

  new commands.new("tweet", "Tweet something on behalf of the server.", async (bot, interaction) => {
    
    const twitterAuth = await collections.twitterAuthInfo.findOne({guildId: interaction.guildID});
    const subcommand = interaction.data.options[0];
    const content = subcommand.options && subcommand.options[0].value;
    let twitter;

    // Check if we're authorized
    if (!twitterAuth || !twitterAuth.access_token || !twitterAuth.access_secret) return await interaction.createFollowup("i don't have permission to use twitter in this server");

    // Set up the client 
    twitter = new TwitterApi({
      appKey: process.env.twitterAPIKey,
      appSecret: process.env.twitterAPIKeySecret,
      accessToken: twitterAuth.access_token,
      accessSecret: twitterAuth.access_secret
    }); 
    
    switch (subcommand.name) {

      case "text": {
        
        // Tweet the text
        const {data: tweet} = await twitter.v2.tweet(content);
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
      description: "Send a text-only Tweet on behalf of the server.",
      type: 1,
      options: [
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
      description: "Send a Tweet with media on behalf of the server.",
      type: 1,
      options: [
        {
          name: "content",
          description: "Do you want to add text to your Tweet? Put it here.",
          type: 3
        }
      ]
    }
  ]);
  
}