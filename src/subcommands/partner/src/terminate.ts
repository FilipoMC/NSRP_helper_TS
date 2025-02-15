import { SlashCommandProps } from "commandkit";
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { MPartnership } from "../../../schemas/partnership";
import { parse as ms } from '@lukeed/ms';

import * as config from "../../../config/index";

export default async function({ interaction, client }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});

   const id = interaction.options.getString("id") as string;
   const reason = interaction.options.getString("reason") as string;

   const document = await MPartnership.findOneAndDelete({logMessageID: id});
   if (!document) {
      await interaction.followUp("Partnership not found.");
      return;
   }
   
   const partnerChannel = await client.channels.fetch(config.main.partnerChannel);
   const partnerLogChannel = await client.channels.fetch(config.main.partnerLogChannel);
   if (!partnerChannel?.isTextBased() || !partnerLogChannel?.isTextBased()) return;

   const messageURL = `https://discord.com/channels/${config.main.mainServer}/${config.main.partnerChannel}/${document.messageID}`;
   const logMessageURL = `https://discord.com/channels/${config.main.mainServer}/${config.main.partnerLogChannel}/${document.logMessageID}`;
   
   const embed = new EmbedBuilder()
      .setTitle("Terminated Partnership:")
      .setDescription(
         `**Made by:** <@!${document.by}> (${document.by})\n` +
         `**Rep:** <@!${document.rep}> (${document.rep})\n` +
         `**Ad:** Press the button below.\n` +
         `**Message ID: ** [${document.messageID}](${messageURL})\n` +
         `**Log message ID:** [${document.logMessageID}](${logMessageURL})`  
      )
      .setColor("Green")


   const logEmbed = new EmbedBuilder()
   .setTitle("Partnership terminated.")
   .setDescription(
      "Server Ad:\n```" +
      document.ad + "```\n" +
      `By: <@!${document.by}>` + "\n" +
      `Rep: <@!${document.rep}>\n` +
      `Terminated by: <@!${interaction.user.id}>\n` +
      `Reason: ${reason}`
   ).setColor("Red");
   
   const buttonID = `partner-find-${interaction.user.id}-${Date.now()}`;
   const actionRow = new ActionRowBuilder<ButtonBuilder>({components: [new ButtonBuilder({customId: buttonID, label: "Server ad", style: ButtonStyle.Success})]})
   const sentMessage = await interaction.followUp({embeds: [embed], components: [actionRow]});
   await partnerLogChannel.send({embeds: [logEmbed]});

   try {
      (await partnerChannel.messages.fetch(document.messageID)).delete();
      (await partnerLogChannel.messages.fetch(document.logMessageID)).delete(); 
   } catch (error) {
      await interaction.followUp({ephemeral: true, content: "❌ Couldn't delete message or log message"});
   }

   const collector = sentMessage.createMessageComponentCollector({componentType: ComponentType.Button, filter: b => b.customId === buttonID, time: ms("5m")});
   collector.on("collect", async subInteraction => {
       subInteraction.reply({ephemeral: true, content: `\`\`\` ${document.ad} \`\`\``});
   });
}