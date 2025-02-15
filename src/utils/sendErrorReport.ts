import { ChatInputCommandInteraction, EmbedBuilder, Interaction } from "discord.js";

import * as config from "../config/index";

export interface ISendErrorReport {
   interaction: ChatInputCommandInteraction,
   description: string,
   error: string | Error
};

export async function sendErrorReport({ description, error, interaction }: ISendErrorReport) {
   const SError = error.toString();
   await interaction.editReply(`${config.emojis.red_cross} There was an error while executing this command. It has been sent to the bot devs.`).catch(async () => {
      await interaction.reply({ephemeral: true, content: `${config.emojis.red_cross} There was an error while executing this command. It has been sent to the bot devs.`}).catch(() => null);
   })

   const errorReportsChannel = await interaction.guild?.channels.fetch(config.main.errorReportsChannel);
   if (!errorReportsChannel?.isTextBased()) return;

   let embed = new EmbedBuilder({
      title: "New Error!",
      description: 
      `There was an error!`+"\n"+
      `Error description: ${description}`+"\n"+
      "Error: \n" +
      error,
   }).setColor("#ff0000");

   await errorReportsChannel.send({content: "@everyone", embeds: [embed]});
}