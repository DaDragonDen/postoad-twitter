const {TwitterApi} = require("twitter-api-v2");
const commands = require("../commands");

module.exports = (_, collections) => {

  new commands.new("follow", "Follow someone on Twitter on behalf of the server.", async (bot, interaction) => {
    
    const twitterAuth = await collections.twitterAuthInfo.findOne({guildId: interaction.guildID});
    let twitter, user, targetUser;

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

    // Get the user ID
    targetUser = await twitter.v2.usersByUsernames(interaction.data.options[0].value);

    // Follow the user
    await twitter.v2.follow(user.id_str, targetUser.data[0].id);
    await interaction.createFollowup("done");

  }, 0, [
    {
      name: "username",
      description: "Who do you want to follow?",
      type: 3,
      required: true
    }
  ]);
  
}