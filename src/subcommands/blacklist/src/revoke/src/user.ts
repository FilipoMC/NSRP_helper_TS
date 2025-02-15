import { SlashCommandProps } from "commandkit";

import * as config from  "../../../../../config/index";
import { IUserBlacklist, MUserBlacklist } from "../../../../../schemas/blacklist/user";
import revoke from "..";
import axios, { AxiosError } from "axios";
import { sendErrorReport } from "../../../../../utils/sendErrorReport";
import { EmbedBuilder } from "discord.js";
import { Document, Types } from "mongoose";
const ROWiFiToken = `Bot ${process.env.ROWIFI_TOKEN}`;

const fail = config.emojis.red_cross;
const success = config.emojis.green_checkmark;

interface RoWifiBlacklist {
   blacklist_id: number,
   reason: string,
   kind: 0 | 1,
   user_id?: number,
   group_id?: number
};

export default async function({ client, interaction }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});

   const robloxID = interaction.options.getNumber("id") as number;
   const reason = interaction.options.getString("reason") as string;

   const blacklistDoc = await MUserBlacklist.findOne({user_id: robloxID});

   if (!blacklistDoc) {
      await interaction.followUp(`${fail} Blacklist not found.`);
      return;
   }

   if (blacklistDoc.revoked) {
      await interaction.followUp(`${fail} This blacklist is already revoked!`);
      return;
   }

   await blacklistDoc.updateOne({$set: {
      revoked: true,
      revoke_reason: reason, 
      revoked_by: interaction.user.id
   }});

   const updatedBlacklistDoc = await MUserBlacklist.findOne({user_id: robloxID});
   if (!updatedBlacklistDoc) return;

   let doReturn: boolean = false;
   const rowifiBlacklistUrl = `https://api.rowifi.xyz/v2/guilds/${config.main.mainServer}/blacklists`;
   const rowifiBlacklistList = await axios.get<Array<RoWifiBlacklist>>(rowifiBlacklistUrl, {headers: {Authorization: ROWiFiToken}}).catch(async (e: AxiosError) => {
      await sendErrorReport({error: e, description: "getting blacklist list for /blacklist revoke user", interaction: interaction});
      doReturn = true;
   })
   if (doReturn) return;

   const rowifiBlacklist = rowifiBlacklistList!.data.find(b => {
      if (b.user_id) {
         return b.user_id === robloxID;
      }
   })

   await axios.delete(rowifiBlacklistUrl, {headers: {Authorization: ROWiFiToken}, data: [rowifiBlacklist?.blacklist_id]}).catch(() => null);

   const embed = new EmbedBuilder()
      .setTitle("Blacklist revoked.")
      .setDescription(
         `**Blacklisted by:** <@!${updatedBlacklistDoc.blacklisted_by}>`+"\n\n"+
			(updatedBlacklistDoc?.dc_user_id ? `**User:** <@!${updatedBlacklistDoc.dc_user_id}>` + "\n" : "") +
			(updatedBlacklistDoc?.dc_user_name ? `**User name:** ${updatedBlacklistDoc.dc_user_name}` + "\n" : "") +
			(updatedBlacklistDoc?.dc_user_id ? `**User id:** ${updatedBlacklistDoc.dc_user_id}` + "\n" : "") +
			`**Roblox user:** ${updatedBlacklistDoc.user_name}` + "\n" +
			`**Roblox User Id:** ${updatedBlacklistDoc.user_id}` + "\n"+
			`**Reason:** ${updatedBlacklistDoc.reason}`+"\n\n" +
         `**Revoked by:** <@!${updatedBlacklistDoc.revoked_by}>\n` +
         `**Revoke reason:** ${updatedBlacklistDoc.revoke_reason}\n`
      )
      .setColor("Red")

   const blacklistsChannel = await client.channels.fetch(config.main.blacklistsChannel);
   if (blacklistsChannel?.isTextBased()) {
      await blacklistsChannel.send({embeds: [embed]});
   }

   await interaction.followUp(`${success} Success!`);
}