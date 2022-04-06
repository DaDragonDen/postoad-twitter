import { Command } from "../commands.js";

export default (_, collections) => {

  new Command("permissions", "View or modify permissions for a member or role", async (bot, interaction) => {

  }, 0, [
    {
      name: "view",
      description: "View permissions for a member, a role, or non-administrators",
      type: 1,
      options: [
        {
          name: "member",
          description: "Who do you want to know about?",
          type: 6
        },
        {
          name: "role",
          description: "What role do you want to know about?",
          type: 8
        }
      ]
    },
    {
      name: "default",
      description: "Remove permission overrides for a member or a role",
      type: 1,
      options: [
        {
          name: "member",
          description: "Who do you want to know about?",
          type: 6
        },
        {
          name: "role",
          description: "What role do you want to know about?",
          type: 8
        }
      ]
    },
    {
      name: "set",
      description: "Modify permissions for a member, a role, or non-administrators",
      type: 1,
      options: [
        {
          name: "command",
          description: "What command are you talking about? (for example: \"tweet\", \"update\", \"update description\", etc.)",
          type: 3,
          required: true
        },
        {
          name: "allowed",
          description: "Should this command be allowed?",
          type: 5,
          required: true
        },
        {
          name: "member",
          description: "Who do you want to allow or disallow to use this command?",
          type: 6
        },
        {
          name: "role",
          description: "What role do you want to allow or disallow?",
          type: 8
        }
      ]
    }
  ]);

};
