import { Command } from "../commands.js";
import verifyPermissions from "../modules/check-permissions.js";
import getTwitterClient from "../modules/twitter.js";

export default (_, collections) => {

  const toggleLike = async (interaction, action) => {

    // Make sure they have permission to do this
    await verifyPermissions(interaction.member, collections);

    // Make sure the Tweet ID format is valid.
    const match = [...interaction.data.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];

    if (!match) throw new Error("That isn't a Tweet.");

    // Like the Tweet
    const tweetId = match[0][1];
    const twitter = await getTwitterClient(interaction.guildID, collections);
    const user = await twitter.currentUser();
    
    await twitter.v2[action](user.id_str, tweetId);
    await interaction.createFollowup(action === "like" ? "this is the one ♥" : "heartbroken 💔");

  };

  new Command("like", "Like something on Twitter on behalf of the server.", async (bot, interaction) => await toggleLike(interaction, "like"), 0, [
    {
      name: "tweet_url",
      description: "What do you want to like?",
      type: 3,
      required: true
    }
  ]);

  new Command("unlike", "Unlike something on Twitter on behalf of the server.", async (bot, interaction) => await toggleLike(interaction, "unlike"), 0, [
    {
      name: "tweet_url",
      description: "What do you want to unlike?",
      type: 3,
      required: true
    }
  ]);
  
};
