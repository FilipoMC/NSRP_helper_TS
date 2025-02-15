import { CommandOptions, SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";

import subcommands from "../../subcommands/blacklist/index.ts";

export const data = new SlashCommandBuilder()
   .setName("blacklist")
   .setDescription("Blacklist stuff.")
   .setDMPermission(false)
   .addSubcommand(s => s
      .setName("discord")
      .setDescription("Blacklist a user from the server.")
      .addUserOption(o => o
         .setName("member")
         .setDescription("The member to blacklist")
         .setRequired(true)
      )
      .addStringOption(o => o
         .setName("reason")
         .setDescription("The reason of the blacklist.")
         .setRequired(true)
      )
   )
   .addSubcommand(s => s
      .setName("roblox")
      .setDescription("Blacklist a user from their roblox ID")
      .addNumberOption(o => o
         .setName("id")
         .setDescription("ID of the user you want to blacklist.")
         .setRequired(true)
      )
      .addStringOption(o => o
         .setName("reason")
         .setDescription("Reason of the blacklist.")
         .setRequired(true)
      )
      .addStringOption(o => o
         .setName("discord-id")
         .setDescription("Discord ID of the user you want to blacklist.")
         .setRequired(false)
      )
      .addStringOption(o => o
         .setName("discord-name")
         .setDescription("Discord username of the user you want to blacklist.")
         .setRequired(false)
      )
   )
   .addSubcommand(s => s
      .setName("server")
      .setDescription("Blacklist a server from the server.")
      .addStringOption(o => o
         .setName("id")
         .setDescription("ID of the server you want to blacklist.")
         .setRequired(true)
      )
      .addStringOption(o => o
         .setName("server-name")
         .setDescription("Name of the server you want to blacklist.")
         .setRequired(true)
      )
      .addStringOption(o => o
         .setName("reason")
         .setDescription("Reason of the blacklist.")
         .setRequired(true)
      )
      .addNumberOption(o => o
         .setName("roblox-group-id")
         .setDescription("Roblox group ID of the server you want to blacklist.")
         .setRequired(false)
      )
   )
   .addSubcommandGroup(sg => sg
      .setName("revoke")
      .setDescription("revoke blacklists")
      .addSubcommand(s => s
         .setName("user")
         .setDescription("Revoke a user blacklist.")
         .addNumberOption(o => o
            .setName("id")
            .setDescription("Roblox ID of the blacklist.")
            .setRequired(true)
         )
         .addStringOption(o => o
            .setName("reason")
            .setDescription("Reason of the revoke.")
            .setRequired(true)
         )
         
      )
   )
   .addSubcommand(s => s
      .setName("ban")
      .setDescription("Bans a person from their blacklist.")
      .addStringOption(o => o
         .setName("id")
         .setDescription("Discord ID of the person you want to ban")
         .setRequired(true)
      )
   )

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<void> {
   const subcommand: "discord" | "roblox" | "ban" | "user" | "server" = interaction.options.getSubcommand() as "discord" | "roblox" | "ban" | "user" | "server";
   const subcommandGroup = interaction.options.getSubcommandGroup() as "revoke" | null;

   if (!subcommandGroup) {
      switch (subcommand) {
         case "ban":
            await subcommands.ban({interaction: interaction, client: client} as SlashCommandProps);
         break;
         case "discord":
            await subcommands.discord({ client: client, interaction: interaction } as SlashCommandProps);
         break;
         case "roblox":
            await subcommands.roblox({ client: client, interaction: interaction } as SlashCommandProps);
         break;
         case "server":
            await subcommands.server({ client: client, interaction: interaction } as SlashCommandProps);
         break;
      }
   } else {
      switch (subcommandGroup) {
         case "revoke":
            subcommands.revoke.user({client: client, interaction: interaction} as SlashCommandProps);
         break;
      }
   }
}

export const options: CommandOptions = {
   useCategoryPerms: true,
   devOnlySubcommands: ["ban"]
}