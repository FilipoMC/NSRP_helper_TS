import { SlashCommandProps } from "commandkit";
import * as config from "../../../config";

export default async function({interaction}: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   if (!interaction.inCachedGuild()) return;

   for (const [,member] of (await interaction.guild.roles.fetch(config.main.activityTestRole))!.members) {
      if (member.roles.cache.has(config.main.activityTestRole)) {
         member.roles.remove(config.main.activityTestRole);
      }
   }
   
   await interaction.followUp("Success!");
}