const commands = require("../commands");

module.exports = (_, collections) => {

  const toggleFollow = async (interaction, action) => {

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

    // (Un-)follow the user
    user = await twitter.currentUser();
    await twitter.v2[action](user.id_str, targetUser.data[0].id);
    await interaction.createFollowup(action === "follow" ? `@${username} is our new bestie :)` : `friendship ended with @${username}`);

  } 

  new commands.new("follow", "Follow someone on Twitter on behalf of the server.", async (bot, interaction) => await toggleFollow(interaction, "follow"), 0, [
    {
      name: "username",
      description: "Who do you want to follow?",
      type: 3,
      required: true
    }
  ]);

  new commands.new("unfollow", "Unfollow someone on Twitter on behalf of the server.", async (bot, interaction) => await toggleFollow(interaction, "unfollow"), 0, [
    {
      name: "username",
      description: "Who do you want to unfollow?",
      type: 3,
      required: true
    }
  ]);
  
}