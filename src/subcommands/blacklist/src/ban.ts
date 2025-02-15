import { SlashCommandProps } from "commandkit";
import { MUserBlacklist } from "../../../schemas/blacklist/user";
import { Snowflake, User } from "discord.js";
import { isSnowflake } from "discord-snowflake";
import * as config from "../../../config/index";

export default async function({ client, interaction }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   const discordID: Snowflake | string = interaction.options.getString("id") as Snowflake | string;
   if (!isSnowflake(discordID)) {
      await interaction.followUp(`${config.emojis.red_cross} You have to put in a valid discord id.`);
      return;
   }
   const blacklist = await MUserBlacklist.findOne({dc_user_id: discordID});
   if (!blacklist) {
      await interaction.followUp(`${config.emojis.red_cross} Blacklist not found.`);
      return;
   }

   const blacklistedBy: User | Snowflake  = await client.users.fetch(blacklist.blacklisted_by) || blacklist.blacklisted_by;

   await interaction.guild?.bans.create(blacklist.dc_user_id, {reason: `Blacklisted by: ${blacklistedBy?.username || blacklistedBy}, reason: ${blacklist.reason}`, deleteMessageSeconds: 0});
   await interaction.followUp(`${config.emojis.green_checkmark} Success!`);
}