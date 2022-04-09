import { TwitterApi } from "twitter-api-v2";

export default async (guildId, collections, noTokens) => {
  
  const {accessToken, accessSecret} = await collections.twitterAuthInfo.findOne({guildId: guildId}) || {};

  // Check if we're authorized
  if (!noTokens && (!accessToken || !accessSecret)) {
    
    throw new Error("I don't have permission to use Twitter in this server");

  }

  // Set up the client 
  return new TwitterApi({
    appKey: process.env.twitterAPIKey,
    appSecret: process.env.twitterAPIKeySecret,
    accessToken,
    accessSecret
  });

};
