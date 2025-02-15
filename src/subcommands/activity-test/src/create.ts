import { ButtonKit, SlashCommandProps } from "commandkit";

import * as config from "../../../config";
import { ActionRowBuilder, EmbedBuilder } from "discord.js";
import { ButtonInteraction, ButtonStyle, Colors, Snowflake } from "discord.js";
import * as ms from '@lukeed/ms';
import { IActivityCheck, MActivityCheck, SActivityCheck } from '../../../schemas/activity-test';
import { v4 as uuid } from 'uuid';

export default async function({interaction}: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});

   if (!interaction.inCachedGuild()) return;

   for (const [,member] of (await interaction.guild.roles.fetch(config.main.activityTestRole))!.members) {
      if (member.roles.cache.has(config.main.activityTestRole)) {
         member.roles.remove(config.main.activityTestRole);
      }
   }

   const time: string = interaction.options.getString("time") as string;
   const timeMS = ms.parse(time);

   if (timeMS === undefined) {
      await interaction.editReply("The time you provided is invalid.");
      return;
   }

   const activeButtonCustomID = uuid();

   const activeButton = new ButtonKit()
      .setLabel("I'm active!")
      .setStyle(ButtonStyle.Success)
      .setCustomId(activeButtonCustomID);

   const row = new ActionRowBuilder<ButtonKit>().setComponents(activeButton);

   
   const activityTestID = uuid();
   
   const deadline = new Date(Date.now() + timeMS);
   const deadlineTimeStamp = Math.floor(deadline.getTime()/1000.0);
   
   const activityTestDocument = await MActivityCheck.create({
      ID: activityTestID,
      buttonID: activeButtonCustomID,
      createdBy: interaction.user.id,
      deadline: deadline,
      employeesReacted: []
   });

   const employeesReactedTempArray: Array<Snowflake> = [];

   const activityCheckEmbed = new EmbedBuilder()
      .setTitle("Activity test")
      .setDescription(
         "Click the button below to confirm that you are active\nFailure to do so will result in a punishment\n" +
         `Deadline: <t:${deadlineTimeStamp}:R>`
      )
      .setFooter({text: `AC ID: ${activityTestID}`})
      .setColor("Green");

   const channel = await interaction.client.channels.fetch(config.main.activityTestsChannel);
   if (!channel?.isTextBased()) return;

   const message = await channel.send({content: `<@&${config.ranks.categories.staff}>`, embeds: [activityCheckEmbed], components: [row]});

   activeButton.onClick(
      async (subInteraction: ButtonInteraction) => {
         if (!subInteraction.member) return;
         if (!subInteraction.inCachedGuild()) return;
         if (!subInteraction.member.roles.cache.has(config.main.activityTestRole)) {
            await subInteraction.member.roles.add(config.main.activityTestRole);
            employeesReactedTempArray.push(subInteraction.user.id);
            await activityTestDocument.updateOne({$set: {
               membersReacted: employeesReactedTempArray
            }});
            await subInteraction.reply({ephemeral: true, content: "Marked as active."});
         } else {
            await subInteraction.reply({ephemeral: true, content: "You have already reacted to this activity check!"});
         }
      },
      {
         message: message,
         time: timeMS,
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