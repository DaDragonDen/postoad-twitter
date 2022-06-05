import { Command } from "../commands.js";
import verifyPermissions from "../modules/check-permissions.js";
import getTwitterClient from "../modules/twitter.js";

export default ({collections}) => {

  const toggleLike = async (interaction, action) => {

    // Make sure they have permission to do this
    await verifyPermissions(interaction.member, collections);

    // Make sure the Tweet ID format is valid.
    const match = [...interaction.data.options[0].value.matchAll(/twitter\.com\/[^/]+\/[^/]+\/(?<tweetId>\d+)/gm)];
    const tweetId = match[0]?.[1];
    if (!tweetId) throw new Error("That isn't a Tweet.");

    // Get the server's Twitter account.
    const twitter = await getTwitterClient(interaction.guildID, collections);
    const user = await twitter.currentUser();
    
    // Like (or unlike) the post.
    await twitter.v2[action](user.id_str, tweetId);
    await interaction.createFollowup(action === "like" ? "this is the one ♥" : "heartbroken 💔");

  };

  new Command({
    name: "like", 
    description: "Like something on Twitter on behalf of the server.", 
    action: async (interaction) => await toggleLike(interaction, "like"), 
    cooldown: 0, 
    slashOptions: [
      {
        name: "tweet_url",
        description: "What do you want to like?",
        type: 3,
        required: true
      }
    ]
  });

  new Command({
    name: "unlike", 
    description: "Unlike something on Twitter on behalf of the server.", 
    action: async (interaction) => await toggleLike(interaction, "unlike"), 
    cooldown: 0, 
    slashOptions: [
      {
        name: "tweet_url",
        description: "What do you want to unlike?",
        type: 3,
        required: true
      }
    ]
  });
  
};
