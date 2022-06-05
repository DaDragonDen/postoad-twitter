import { Command } from "../commands.js";
import verifyPermissions from "../modules/check-permissions.js";
import getTwitterClient from "../modules/twitter.js";

export default ({collections}) => {
  
  const toggleBlock = async (interaction, action) => {

    // Make sure they have permission to do this
    await verifyPermissions(interaction.member, collections);

    // Make sure it's a valid username
    const username = interaction.data.options[0].value;
    if (!/^@?(\w){1,15}$/gm.test(username)) throw new Error(`"${username}" isn't a valid Twitter username`);

    // Get the user ID
    const twitter = await getTwitterClient(interaction.guildID, collections);
    const targetUser = await twitter.v2.usersByUsernames(username);
    if (!targetUser) throw new Error(`@${username} doesn't exist :(`);

    // (Un-)block the user
    const user = await twitter.currentUser();
    await twitter.v2[action](user.id_str, targetUser.data[0].id);
    await interaction.createFollowup(action === "block" ? `@${username} has been...\`blocked.\`` : `@${username} has been freed 👍`);

  };

  new Command({
    name: "block", 
    description: "Block someone on Twitter on behalf of the server.", 
    action: async (interaction) => await toggleBlock(interaction, "block"), 
    cooldown: 0, 
    slashOptions: [
      {
        name: "username",
        description: "Who do you want to block?",
        type: 3,
        required: true
      }
    ]
  });

  new Command({
    name: "unblock", 
    description: "Unblock someone on Twitter on behalf of the server.", 
    action: async (interaction) => await toggleBlock(interaction, "unblock"), 
    cooldown: 0, 
    slashOptions: [
      {
        name: "username",
        description: "Who do you want to unblock?",
        type: 3,
        required: true
      }
    ]
  });
  
};
