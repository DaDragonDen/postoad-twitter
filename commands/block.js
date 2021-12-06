const commands = require("../commands");

module.exports = (_, collections) => {
  
  const toggleBlock = async (interaction, action) => {

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
    twitter = await require("../modules/twitter")(interaction.guildID, collections);
    targetUser = await twitter.v2.usersByUsernames(username);
    if (!targetUser) throw new Error(`@${username} doesn't exist :(`);

    // (Un-)block the user
    user = await twitter.currentUser();
    await twitter.v2[action](user.id_str, targetUser.data[0].id);
    await interaction.createFollowup(action === "block" ? `@${username} has been...\`blocked.\`` : `@${username} has been freed 👍`);

  }

  new commands.new("block", "Block someone on Twitter on behalf of the server.", async (bot, interaction) => await toggleBlock(interaction, "block"), 0, [
    {
      name: "username",
      description: "Who do you want to block?",
      type: 3,
      required: true
    }
  ]);

  new commands.new("unblock", "Unblock someone on Twitter on behalf of the server.", async (bot, interaction) => await toggleBlock(interaction, "unblock"), 0, [
    {
      name: "username",
      description: "Who do you want to unblock?",
      type: 3,
      required: true
    }
  ]);
}