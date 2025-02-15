import { SlashCommandProps } from "commandkit";
import { MPartnership } from "../../../schemas/partnership";

import * as config from "../../../config/index"; 

export default async function({ interaction, client }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   const id: string = interaction.options.getString("id") as string;

   const document = await MPartnership.findOne({logMessageID: id});
   if (!document) {
      interaction.followUp("❌ Partnership not found.");
      return;
   }

   const partnerChannel = await client.channels.fetch(config.main.partnerChannel);
   if (!partnerChannel?.isTextBased()) return;

   (await partnerChannel.messages.fetch(document.messageID)).delete().catch(() => null);

   const message = await partnerChannel.send(
      document.ad + "\n" +
      "``` ```\n" + 
      `Rep: <@!${document.rep}>`
   );

   await document.updateOne({$set: {
      messageID: message.id
   }});

   await interaction.followUp("✅ Success!");
}