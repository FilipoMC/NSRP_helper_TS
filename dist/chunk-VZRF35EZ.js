/* Optimized production build generated by CommandKit */
import {
  main
} from "./chunk-GSB7PNNP.js";
import {
  MActivityCheck
} from "./chunk-A4QB62XD.js";
import {
  __name
} from "./chunk-4HQ2LG3N.js";

// src/subcommands/activity-test/src/resend.ts
import { ButtonKit } from "commandkit";
import { v4 as uuid } from "uuid";
import { ActionRowBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
async function resend_default({ interaction }) {
  await interaction.deferReply({ ephemeral: true });
  if (!interaction.inCachedGuild())
    return;
  const id = interaction.options.getString("id");
  const document = await MActivityCheck.findOne({ ID: id });
  if (!document) {
    await interaction.followUp("Activity test not found.");
    return;
  }
  const deadlineTimestamp = Math.floor(new Date(document.deadline).getTime() / 1e3);
  const activeButtonCustomID = uuid();
  const activeButton = new ButtonKit().setLabel("I'm active!").setStyle(ButtonStyle.Success).setCustomId(activeButtonCustomID);
  await document.updateOne({ $set: { buttonID: activeButtonCustomID } });
  const row = new ActionRowBuilder().setComponents(activeButton);
  const activityCheckEmbed = new EmbedBuilder().setTitle("Activity test").setDescription(
    `Click the button below to confirm that you are active
Failure to do so will result in a punishment
Deadline: <t:${deadlineTimestamp}:R>`
  ).setFooter({ text: `AC ID: ${document.ID}` }).setColor("Green");
  const channel = await interaction.client.channels.fetch(main.activityTestsChannel);
  if (!channel?.isTextBased())
    return;
  const message = await channel.send({ embeds: [activityCheckEmbed], components: [row] });
  const timeLeft = new Date(document.deadline).getTime() - Date.now();
  activeButton.onClick(
    async (subInteraction) => {
      const tempDocument = await MActivityCheck.findOne({ ID: id });
      if (!tempDocument) {
        await interaction.followUp("Activity test not found.");
        return;
      }
      const employeesReactedTempArray = tempDocument.membersReacted;
      if (!subInteraction.member)
        return;
      if (!subInteraction.inCachedGuild())
        return;
      if (!subInteraction.member.roles.cache.has(main.activityTestRole)) {
        await subInteraction.member.roles.add(main.activityTestRole);
        employeesReactedTempArray.push(subInteraction.user.id);
        await document.updateOne({ $set: {
          membersReacted: employeesReactedTempArray
        } });
        await subInteraction.reply({ ephemeral: true, content: "Marked as active." });
      } else {
        await subInteraction.reply({ ephemeral: true, content: "You have already reacted to this activity check!" });
      }
    },
    {
      message,
      time: timeLeft,
      autoReset: false
    }
  );
  activeButton.onEnd(
    async () => {
      const buttonJSON = activeButton.toJSON();
      const disabledButton = new ButtonKit().setCustomId("disabled").setDisabled(true).setStyle(buttonJSON.style);
      if (buttonJSON.emoji) {
        disabledButton.setEmoji(buttonJSON.emoji);
      }
      if (buttonJSON.label) {
        disabledButton.setLabel(buttonJSON.label);
      }
      const disabledRow = new ActionRowBuilder().setComponents(disabledButton);
      message.edit({ components: [disabledRow] });
    }
  );
  await interaction.editReply("Success!");
}
__name(resend_default, "default");

export {
  resend_default
};
