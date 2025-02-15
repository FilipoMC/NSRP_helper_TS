import { CommandOptions, SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import updateSessionStatus from "../../utils/updateSessionStatus";

export const data = new SlashCommandBuilder()
   .setName("update-session-status")
   .setDescription("Updates the Server Status channel name.")
   .setDMPermission(false)
   .addStringOption(o => o
      .setName("status")
      .setDescription("The status.")
      .setRequired(true)
      .setChoices([
         {name: "Server Start Up", value: "ssu"},
         {name: "Server Shut Down", value: "ssd"}
      ])
   )

export async function run({ client, interaction }: SlashCommandProps) {
   const status: "ssu" | "ssd" = interaction.options.getString("status") as "ssu" | "ssd";

   await updateSessionStatus(client, status);

   interaction.reply({ephemeral: true, content: "✅ Success!"});
}

export const options: CommandOptions = {
   useCategoryPerms: true,
}

