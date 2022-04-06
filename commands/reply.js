import { Command } from "../commands.js";

export default (_, collections) => {

  new Command("reply", "Reply to a Tweet on behalf of the server.", async (bot, interaction) => {

    // Make sure they have permission to do this
    await require("../modules/check-permissions").default(interaction.member, collections);

    // Get the Tweet ID
    const subcommand = interaction.data.options[0];
    const match = [...subcommand.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];

    if (!match) throw new Error("that isn't a tweet");

    const tweetId = match[0][1];

    // Get the Twitter client
    const twitter = await require("../modules/twitter").default(interaction.guildID, collections);
    const content = subcommand.options[1] && subcommand.options[1].value;
    
    switch (subcommand.name) {

      case "text": {
        
        // Tweet the text
        const tweet = await twitter.v2.reply(content, tweetId);
        return await interaction.createFollowup("done https://twitter.com/i/status/" + tweet.data.id);

      }

      case "media":

        // Prepare to get media
        //await prepareForMedia(interaction, content);
        break;

      default:
        break;

    }

  }, 0, [
    {
      name: "text",
      description: "Reply to a Tweet with text on behalf of the server",
      type: 1,
      options: [
        {
          name: "tweet_url",
          description: "What do you want to reply to?",
          type: 3,
          required: true
        },
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
      description: "Reply to a Tweet with media, and optionally text on behalf of the server",
      type: 1,
      options: [
        {
          name: "tweet_url",
          description: "What do you want to reply to?",
          type: 3,
          required: true
        },
        {
          name: "content",
          description: "What do you want to say?",
          type: 3
        }
      ]
    }
  ]);
  
};
