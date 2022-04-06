import { Command } from "../commands.js";

export default (_, collections) => {

  new Command("update", "Update the server's Twitter profile", async (bot, interaction, prepareForMedia) => {

    // Make sure they have permission to do this
    await require("../modules/check-permissions")(interaction.member, collections);

    // Find out what they want to do
    const subcommand = interaction.data.options[0];
    const twitter = await require("../modules/twitter")(interaction.guildID, collections);
    
    switch (subcommand.name) {

      case "name":
      case "url":
      case "location":
      case "description":
        await twitter.v1.updateAccountProfile({
          [subcommand.name]: subcommand.options[0].value
        });
        await interaction.createFollowup("done");
        break;

      case "avatar":
      case "banner":
        await prepareForMedia(interaction, undefined, subcommand.name);
        break;

      default:
        break;

    }

  }, 0, [
    {
      name: "name",
      description: "Update the display name of the server's Twitter profile",
      type: 1,
      options: [
        {
          name: "new_name",
          description: "What should the account be called?",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "url",
      description: "Update the URL of the server's Twitter profile",
      type: 1,
      options: [
        {
          name: "new_url",
          description: "What should the new URL be?",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "location",
      description: "Update the location of the server's Twitter profile",
      type: 1,
      options: [
        {
          name: "new_location",
          description: "Where are you?",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "description",
      description: "Update the description of the server's Twitter profile",
      type: 1,
      options: [
        {
          name: "new_description",
          description: "What should the new description be?",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "avatar",
      description: "Update the avatar of the server's Twitter profile",
      type: 1
    },
    {
      name: "banner",
      description: "Update the banner of the server's Twitter profile",
      type: 1,
      options: [
        {
          name: "remove",
          description: "Do you want to remove the banner instead?",
          type: 5
        },
        {
          name: "offset_top",
          description: "In pixels, how much should I offset from the top?",
          type: 10
        },
        {
          name: "offset_left",
          description: "In pixels, how much should I offset from the top?",
          type: 10
        },
        {
          name: "width",
          description: "In pixels, what should the width of the banner be?",
          type: 10
        },
        {
          name: "height",
          description: "In pixels, what should the height of the banner be?",
          type: 10
        },
      ]
    }
  ]);
  
};
