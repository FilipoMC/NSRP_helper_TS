import { SlashCommandProps } from "commandkit";

import * as config from "../../../../config/index";

export default async function({ client, interaction }: SlashCommandProps) {
   await interaction.reply({ephemeral: true, content: "Restarting..."});
   process.exit(1);
}