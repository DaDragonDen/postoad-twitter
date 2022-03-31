module.exports = (async () => {
  
  const MongoDB = require("mongodb");
  const MDBC = new MongoDB.MongoClient(
    process.env.mongoDomain, 
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
  
  await MDBC.connect();

  return MDBC;

})();
