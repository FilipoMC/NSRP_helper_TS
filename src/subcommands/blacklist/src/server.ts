import { SlashCommandProps } from "commandkit";
import { MServerBlacklist } from "../../../schemas/blacklist/server";
import { EmbedBuilder } from "discord.js";
import axios, { AxiosError } from "axios";
import { sendErrorReport } from "../../../utils/sendErrorReport";

const ROWiFiToken = `Bot ${process.env.ROWIFI_TOKEN}`;

import * as config from "../../../config/index";

interface RobloxGroupAPIResponce {
   data: Datum[];
}

interface Datum {
   id:               number;
   name:             string;
   description:      string;
   owner:            Owner;
   memberCount:      number;
   created:          Date;
   hasVerifiedBadge: boolean;
}

interface Owner {
   id:   number;
   type: number;
   name: string;
}


export default async function({interaction}: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});

   let isError: boolean = false;

   const id = interaction.options.getString("id") as string;
   const serverName = interaction.options.getString("server-name") as string;
   const reason = interaction.options.getString("reason") as string;
   const robloxGroupID = interaction.options.getNumber("roblox-group-id");

   const tempBlacklistTest = await MServerBlacklist.findOne({discord_id: id});
   if (tempBlacklistTest) {
      if (!tempBlacklistTest.revoked) {
         await interaction.followUp(`❌ This server is already blacklisted.`);
         return;
      } else {
         await tempBlacklistTest.deleteOne();
      }
   }

   const robloxGroupResponce = robloxGroupID ? await axios.get<RobloxGroupAPIResponce>(`https://groups.roblox.com/v2/groups/?groupIds=${robloxGroupID}`)
      .catch(async (e: AxiosError) => {
         isError = true;
         if (e.response!.status === 400) {
            await interaction.followUp(`❌ Roblox group not found.`);
            return;
         }
         await sendErrorReport({interaction: interaction, description: "getting roblox group in /blacklist server", error: e});
         return;
      }) : null;
   if (isError) return;

   const embed = new EmbedBuilder();
 
   if (robloxGroupID) {
      if (!robloxGroupResponce) return;
      const robloxGroup = robloxGroupResponce.data.data.at(0);
      if (!robloxGroup) return;

      embed
         .setTitle("Server blacklist!")
         .setDescription(
            `**Blacklisted by:** <@!${interaction.user.id}>`+"\n\n"+
            `**Server:** ${serverName}` + "\n" +
            `**Server ID:** ${id}` + "\n" +
            `**Roblox group:** ${robloxGroup.name}` + "\n" +
            `**Roblox group ID:** ${robloxGroupID}` + "\n" +
            `**Reason:** ${reason}`+"\n",
         )
         .setColor("Red")
   } else {
      embed
         .setTitle("Server blacklist!")
         .setDescription(
            `**Blacklisted by:** <@!${interaction.user.id}>`+"\n\n"+
            `**Server:** ${serverName}` + "\n" +
            `**Server ID:** ${id}` + "\n" +
            `**Reason:** ${reason}`+"\n",
         )
         .setColor("Red")
   }



   if (robloxGroupID) {
      await MServerBlacklist.create({
         discord_id: id,
         discord_name: serverName,
         roblox_group_id: robloxGroupID,
         blacklisted_by: interaction.user.id,
         reason: reason,
      });

      const rowifiBlacklistUrl = `https://api.rowifi.xyz/v2/guilds/${config.main.mainServer}/blacklists`;
      await axios.post(rowifiBlacklistUrl, {
         reason: reason,
         kind: 1,
         group_id: robloxGroupID
      },
      {headers: {Authorization: ROWiFiToken, "Content-Type": "application/json"}}).catch(async (e: AxiosError) => {
         await sendErrorReport({interaction: interaction, description: "creating RoWifi blacklist for /blacklist server", error: e});
         isError = true;
      })
      if (isError) return;
   } else {
      await MServerBlacklist.create({
         discord_id: id,
         discord_name: serverName,
         blacklisted_by: interaction.user.id,
         reason: reason,
      });
   }


   const blacklistsChannel = await interaction.guild?.channels.fetch(config.main.blacklistsChannel);
   if (!blacklistsChannel?.isTextBased()) return;
   await blacklistsChannel.send({embeds: [embed]});
   
   await interaction.followUp(`✅ Success!`);
}