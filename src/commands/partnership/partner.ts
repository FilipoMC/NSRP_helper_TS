import type { SlashCommandProps, CommandOptions, CommandData } from "commandkit";
import { SlashCommandBuilder, EmbedBuilder, TextChannel, User } from "discord.js";

import subcommands from "../../subcommands/partner/index.ts";

import * as config from "../../config/index.ts";

export const data = new SlashCommandBuilder()
   .setName("partner")
   .setDescription("Send partnership questions111gfh")
   .setDMPermission(false)
   .addSubcommand(s => s
      .setName("send-questions")
      .setDescription("Send partnership questions.")
      .addUserOption(o => o
         .setName("user")
         .setDescription("User to ping.")
         .setRequired(false)
      )
   )
   .addSubcommand(s => s
      .setName("create")
      .setDescription("Make a new partnership (send ad, send log, log in database)")
      .addUserOption(o => o
         .setName("rep")
         .setDescription("The server representative.")
         .setRequired(true)
      )
      .addBooleanOption(o => o
         .setName("ping")
         .setDescription("Should the ad be sent with ping?")
         .setRequired(true)
      )
      .addBooleanOption(o => o
         .setName("prompt")
         .setDescription("Prompt the user to confirm that they've sent the ad.")
         .setRequired(true)
      )
   )
   .addSubcommand(s => s
      .setName("resend-ad")
      .setDescription("Send the ad to partnerships channel, without making a new partnership.")
      .addStringOption(o => o
         .setName("id")
         .setDescription("ID of the log message.")
         .setRequired(true)
      )
   )
   .addSubcommand(s => s
      .setName("find")
      .setDescription("Find a partnership")
      .addStringOption(o => o
         .setName("id")
         .setDescription("ID of the log message.")
         .setRequired(true)
      )
   )
   .addSubcommand(s => s
      .setName("find-by-user")
      .setDescription("Find all partnerships by user")
      .addUserOption(o => o
         .setName("user")
         .setDescription("User to find partnerships.")
         .setRequired(false)
      )
      .addStringOption(o => o
         .setName("id")
         .setDescription("ID of the user.")
         .setRequired(false)
      )
   )
   .addSubcommand(s => s
      .setName("terminate")
      .setDescription("Terminate a partnership")
      .addStringOption(o => o
         .setName("id")
         .setDescription("ID of the log message.")
         .setRequired(true)
      )
      .addStringOption(o => o
         .setName("reason")
         .setDescription("Reason of the termination")
         .setRequired(true)
      )
   )

export async function run( { client, interaction, handler }: SlashCommandProps ) {
   const subcommand = interaction.options.getSubcommand();

   switch (subcommand) {
      case "send-questions":
         await subcommands.questions({interaction: interaction, client: client} as SlashCommandProps);
      break;
      case "create":
         await subcommands.create({interaction: interaction, client: client} as SlashCommandProps);
      break;
      case "resend-ad":
         await subcommands.resendAd({interaction: interaction, client: client} as SlashCommandProps);
      break;
      case "find":
         await subcommands.find({interaction: interaction, client: client} as SlashCommandProps);
      break;
      case "find-by-user":
         await subcommands.findByUser({interaction: interaction, client: client} as SlashCommandProps);
      break;
      case "terminate":
         await subcommands.terminate({interaction: interaction, client: client} as SlashCommandProps);
      break;
   }
}  

export const options: CommandOptions = {
   useCategoryPerms: true
}