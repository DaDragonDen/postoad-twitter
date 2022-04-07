import { Command } from "../commands.js";
import verifyPermissions from "../modules/check-permissions.js";
import getTwitterClient from "../modules/twitter.js";

export default (_, collections) => {

  const toggleFollow = async (interaction, action) => {

    // Make sure they have permission to do this
    await verifyPermissions(interaction.member, collections);

    // Make sure it's a valid username
    const username = interaction.data.options[0].value;
    if (!/^@?(\w){1,15}$/gm.test(username)) throw new Error(`"${username}" isn't a valid Twitter username`);

    // Get the user ID
    const twitter = await getTwitterClient(interaction.guildID, collections);
    const targetUser = await twitter.v2.usersByUsernames(username);
    if (!targetUser) throw new Error(`@${username} doesn't exist :(`);

    // (Un-)follow the user
    const user = await twitter.currentUser();
    await twitter.v2[action](user.id_str, targetUser.data[0].id);
    await interaction.createFollowup(action === "follow" ? `@${username} is our new bestie :)` : `friendship ended with @${username}`);

  };

  new Command("follow", "Follow someone on Twitter on behalf of the server.", async (bot, interaction) => await toggleFollow(interaction, "follow"), 0, [
    {
      name: "username",
      description: "Who do you want to follow?",
      type: 3,
      required: true
    }
  ]);

  new Command("unfollow", "Unfollow someone on Twitter on behalf of the server.", async (bot, interaction) => await toggleFollow(interaction, "unfollow"), 0, [
    {
      name: "username",
      description: "Who do you want to unfollow?",
      type: 3,
      required: true
    }
  ]);
  
};
