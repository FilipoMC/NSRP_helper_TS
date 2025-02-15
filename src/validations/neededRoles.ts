import type { ValidationProps } from "commandkit";

import * as config from "../config/index.ts";
import { ChatInputCommandInteraction } from "discord.js";

export default async function( { client, interaction, commandObj }: ValidationProps ) {
   if (!interaction.member) return;
   if (!interaction.inCachedGuild()) return;
   if (!commandObj.options?.neededRoles) return;
   
   const int: ChatInputCommandInteraction = interaction as ChatInputCommandInteraction;
   
   const neededRoles = commandObj.options.neededRoles;
   
   let hasPerms = false;
   if (interaction.member.roles.cache.has(config.ranks.categories.ls)) hasPerms = true;
   for (const role of neededRoles) {
      if (interaction.member?.roles.cache.has(role)) hasPerms = true;
   }
   if (!hasPerms) {
      // return; //FIXME: Delete
      int.reply({content: "❌ You don't have permissions to run this command!", ephemeral: true});
      return true;
   }
}