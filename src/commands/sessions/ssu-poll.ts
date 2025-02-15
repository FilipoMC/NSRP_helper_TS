import type { CommandOptions, SlashCommandProps } from "commandkit";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, ComponentType, EmbedBuilder, Message, SlashCommandBuilder, Snowflake, TextChannel, User } from "discord.js";

// import config from "../../../config/config.json";
import * as config from "../../config/index.ts";

import * as ms from "@lukeed/ms";

export const data = new SlashCommandBuilder()
   .setName("ssu-poll")
   .setDescription("Send a poll to sessions channel.")
   .setDMPermission(false)
   .addIntegerOption(o => o
      .setName("needed")
      .setDescription("Votes needed for SSU to occur.")
      .setRequired(true)
   )

export async function run({ interaction, client, handler }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});

   const EMBED_TITLE = "SSU poll.";

   const needed: number = interaction.options.get("needed")?.value as unknown as number;
   
   const channel: TextChannel = await client.channels.fetch(config.main.sessionsChannel) as TextChannel;

   //* Delete old polls
   await channel.messages.fetch();
   for (const [,message] of channel.messages.cache) {
      if (message.embeds.at(0)?.title === EMBED_TITLE) {
         await message.delete();
      }
   }

   const embedContent: string = needed > 0 
   ? 
   "**React below if you can attend ssu.**\n\n"+
   `_We need ${needed} reactions for SSU to happen._` 
   :
   "**React below if you can attend ssu.**\n\n";

   const embed = new EmbedBuilder()
      .setTitle(EMBED_TITLE)
      .setDescription(embedContent)
      .setFooter({text: `This poll will expire in 2 hours`})
      .setColor("#41cd50");

   const attendButtonID = `ssuPollAttend-${interaction.user.id}-${Date.now()}`;
   const checkButtonID = `ssuPollCheck`;

   const row = new ActionRowBuilder<ButtonBuilder>({components: [
      new ButtonBuilder({customId: attendButtonID, label: "0 - I can attend.", style: ButtonStyle.Success, emoji: config.emojis.green_checkmark}),
      new ButtonBuilder({customId: checkButtonID, label: "Check attending members.", style: ButtonStyle.Secondary})
   ]});

   const embedMessage = await channel.send({content: `||<@&${config.main.mainRole}>||`, embeds: [embed], components: [row]});
   // await embedMessage.react("<:yes:1165317268687831060>");
   await embedMessage.pin();

   //* Delete pin message
   const lastMessage = (await channel.messages.fetch()).at(0);
   await lastMessage?.delete();

   let attendingUsers: Collection<Snowflake, User> = new Collection();
   
   const attendButtonCollector = embedMessage.createMessageComponentCollector({
      componentType: ComponentType.Button, 
      filter: b => b.customId === attendButtonID, 
      time: ms.parse("2h")
   });
   
   attendButtonCollector.on("collect", async subInteraction => {
       if ( !attendingUsers || !attendingUsers.get(subInteraction.user.id)) {
         attendingUsers.set(subInteraction.user.id, subInteraction.user);
         subInteraction.reply({ephemeral: true, content: "You are required to attend the SSU!"});
      } else {
         attendingUsers.delete(subInteraction.user.id);
         subInteraction.reply({ephemeral: true, content: "You are no longer required to attend the SSU."});
      }
      const editedButton = 
         new ButtonBuilder({customId: attendButtonID, label: `${attendingUsers.size} - I can attend.`, style: ButtonStyle.Success, emoji: config.emojis.green_checkmark});
      const checkButton = 
         new ButtonBuilder({customId: checkButtonID, label: "Check attending members.", style: ButtonStyle.Secondary});
      const editedRow = 
         new ActionRowBuilder<ButtonBuilder>({components: [editedButton, checkButton]}); 
      await embedMessage.edit({components: [editedRow]});   
   })

   attendButtonCollector.on("end", async () => {
      const editedButton = 
         new ButtonBuilder({customId: attendButtonID,
            label: `${attendingUsers.size} - I can attend.`,
            style: ButtonStyle.Success,
            emoji: config.emojis.green_checkmark,
            disabled: true
         });
      const checkButton = 
         new ButtonBuilder({customId: checkButtonID, label: "Check attending members.", style: ButtonStyle.Secondary});
      const editedRow = 
         new ActionRowBuilder<ButtonBuilder>({components: [editedButton, checkButton]}); 
      await embedMessage.edit({components: [editedRow]}); 
   })

   const checkButtonCollector = embedMessage.createMessageComponentCollector({
      filter: b => b.customId === checkButtonID
   })

   checkButtonCollector.on("collect", async subInteraction => {
      let embedDescription: string = "";

      if (attendingUsers.size > 0) {
         for (const [,member] of attendingUsers) {
            embedDescription += `${member} (${member.username})\n`;
         }
      } else {
         embedDescription = "There are no attending members!";
      }
      
      const embed = new EmbedBuilder()
         .setTitle("Attending members: ")
         .setDescription(embedDescription)
         .setColor("Green");

      subInteraction.reply({ephemeral: true, embeds: [embed]});
   })
   
   await interaction.followUp("✅ Sent SSU poll to sessions channel.");
}

export const options: CommandOptions = {
   useCategoryPerms: true
}