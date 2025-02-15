import { Client, basename } from "discord.js";

import * as config from "../config/index";

export default async function(client: Client, status: "ssu" | "ssd") {
   const sessionStatusChannel = await client.channels.fetch(config.main.serverStatusVC);
   if (!sessionStatusChannel?.isVoiceBased()) {
      return;
   }

   const baseName = " | Server Status";

   enum Names {
      ssd = "🔴" + baseName,
      ssu = "🟢" + baseName
   }  
   
   switch (status) {
      case "ssu":
         await sessionStatusChannel.setName(Names.ssu);
      break;
      case "ssd":
         await sessionStatusChannel.setName(Names.ssd);
      break;
   }
}