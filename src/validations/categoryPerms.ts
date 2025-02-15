import type { ValidationProps } from "commandkit";

import * as config from "../config/index.ts";
import { ChatInputCommandInteraction, Snowflake } from "discord.js";

export default function( { client, commandObj, interaction, handler }: ValidationProps ) {
   if (!interaction.inCachedGuild()) return;
   if (!commandObj.options?.useCategoryPerms) return;

   const int: ChatInputCommandInteraction = interaction as ChatInputCommandInteraction;
   const cat = commandObj.category;

   let permRoles: Array<Snowflake> | false;
   switch (cat) {
      case "IA":
         permRoles = [config.ranks.categories.ia, config.ranks.categories.mg];
         // permRoles = false;
      break;
      case "MG":
         permRoles = [config.ranks.categories.mg];
         // permRoles = false;
      break;
      case "staff":
         permRoles = [config.ranks.categories.staff];
      break;
      case "blacklists":
         // permRoles = [config.ranks.categories.ls];
         permRoles = false;
      break;
      case "partnership":
         permRoles = [config.ranks.categories.mg];
         // permRoles = false;
      break;
      case "sessions":
         permRoles = [config.ranks.other.ssuPerms];
         // permRoles = []
         // permRoles = false;
      break;
      default: 
         permRoles = false;
   }
   if (permRoles === false) return;

   let hasPerms = false;
   if (interaction.member.roles.cache.has(config.ranks.categories.ls)) hasPerms = true;
   for (const role of permRoles) {
      if (interaction.member?.roles.cache.has(role)) hasPerms = true;
   }
   if (!hasPerms) {
      // return; //FIXME: Delete
      int.reply({content: "❌ You don't have permissions to run this command!", ephemeral: true});
      return true;
   }
}