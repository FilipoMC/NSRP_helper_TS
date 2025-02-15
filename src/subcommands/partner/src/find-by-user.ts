import { SlashCommandProps } from "commandkit";
import { MPartnership } from "../../../schemas/partnership";
import { EmbedBuilder } from "discord.js";

import * as config from "../../../config/index.ts";

export default async function({client, interaction}: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});

   const userOption = interaction.options.getUser("user");
   const idOption = interaction.options.getString("id");

   if (!userOption && !idOption) {
      await interaction.editReply("❌ You need to specify a user or ID.");
      return;
   }

   const userID = userOption?.id ?? idOption;

   const partnerships = await MPartnership.find({rep: userID});
   if (partnerships.length === 0) {
      await interaction.editReply("❌ No partnerships found.");
      return;
   }


   const fields = partnerships.map(partnership => {
      return {name: partnership.logMessageID, value: 
         `**Made by:** <@${partnership.by}>\n` +
         `**Discord invite:** ${partnership.invite ? "https://" + partnership.invite : "Not found"}\n` + 
         `**Message ID:** [${partnership.messageID}](<https://discord.com/channels/${config.main.mainServer}/${config.main.partnerChannel}/${partnership.messageID}>)\n` +
         `**Log message ID:** [${partnership.logMessageID}](<https://discord.com/channels/${config.main.mainServer}/${config.main.partnerLogChannel}/${partnership.logMessageID}>)\n`,
         inline: true
      }
   });

   const embed = new EmbedBuilder()
      .setTitle("Partnerships")
      .setDescription((fields.length > 25) ? "Not showing all partnerships." : "All partnerships for this user:")
      .setFields(fields.slice(0, 24))
      .setColor("Green");

   await interaction.editReply({embeds: [embed]});
}