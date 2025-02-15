import { SlashCommandProps } from "commandkit";

import * as config from "../../../../config/index";
import { MUserBlacklist } from "../../../../schemas/blacklist/user";
import { EmbedBuilder } from "discord.js";
import { MPartnership } from "../../../../schemas/partnership";

const fail = config.emojis.red_cross;
const success = config.emojis.green_checkmark;

export default async function({ client, interaction }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   const model = interaction.options.getString("model") as string;
   const id = interaction.options.getString("id") as string;

   let idReady;
   let deletedDoc;

   switch (model) {
      case "blacklist":
         if (isNaN(parseInt(id))) {
            await interaction.editReply(`${fail} Provide a valid ID.`);
            return;
         }
         idReady = parseInt(id);

         deletedDoc = await MUserBlacklist.findOneAndDelete({user_id: idReady});
      break;
      case "partnership":
         deletedDoc = await MPartnership.findOneAndDelete({logMessageID: id});
      break;
   }

   const embed = new EmbedBuilder() 
      .setTitle("Blacklist deleted.")
      .setDescription(
         "Deleted blacklist: \n" +
         `\`\`\` ${JSON.stringify(deletedDoc, null, 3)} \`\`\`` 
      )

   await interaction.followUp({embeds: [embed]});
}