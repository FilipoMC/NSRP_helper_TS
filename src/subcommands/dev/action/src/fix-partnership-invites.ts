import { SlashCommandProps } from "commandkit";
import { MPartnership } from "../../../../schemas/partnership";
import { getFirstDiscordInviteFromString } from "../../../../utils/getFirstDiscordInviteFromString";

export default async function({ client, interaction }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});

   const partnerships = await MPartnership.find();

   for (const document of partnerships) {
      if (document.invite) continue;

      const invite = getFirstDiscordInviteFromString(document.ad);
      if (!invite) continue;
      
      await document.updateOne({$set: {invite: invite}});
   }

   await interaction.editReply("✅ Success!");
}