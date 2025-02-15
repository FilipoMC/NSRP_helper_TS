import { SlashCommandProps } from "commandkit";

import * as config from "../../../config/index";
import axios, { AxiosError } from "axios";
import { sendErrorReport } from "../../../utils/sendErrorReport";
import { MUserBlacklist } from "../../../schemas/blacklist/user";
import { EmbedBuilder } from "discord.js";
import { isSnowflake } from "discord-snowflake";

const ROWiFiToken = `Bot ${process.env.ROWIFI_TOKEN}`;

const fail = config.emojis.red_cross;
const success = config.emojis.green_checkmark;

interface RobloxUser {
   description: string,
	created: string,
	isBanned: boolean,
	externalAppDisplayName: any,
	hasVerifiedBadge: boolean,
	id: number,
	name: string,
	displayName: string
};

export default async function({ client, interaction }: SlashCommandProps) {
   let isError: boolean = false;

   await interaction.deferReply({ephemeral: true});
   const robloxID = interaction.options.getNumber("id") as number;
   const reason = interaction.options.getString("reason") as string;
   const discordID = interaction.options.getString("discord-id");
   const discordName = interaction.options.getString("discord-name");

   if (discordID && !isSnowflake(discordID)) {
      await interaction.followUp(`${config.emojis.red_cross} You have to put in a valid discord id.`);
      return;
   }

   if ((discordID && !discordName) || (!discordID && discordName)) {
      await interaction.followUp(`${fail} You have to put in either both or none discord parameters.`);
      return;
   }
   
   const robloxUserGetUrl = `https://users.roblox.com/v1/users/${robloxID}`;
   const robloxUserAxiosObj = await axios.get<RobloxUser>(robloxUserGetUrl).catch(async (e: AxiosError) => {
      if (e.response!.status === 404) {
         await interaction.followUp(`${fail} User not found.`);
         isError = true;
         return;
      }
      await sendErrorReport({interaction: interaction, description: "getting roblox user in /blacklist roblox", error: e});
      isError = true;
   })
   if (isError) return;

   const robloxUser = robloxUserAxiosObj!.data;

   const tempBlacklistTest = await MUserBlacklist.findOne({user_id: robloxUser.id});

   if (tempBlacklistTest) {
      if (!tempBlacklistTest.revoked) {
         await interaction.followUp(`${fail} This user is already blacklisted.`);
         return;
      } else {
         await tempBlacklistTest.deleteOne();
      }
   }

   let embed: EmbedBuilder;
   let blacklistDoc;
   if (discordID) {
      blacklistDoc = await MUserBlacklist.create({
         user_id: robloxUser.id,
         user_name: robloxUser.name,
         dc_user_id: discordID,
         dc_user_name: discordName,
         reason: reason,
         blacklisted_by: interaction.user.id
      })

      embed = new EmbedBuilder()
      .setTitle("Blacklist.")
      .setDescription(
         `**Blacklisted by:** <@!${blacklistDoc.blacklisted_by}>`+"\n\n"+
			`**User:** <@!${blacklistDoc.dc_user_id}>` + "\n" +
			`**User name:** ${blacklistDoc.dc_user_name}` + "\n" +
			`**User id:** ${blacklistDoc.dc_user_id}` + "\n" +
			`**Roblox user:** ${blacklistDoc.user_name}` + "\n" +
			`**Roblox User Id:** ${blacklistDoc.user_id}` + "\n"+
			`**Reason:** ${blacklistDoc.reason}`+"\n",
      )
      .setColor("Red")
   } else {
      blacklistDoc = await MUserBlacklist.create({
         user_id: robloxUser.id,
         user_name: robloxUser.name,
         reason: reason,
         blacklisted_by: interaction.user.id
      })

      embed = new EmbedBuilder()
      .setTitle("Blacklist.")
      .setDescription(
         `**Blacklisted by:** <@!${blacklistDoc.blacklisted_by}>`+"\n\n"+
			`**User:** N/A` + "\n" +
			`**Roblox user:** ${blacklistDoc.user_name}` + "\n" +
			`**Roblox User Id:** ${blacklistDoc.user_id}` + "\n"+
			`**Reason:** ${blacklistDoc.reason}`+"\n",
      )
      .setColor("Red")
   }

   const rowifiBlacklistUrl = `https://api.rowifi.xyz/v2/guilds/${config.main.mainServer}/blacklists`;
   await axios.post(rowifiBlacklistUrl, {
      reason: reason,
      kind: 0,
      user_id: robloxUser.id
   }, {headers: {Authorization: ROWiFiToken, "Content-Type": "application/json"}}).catch(async (e: AxiosError) => {
      await sendErrorReport({interaction: interaction, description: "creating RoWifi blacklist for /blacklist discord", error: e});
      isError = true;
   })

   if (isError) return;


   embed = new EmbedBuilder()
      .setTitle("Blacklist.")
      .setDescription(
         `**Blacklisted by:** <@!${blacklistDoc.blacklisted_by}>`+"\n\n"+
			`**Roblox user:** ${blacklistDoc.user_name}` + "\n" +
			`**Roblox User Id:** ${blacklistDoc.user_id}` + "\n"+
			`**Reason:** ${blacklistDoc.reason}`+"\n",
      )
      .setColor("Red")

   const blacklistsChannel = await interaction.guild?.channels.fetch(config.main.blacklistsChannel);
   if (!blacklistsChannel?.isTextBased()) return;
   await blacklistsChannel.send({embeds: [embed]});
   
   if (discordID) {
      await interaction.guild?.bans.create(blacklistDoc.dc_user_id, {reason: `Blacklisted by: ${interaction.user.username}, reason: ${reason}`, deleteMessageSeconds: 0});
   }

   await interaction.followUp(`${success} Success!`);
}