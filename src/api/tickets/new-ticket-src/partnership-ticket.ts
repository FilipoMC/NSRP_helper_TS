import { Client, EmbedBuilder, ThreadChannel } from "discord.js";

export default async function (client: Client, ticketChannel: ThreadChannel) {
   const greetEmbed = new EmbedBuilder()
      .setDescription(
         `Thank you for the will to become our partner!\n`+
         `Please wait for a Management Team member to assist you.\n`+
         `To make this quicker, fill out the form below while waiting for them.`
      )
      .setColor("Green");

   const formEmbed = new EmbedBuilder()
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
      .setColor("Green");
      
   await ticketChannel.send({embeds: [greetEmbed, formEmbed]});
}