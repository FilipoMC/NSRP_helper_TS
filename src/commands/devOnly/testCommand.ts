import type { SlashCommandProps, CommandOptions } from "commandkit";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
   .setName("test-command")
   .setDescription("just a test command")

export async function run( { interaction }: SlashCommandProps ) {
   console.log((await interaction.client.channels.fetch("1257043880084242574")));
   interaction.reply(interaction.client.ws.ping.toFixed(3));
}

export const options: CommandOptions = {
   devOnly: true
}