import { SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";

import * as config from "../../config/index";

export const data = new SlashCommandBuilder()
   .setName("say")
   .setDescription("Sends a message")
   .setDMPermission(false)
   .addStringOption(o => o
      .setName("text")
      .setDescription("Text to send.")
      .setRequired(true)
   )

export async function run({interaction}: SlashCommandProps) {
   interaction.channel?.send(interaction.options.getString("text") as string);
   interaction.reply({ephemeral: true, content: `${config.emojis.green_checkmark} Success!`});
}