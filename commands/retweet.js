import { Command } from "../commands.js";
import verifyPermissions from "../modules/check-permissions.js";
import getTwitterClient from "../modules/twitter.js";

export default ({collections}) => {

  const toggleRetweet = async (interaction, action) => {

    // Make sure they have permission to do this
    await verifyPermissions(interaction.member, collections);

    // Get Tweet ID
    const match = [...interaction.data.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];
    const tweetId = match[0]?.[1];

    if (!tweetId) throw new Error("that isn't a tweet.");

    // Get the Twitter client of the server.
    const twitter = await getTwitterClient(interaction.guildID, collections);

    // Retweet (or unretweet) the post.
    const user = await twitter.currentUser();
    await twitter.v2[action](user.id_str, tweetId);

    // Tell the user.
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
