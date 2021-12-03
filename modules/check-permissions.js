module.exports = async (member) => {
  
  if (!member.permissions.has("administrator")) {

    throw new Error("you don't have permission to use Twitter on behalf of this server");

  }

}