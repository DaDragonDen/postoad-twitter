const commands = require("../commands");

module.exports = (_, collections) => {
  
  new commands.new("block", "Block someone on Twitter on behalf of the server.", async (bot, interaction) => {
    
    let twitter;
    let user; 
    let targetUser;
    let username;

    // Make sure they have permission to do this
    await require("../modules/check-permissions")(interaction.member, collections);

    // Make sure it's a valid username
    username = interaction.data.options[0].value;
    if (!/^@?(\w){1,15}$/gm.test(username)) throw new Error(`"${username}" isn't a valid Twitter username`);

    // Get the user ID
    twitter = await require("../modules/twitter")(interaction.guildID, {interaction: interaction, collections: collections});
    targetUser = await twitter.v2.usersByUsernames(username);
    if (!targetUser) throw new Error(`@${username} doesn't exist :(`);

    // Block the user
    user = await twitter.currentUser();
    await twitter.v2.block(user.id_str, targetUser.data[0].id);
    await interaction.createFollowup(`@${username} has been...\`blocked.\``);

  }, 0, [
    {
      name: "username",
      description: "Who do you want to block?",
      type: 3,
      required: true
    }
  ]);
}