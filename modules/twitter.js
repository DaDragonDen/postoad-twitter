const {TwitterApi} = require("twitter-api-v2");

module.exports = async (guildId, collections) => {
  
  const twitterAuth = await collections.twitterAuthInfo.findOne({guildId: guildId});

  // Check if we're authorized
  if (!twitterAuth || !twitterAuth.access_token || !twitterAuth.access_secret) {
    
    throw new Error("I don't have permission to use Twitter in this server");

  }

  // Set up the client 
  return new TwitterApi({
    appKey: process.env.twitterAPIKey,
    appSecret: process.env.twitterAPIKeySecret,
    accessToken: twitterAuth.access_token,
    accessSecret: twitterAuth.access_secret
  });

}