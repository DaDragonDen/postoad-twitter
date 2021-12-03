const commands = require("../commands");

module.exports = (_, collections) => {

  new commands.new("reply", "Reply to a Tweet on behalf of the server.", async (bot, interaction) => {

    const subcommand = interaction.data.options[0];
    const content = subcommand.options[1] && subcommand.options[1].value;
    let twitter;
    let match; 
    let tweetId;
    let tweet;

    // Get the Tweet ID
    match = [...subcommand.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];

    if (!match) throw new Error("that isn't a tweet");

    tweetId = match[0][1];

    // Get the Twitter client
    twitter = await require("../modules/twitter")(interaction.guildID, {interaction: interaction, collections: collections});

    switch (subcommand.name) {

      case "text": {
        
        // Tweet the text
        tweet = await twitter.v2.reply(content, tweetId);
        return await interaction.createFollowup("done https://twitter.com/i/status/" + tweet.data.id);

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
  
}