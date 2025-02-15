import type { SlashCommandProps, CommandOptions } from "commandkit";
import { SlashCommandBuilder, EmbedBuilder, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

// import config from "../../../config/config.json";
import * as config from "../../config/index.ts";

import images from "../../config/images.json";
import updateSessionStatus from "../../utils/updateSessionStatus.ts";

export const data = new SlashCommandBuilder()
   .setName("session")
   .setDescription("Send an update to the sessions channel.")
   .setDMPermission(false)
   .addStringOption(o => o
      .setName("status")
      .setDescription("Server status.")
      .setRequired(true)
      .setChoices([
         {name: "Server Start Up.", value: "ssu"},
         {name: "Server Shut Down.", value: "ssd"},
         {name: "Server Crash.", value: "crash"},
         {name: "Server Restart.", value: "restart"},
         {name: "SSU reminder.", value: "reminder"},
      ])
   )

export async function run({ client, handler, interaction }: SlashCommandProps): Promise<void> {
   await interaction.deferReply({ephemeral: true});

   type Choices = "ssu" | "ssd" | "crash" | "restart"| "reminder";

   const status: Choices = interaction.options.get("status")?.value as Choices;

   let embed: EmbedBuilder;
   let ping;

   switch (status) {
      case "ssu":
         embed = new EmbedBuilder()
            .setTitle("Server start up!")
            .setColor(0x41cd50)
            .setDescription(
               "**Code:** EeTnU" +
                  "\n" +
                  "**Join link:** https://policeroleplay.community/join/EeTnU" +
                  "\n" +
                  "**--------**" +
                  "\n" +
                  `**Host:** ${interaction.user}` 
            )
            .setImage(images.SSUImgUrl);
         ping = `||<@&${config.main.mainRole}>||`;
         await updateSessionStatus(client, "ssu");
         break;
      case "ssd":
         embed = new EmbedBuilder()
            .setTitle("Server shut down!")
            .setColor(0xc63e3e)
            .setImage(images.SSDImgUrl);
            // .setDescription(``);

         ping = "";
         await updateSessionStatus(client, "ssd");
         break;
      case "restart":
         embed = new EmbedBuilder()
            .setTitle("Server restart!")
            .setColor(0xbdcd41)
            .setImage(images.RestartImgUrl)
            .setDescription(`**By:** ${interaction.user}`);

         ping = "||@here||";
         break;
      case "crash":
         embed = new EmbedBuilder()
            .setTitle("Server crash!")
            .setColor(0xb3270c)
            .setImage(images.CrashImgUrl)
            .setDescription(`**By:** ${interaction.user}`);

         ping = "||@here||";
         break;
      case "reminder":
         embed = new EmbedBuilder()
            .setTitle("SSU reminder")
            .setColor("Blue")
            .setDescription("This is a reminder that there is on going SSU! Let's get more players on! Come join to have fun roleplaying!");
         ping = `||<@&${config.main.mainRole}>||`;
         break;
   }

   const channel: TextChannel = interaction.guild?.channels.cache.get(config.main.sessionsChannel) as TextChannel;

   //* Purge the channel

   const channelMessages = await channel.messages.fetch();

   for (const [, message] of channelMessages) {
      if (status === "ssu") {
         if (!message.pinned) {
            await message.delete();
         }
      } else if (status === "ssd") {
         await message.delete();
      }
   }

   const message = await channel.send({
      content: ping,
      embeds: [
         embed
      ]
   });

   if (status === "ssu") {
      const EMBED_TITLE = "SSU poll.";

      const checkButtonID = `ssuPollCheck`;

      for (const [,message] of channel.messages.cache) {
         if (message.embeds.at(0)?.title === EMBED_TITLE) {

            const attendButton = message.components.at(0)?.components.at(0);

            if (attendButton?.type !== ComponentType.Button) return;
            if (!attendButton.label) return;

            const editedButton = 
            new ButtonBuilder({
               customId: "disabled",
               label: attendButton.label,
               style: ButtonStyle.Success,
               emoji: config.emojis.green_checkmark,
               disabled: true
            });
            const checkButton = 
               new ButtonBuilder({customId: checkButtonID, label: "Check attending members.", style: ButtonStyle.Secondary});
            const editedRow = 
               new ActionRowBuilder<ButtonBuilder>({components: [editedButton, checkButton]}); 
            await message.edit({components: [editedRow]}); 
         }
      }
   }

  await interaction.followUp("✅ Sent session update to sessions channel.");
}

export const options: CommandOptions = {
   useCategoryPerms: true
}