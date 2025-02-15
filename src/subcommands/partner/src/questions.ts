import type { SlashCommandProps } from "commandkit";
import { TextChannel, EmbedBuilder } from "discord.js";

export default async function({ client, interaction }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   const user = interaction.options.get("user")?.value; 
   
   const channel: TextChannel = interaction.channel as TextChannel;


   const embed: EmbedBuilder = new EmbedBuilder()
      .setTitle("Partnership questions")
      .setColor("#41cd50")
      .setDescription(
      "**Answer these questions, don't ping staff members to get responce**",
      )
      .addFields(
         {
            name: "Reason of partnership.",
            value: "Why do you want to partner with us?",
         },
         {
            name: "Your rank.",
            value: "What is your rank?",
         },
         {
            name: "Members without bots.",
            value: "How much members does your server have? (without bots)",
         },
         {
            name: "Any nukes/raids in the past 6 months.",
            value:
               "How many nukes/raids did your server have in the past 6 months?",
         },
         {
            name: "Server ad",
            value: "Send your server's ad **in separate message**.",
         },
      )
      .setFooter({ text: `Sent by: ${interaction.user.username}` });

   const ping: string = user ? `||<@!${user}>||` : "";

   await channel.send({
      content: ping,
      embeds: [embed]
   })

   await interaction.editReply("✅ Success!");
}