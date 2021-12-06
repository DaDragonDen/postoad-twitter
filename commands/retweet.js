const commands = require("../commands");

module.exports = (_, collections) => {

  const toggleRetweet = async (interaction, action) => {

    let twitter;
    let user;
    let match; 
    let tweetId;

    // Make sure they have permission to do this
    await require("../modules/check-permissions")(interaction.member, collections);

    // Get Tweet ID
    match = [...interaction.data.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];

    if (!match) throw new Error("That isn't a Tweet");

    tweetId = match[0][1];

    // Retweet the Tweet
    twitter = await require("../modules/twitter")(interaction.guildID, collections);
    user = await twitter.currentUser();
    
    await twitter.v2[action](user.id_str, tweetId);
    await interaction.createFollowup(action === "retweet" ? "shared it, shared it, shared it" : "done");

  }

  new commands.new("retweet", "Retweet something on behalf of the server.", async (bot, interaction) => toggleRetweet(interaction, "retweet"), 0, [
    {
      name: "tweet_url",
      description: "What do you want to retweet?",
      type: 3,
      required: true
    }
  ]);

  new commands.new("unretweet", "Unretweet something on behalf of the server.", async (bot, interaction) => await toggleRetweet(interaction, "unretweet"), 0, [
    {
      name: "tweet_url",
      description: "What do you want to unretweet?",
      type: 3,
      required: true
    }
  ]);
  
}