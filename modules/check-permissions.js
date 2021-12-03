module.exports = async (member, collections) => {

  if (!member) {
    
    throw new Error("you can't do this in a DM");

  } else if (!member.permissions.has("administrator")) {

    throw new Error("you don't have permission to use Twitter on behalf of this server");

  }

}