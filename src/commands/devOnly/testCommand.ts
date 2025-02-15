import type { SlashCommandProps, CommandOptions } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import { MPartnership } from "../../schemas/partnership";
import { getFirstDiscordInviteFromString } from "../../utils/getFirstDiscordInviteFromString";

export const data = new SlashCommandBuilder()
   .setName("test-command")
   .setDescription("just a test command")

export async function run( { interaction }: SlashCommandProps ) {
   await interaction.deferReply({ephemeral: true});

   const partnerships = await MPartnership.find();

   for (const document of partnerships) {
      if (document.invite) continue;

      const invite = getFirstDiscordInviteFromString(document.ad);
      if (!invite) continue;
      
      await document.updateOne({$set: {invite: invite}});
   }
}

export const options: CommandOptions = {
   devOnly: true
}