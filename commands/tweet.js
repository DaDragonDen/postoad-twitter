import { Command } from "../commands.js";
import verifyPermissions from "../modules/check-permissions.js";
import getTwitterClient from "../modules/twitter.js";

export default (_, collections, prepareForMedia) => {

  new Command({
    name: "tweet", 
    description: "Tweet something on behalf of the server.", 
    action: async (interaction) => {

      // Make sure they have permission to do this
      await verifyPermissions(interaction.member, collections);

      const subcommand = interaction.data.options[0];
      const content = subcommand.options && subcommand.options[0].value;
      const twitter = await getTwitterClient(interaction.guildID, collections);
      
      switch (subcommand.name) {

        case "text": {
          
          // Tweet the text
          const {data: tweet} = await twitter.v2.tweet(content);
          return await interaction.createFollowup("done https://twitter.com/i/status/" + tweet.id);

        }

        case "media":

          // Prepare to get media
          await prepareForMedia(interaction, content);
          break;

        default:
          break;

      }

    }, 
    cooldown: 0, 
    slashOptions: [
      {
        name: "text",
        description: "Send a text-only Tweet on behalf of the server.",
        type: 1,
        options: [
          {
            name: "content",
            description: "What do you want to say?",
            type: 3,
            required: true
          }
        ]
      },
      {
        name: "media",
        description: "Send a Tweet with media on behalf of the server.",
        type: 1,
        options: [
          {
            name: "content",
            description: "Do you want to add text to your Tweet? Put it here.",
            type: 3
          }
        ]
      }
    ]
  });
  
};
