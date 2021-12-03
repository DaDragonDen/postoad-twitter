const {TwitterApi} = require("twitter-api-v2");
const commands = require("../commands");

module.exports = (_, collections) => {

  new commands.new("retweet", "Retweet something on behalf of the server.", async (bot, interaction) => {
    
    let twitter;
    let user;
    let match; 
    let tweetId;

    // Get Tweet ID
    match = [...interaction.data.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];

    if (!match) throw new Error("That isn't a Tweet");

    tweetId = match[0][1];

    // Retweet the Tweet
    twitter = await require("../modules/twitter")(interaction.guildID, {interaction: interaction, collections: collections});
    user = await twitter.currentUser();
    
    await twitter.v2.retweet(user.id_str, tweetId);
    await interaction.createFollowup("shared it, shared it, shared it");

  }, 0, [
    {
      name: "tweet_url",
      description: "What do you want to retweet?",
      type: 3,
      required: true
    }
  ]);
  
}