const commands = require("../commands");

module.exports = (_, collections) => {

  const toggleLike = async (interaction, action) => {

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

    // Like the Tweet
    twitter = await require("../modules/twitter")(interaction.guildID, collections);
    user = await twitter.currentUser();
    
    await twitter.v2[action](user.id_str, tweetId);
    await interaction.createFollowup(action === "like" ? "this is the one ♥" : "heartbroken 💔");

  }

  new commands.new("like", "Like something on Twitter on behalf of the server.", async (bot, interaction) => await toggleLike(interaction, "like"), 0, [
    {
      name: "tweet_url",
      description: "What do you want to like?",
      type: 3,
      required: true
    }
  ]);

  new commands.new("unlike", "Unlike something on Twitter on behalf of the server.", async (bot, interaction) => await toggleLike(interaction, "unlike"), 0, [
    {
      name: "tweet_url",
      description: "What do you want to unlike?",
      type: 3,
      required: true
    }
  ]);
  
}