import { SlashCommandProps } from "commandkit";
import { MPartnership } from "../../../schemas/partnership";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";

import * as config from "../../../config/index";
import { parse as ms } from '@lukeed/ms';

export default async function({ interaction, client }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});

   const id = interaction.options.getString("id") as string;

   const document = await MPartnership.findOne({logMessageID: id});
   if (!document) {
      await interaction.followUp("Partnership not found.");
      return;
   }

   const messageURL = `https://discord.com/channels/${config.main.mainServer}/${config.main.partnerChannel}/${document.messageID}`;
   const logMessageURL = `https://discord.com/channels/${config.main.mainServer}/${config.main.partnerLogChannel}/${document.logMessageID}`;

   const embed = new EmbedBuilder()
      .setTitle("Partnership:")
      .setDescription(
         `**Made by:** <@!${document.by}> (${document.by})\n` +
         `**Rep:** <@!${document.rep}> (${document.rep})\n` +
         `**Ad:** Press the button below.\n` +
         `**Invite:** https://${document.invite}\n` +
         `**Message ID: ** [${document.messageID}](${messageURL})\n` +
         `**Log message ID:** [${document.logMessageID}](${logMessageURL})`  
      )
      .setColor("Green")


   const buttonID = `partner-find-${interaction.user.id}-${Date.now()}`;
   const actionRow = new ActionRowBuilder<ButtonBuilder>({components: [new ButtonBuilder({customId: buttonID, label: "Server ad", style: ButtonStyle.Success})]})
   const sentMessage = await interaction.followUp({embeds: [embed], components: [actionRow]});

   const collector = sentMessage.createMessageComponentCollector({componentType: ComponentType.Button, filter: b => b.customId === buttonID, time: ms("1m")});
   collector.on("collect", async subInteraction => {
       subInteraction.reply({ephemeral: true, content: `\`\`\` ${document.ad} \`\`\``});
   })
}