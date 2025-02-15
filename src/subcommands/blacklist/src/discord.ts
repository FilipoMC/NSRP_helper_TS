import { SlashCommandProps } from "commandkit";

import "dotenv/config";

import * as config from "../../../config/index";
import { EmbedBuilder, GuildMember } from "discord.js";

import axios, { AxiosError, isAxiosError } from "axios";
import { sendErrorReport } from "../../../utils/sendErrorReport";
import { MUserBlacklist } from "../../../schemas/blacklist/user";
const ROWiFiToken = `Bot ${process.env.ROWIFI_TOKEN}`;

const fail = config.emojis.red_cross;
const success = config.emojis.green_checkmark;
const partialSuccess = config.emojis.yellow_checkmark;

interface RoWiFiUser {
   discord_id: string,
   guild_id: string,
   reverse_search_consent: boolean,
   roblox_id: number
};

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

   const memberToBlacklist: GuildMember = interaction.options.getMember("member") as GuildMember;
   const reason: string = interaction.options.getString("reason") as string;

   if (memberToBlacklist.user.id === interaction.user.id) {
      await interaction.followUp(`${fail} You cannot blacklist yourself.`);
      return;
   }

   if (memberToBlacklist.roles.cache.has(config.ranks.categories.ls)) {
      await interaction.followUp(`${fail} You cannot blacklist LS members.`);
      return;
   }

   const rowifiGetUrl = `https://api.rowifi.xyz/v2/guilds/${config.main.mainServer}/members/${memberToBlacklist.user.id}`;
   const rowifiUserAxiosObj = await axios.get<RoWiFiUser>(rowifiGetUrl, {headers: {Authorization: ROWiFiToken}}).catch(async (e: AxiosError) => {
      if (e.response!.status === 404) {
         await interaction.followUp(`${fail} User not found.`);
         isError = true;
         return;
      }
      await sendErrorReport({interaction: interaction, description: "getting user from RoWiFi in /blacklist discord", error: e});
      isError = true;
   })
   if (isError) return;

   // console.log(rowifiUserAxiosObj);

   const rowifiUser = rowifiUserAxiosObj!.data;

   const robloxUserGetUrl = `https://users.roblox.com/v1/users/${rowifiUser.roblox_id}`;
   const robloxUserAxiosObj = await axios.get<RobloxUser>(robloxUserGetUrl).catch(async (e: AxiosError) => {
      if (e.response!.status === 404) {
         await interaction.followUp(`${fail} User not found.`);
         isError = true;
         return;
      }
      await sendErrorReport({interaction: interaction, description: "getting user from roblox in /blacklist discord", error: e});
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
   
   const blacklistDoc = await MUserBlacklist.create({
      user_id: robloxUser.id,
      user_name: robloxUser.name,
      dc_user_id: memberToBlacklist.user.id,
      dc_user_name: memberToBlacklist.user.username,
      reason: reason,
      blacklisted_by: interaction.user.id
   })
   
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

   const embed = new EmbedBuilder()
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

   const embedDM = new EmbedBuilder()
      .setTitle("You have been blacklisted.")
      .setDescription(
         "**You have been blacklisted.**\n\n" + 
			`**Blacklisted by:** ${interaction.user} (${interaction.user.username})` + "\n" + 
			`**Reason:** ${reason}`
      )

   await memberToBlacklist.user.send({embeds: [embedDM]});
   const blacklistsChannel = await interaction.guild?.channels.fetch(config.main.blacklistsChannel);
   if (!blacklistsChannel?.isTextBased()) return;
   await blacklistsChannel.send({embeds: [embed]});
      
   const blacklistedBy = interaction.user;
   await memberToBlacklist.ban({reason: `Blacklisted by: ${blacklistedBy?.username}, reason: ${blacklistDoc.reason}`, deleteMessageSeconds: 0}).catch(async () => {
      await interaction.followUp(`${partialSuccess} Successfully blacklisted the user, but couldn't ban them from the server.`);
      isError = true;
   })
   if (isError) return;

   await interaction.followUp(`${success} Success!`);
}