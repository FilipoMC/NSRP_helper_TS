import type { ValidationProps } from "commandkit";

import config from "../config/config.json";

export default function( {interaction}: ValidationProps ) {
   if (!interaction.guild) return true;
   if (interaction.guild.id !== config.mainServer) return true;
}