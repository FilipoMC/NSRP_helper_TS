import { ButtonKit, SlashCommandProps } from "commandkit";
import { MActivityCheck } from "../../../schemas/activity-test";

import { v4 as uuid } from "uuid";
import { ActionRowBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, Snowflake, time } from "discord.js";

import * as config from "../../../config";

export default async function({interaction}: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   if (!interaction.inCachedGuild()) return;

   const id = interaction.options.getString("id");

   const document = await MActivityCheck.findOne({ID: id});
   if (!document) {
      await interaction.followUp("Activity test not found.");
      return;
   }
   
   const deadlineTimestamp = Math.floor((new Date(document.deadline).getTime())/1000);

   const activeButtonCustomID = uuid();

   const activeButton = new ButtonKit()
      .setLabel("I'm active!")
      .setStyle(ButtonStyle.Success)
      .setCustomId(activeButtonCustomID);

   await document.updateOne({$set: {buttonID: activeButtonCustomID}});

   const row = new ActionRowBuilder<ButtonKit>().setComponents(activeButton);

   
   const activityCheckEmbed = new EmbedBuilder()
   .setTitle("Activity test")
   .setDescription(
      "Click the button below to confirm that you are active\nFailure to do so will result in a punishment\n" +
      `Deadline: <t:${deadlineTimestamp}:R>`
   )
   .setFooter({text: `AC ID: ${document.ID}`})
   .setColor("Green");
   
   const channel = await interaction.client.channels.fetch(config.main.activityTestsChannel);
   if (!channel?.isTextBased()) return;
   
   const message = await channel.send({embeds: [activityCheckEmbed], components: [row]});
   
   const timeLeft = new Date(document.deadline).getTime() - Date.now();
   
   activeButton.onClick(
      async (subInteraction: ButtonInteraction) => {
         const tempDocument = await MActivityCheck.findOne({ID: id});
         if (!tempDocument) {
            await interaction.followUp("Activity test not found.");
            return;
         }
         const employeesReactedTempArray: Array<Snowflake> = tempDocument.membersReacted;

         if (!subInteraction.member) return;
         if (!subInteraction.inCachedGuild()) return;
         if (!subInteraction.member.roles.cache.has(config.main.activityTestRole)) {
            await subInteraction.member.roles.add(config.main.activityTestRole);
            employeesReactedTempArray.push(subInteraction.user.id);
            await document.updateOne({$set: {
               membersReacted: employeesReactedTempArray
            }});
            await subInteraction.reply({ephemeral: true, content: "Marked as active."});
         } else {
            await subInteraction.reply({ephemeral: true, content: "You have already reacted to this activity check!"});
         }
      },
      {
         message: message,
         time: timeLeft,
         autoReset: false
      }
   )

   activeButton.onEnd(
      async () => {
         const buttonJSON = activeButton.toJSON();
         const disabledButton = new ButtonKit()
         .setCustomId("disabled")
         .setDisabled(true)
         .setStyle(buttonJSON.style);
         if (buttonJSON.emoji) {
            disabledButton.setEmoji(buttonJSON.emoji);
         }
         if (buttonJSON.label) {
            disabledButton.setLabel(buttonJSON.label);
         }
         const disabledRow = new ActionRowBuilder<ButtonKit>().setComponents(disabledButton);

         message.edit({components: [disabledRow]});
      }
   )

   await interaction.editReply("Success!");
}