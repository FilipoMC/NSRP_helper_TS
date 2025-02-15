import type { ValidationProps } from "commandkit";
import { ChatInputCommandInteraction } from "discord.js";

export default function({ client, commandObj, interaction, handler }: ValidationProps) {
   const option = commandObj.options?.devOnlySubcommands;
   const interaction1 = interaction as ChatInputCommandInteraction;
   if (!option) return false;

   if (option.includes(interaction1.options.getSubcommand())) {
      if (!handler.devUserIds.includes(interaction.user.id)) {
         interaction1.reply({content: "❌ This command can only be used by developers.", ephemeral: true});
         return true;
      }
   }
}