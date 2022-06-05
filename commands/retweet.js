import { Command } from "../commands.js";
import verifyPermissions from "../modules/check-permissions.js";
import getTwitterClient from "../modules/twitter.js";

export default ({collections}) => {

  const toggleRetweet = async (interaction, action) => {

    // Make sure they have permission to do this
    await verifyPermissions(interaction.member, collections);

    // Get Tweet ID
    const match = [...interaction.data.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];

    if (!match) throw new Error("That isn't a Tweet");

    const tweetId = match[0][1];

    // Retweet the Tweet
    const twitter = await getTwitterClient(interaction.guildID, collections);
    const user = await twitter.currentUser();
    
    await twitter.v2[action](user.id_str, tweetId);
    await interaction.createFollowup(action === "retweet" ? "shared it, shared it, shared it" : "done");

  };

  new Command({
    name: "retweet", 
    description: "Retweet something on behalf of the server.", 
    action: async (interaction) => toggleRetweet(interaction, "retweet"), 
    cooldown: 0, 
    slashOptions: [
      {
        name: "tweet_url",
        description: "What do you want to retweet?",
        type: 3,
        required: true
      }
    ]
  });

  new Command("unretweet", "Unretweet something on behalf of the server.", async (interaction) => await toggleRetweet(interaction, "unretweet"), 0, [
    {
      name: "tweet_url",
      description: "What do you want to unretweet?",
      type: 3,
      required: true
    }
  ]);
  
};
