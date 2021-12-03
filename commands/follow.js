const {TwitterApi} = require("twitter-api-v2");
const commands = require("../commands");

module.exports = (_, collections) => {

  new commands.new("follow", "Follow someone on Twitter on behalf of the server.", async (bot, interaction) => {
    
    let twitter;
    let user; 
    let targetUser;
    let username = interaction.data.options[0].value;

    // Make sure it's a valid username
    if (!/^@?(\w){1,15}$/gm.test(username)) throw new Error(`"${username}" isn't a valid Twitter username`);

    // Get the user ID
    twitter = await require("../modules/twitter")(interaction.guildID, {interaction: interaction, collections: collections});
    targetUser = await twitter.v2.usersByUsernames(username);
    if (!targetUser) throw new Error(`@${username} doesn't exist :(`);

    // Follow the user
    user = await twitter.currentUser();
    await twitter.v2.follow(user.id_str, targetUser.data[0].id);
    await interaction.createFollowup(`@${username} is our new bestie :)`);

  }, 0, [
    {
      name: "username",
      description: "Who do you want to follow?",
      type: 3,
      required: true
    }
  ]);
  
}