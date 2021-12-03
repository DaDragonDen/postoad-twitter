const commands = require("../commands");

module.exports = (_, collections, prepareForMedia) => {

  new commands.new("tweet", "Tweet something on behalf of the server.", async (bot, interaction) => {
    
    let subcommand;
    let content;
    let twitter;

    // Make sure they have permission to do this
    await require("../modules/check-permissions")(interaction.member, collections);

    subcommand = interaction.data.options[0];
    content = subcommand.options && subcommand.options[0].value;
    twitter = await require("../modules/twitter")(interaction.guildID, {interaction: interaction, collections: collections});
    
    switch (subcommand.name) {

      case "text": {
        
        // Tweet the text
        const {data: tweet} = await twitter.v2.tweet(content);
        return await interaction.createFollowup("done https://twitter.com/i/status/" + tweet.id);

      }

      case "media":

        // Prepare to get media
        await prepareForMedia(interaction, content);

      default:
        break;

    }

  }, 0, [
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
  ]);
  
}