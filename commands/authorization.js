import { randomBytes } from "crypto";
import { TwitterApi } from "twitter-api-v2";
import { Command } from "../commands.js";
import verifyPermissions from "../modules/check-permissions.js";
import getTwitterClient from "../modules/twitter.js";

const oauthInfo = {};
let collectionsCopy;

export async function authorizeTwitter(code, verifier) {

  if (!verifier) {

    throw new Error("Verifier not provided");
  
  }

  // Create a client from the temporary access tokens.
  // Use a block scope because we can't const the same names twice.
  let twitterClient;
  const {guildId} = oauthInfo[code];
  {

    const {accessToken, accessSecret} = oauthInfo[code];
    twitterClient = new TwitterApi({
      appKey: process.env.twitterAPIKey,
      appSecret: process.env.twitterAPIKeySecret,
      accessToken,
      accessSecret
    });

    // Delete the code.
    delete oauthInfo[code];

  }

  // Save the new access tokens.
  const {accessToken, accessSecret} = await twitterClient.login(verifier);
  await collectionsCopy.twitterAuthInfo.updateOne(
    {guildId},
    {
      $set: {
        guildId, 
        accessToken, 
        accessSecret
      }
    },
    {upsert: true}
  );

}

export default ({collections}) => {

  // Save the collections for later.
  collectionsCopy = collections;

  async function manageAuthorization(interaction) {

    // Verify that the user has permission to do this.
    const {member, data: {options: [subcommand]}, guildID} = interaction;
    verifyPermissions(member);

    // Find out what the user wants to do.
    switch (subcommand.name) {

      case "grant": {

        // Generate a secret code so that it's harder for non-admins to authorize an account.
        const secretCode = randomBytes(28).toString("hex");
        
        // Create a Twitter auth link.
        const twitterClient = await getTwitterClient(guildID, collections, true);
        const {url, oauth_token: accessToken, oauth_token_secret: accessSecret} = await twitterClient.generateAuthLink(process.env.twitterCallbackURL + "?code=" + secretCode, {linkMode: "authorize"});

        // Save the code for later.
        oauthInfo[secretCode] = {
          guildId: guildID,
          accessToken,
          accessSecret
        };

        // Ask the user to authorize Postoad.
        await interaction.createFollowup("You can authorize me to let this server use a Twitter account on your behalf by clicking this link: " + url + "\n\n> ☝️ **Head's up:** *Anyone* with this link can authorize *any* account to this server. Be careful not to share it to any baddies!");

        break;

      }

      case "delete": {

        // Delete any tokens we have.
        const {deletedCount} = await collections.twitterAuthInfo.deleteOne({guildId: guildID});

        // Tell the user.
        if (deletedCount === 0) {

          await interaction.createFollowup("I don't have any tokens stored in this server.");

        } else {

          await interaction.createFollowup("Deleted the tokens on my side! If you don't want me to use your account in *any* server anymore, revoke access here: https://twitter.com/settings/connected_apps");

        }
        break;

      }

      case "view": {

        // Get the current user.
        const twitterClient = await getTwitterClient(guildID, collections);
        const {id_str: id, name, screen_name: username, description, profile_image_url: icon_url, profile_banner_url} = await twitterClient.currentUser();

        // Tell the user.
        await interaction.createFollowup({
          content: "This server is currently using the following profile:",
          embed: {
            author: {
              name: `${name} @${username}`,
              icon_url,
              url: `https://twitter.com/${username}`
            },
            description,
            image: {
              url: profile_banner_url
            },
            footer: {
              text: id
            }
          }
        });
        break;

      }

      default:
        break;

    }

  }

  new Command({
    name: "authorization", 
    description: "Manage your Postoad's authorization to use your server's Twitter account.", 
    action: async (interaction) => await manageAuthorization(interaction), 
    cooldown: 0, 
    slashOptions: [
      {
        name: "grant",
        description: "Authorize Postoad to use a Twitter account in this server.",
        type: 1,
      },
      {
        name: "delete",
        description: "Delete Postoad's access keys to use a Twitter account.",
        type: 1
      },
      {
        name: "view",
        description: "View Postoad's current authorization status in this server.",
        type: 1
      }
    ],
    ephemeral: true
  });

};
