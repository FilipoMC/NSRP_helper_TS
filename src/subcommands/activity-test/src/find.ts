import { ButtonKit, SlashCommandProps } from "commandkit";
import * as config from "../../../config";
import { MActivityCheck } from '../../../schemas/activity-test';
import { ActionRowBuilder, ButtonInteraction, ButtonStyle, Collection, EmbedBuilder, GuildMember, Snowflake } from "discord.js";
import * as ms from '@lukeed/ms';

import { v4 as uuid } from "uuid";
import { CollectionBase } from "mongoose";

export default async function({interaction}: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   if (!interaction.inCachedGuild()) return;

   const id = interaction.options.getString("id");

   const document = await MActivityCheck.findOne({ID: id});
   if (!document) {
      await interaction.followUp("Activity test not found.");
      return;
   }
   
   const deadlineTimestamp = Math.floor((new Date(document.deadline).getTime())/1000);

   const activityCheckEmbed = new EmbedBuilder()
      .setTitle("Activity Check:")
      .addFields(
         {name: "ID", value: document.ID},
         {name: "Created by", value: `<@!${document.createdBy}>\n${(await interaction.guild?.members.fetch(document.createdBy))?.user?.username}`},
         {name: `Deadline`, value: `<t:${deadlineTimestamp}:f>`}
      )
      .setColor("DarkRed")

   const inactiveButton = new ButtonKit()
      .setLabel("Show inactive employees")
      .setStyle(ButtonStyle.Danger)
      .setCustomId(uuid());
      
   const devInfoButton = new ButtonKit()
      .setLabel("Dev info")
      .setStyle(ButtonStyle.Primary)
      .setCustomId(uuid());

   const mainRow = new ActionRowBuilder<ButtonKit>().setComponents([inactiveButton, devInfoButton]);
   
   const mainMessage = await interaction.followUp({embeds: [activityCheckEmbed], components: [mainRow], fetchReply: true});
   
   await interaction.guild?.members.fetch();

   inactiveButton.onClick(
      async (subInteraction: ButtonInteraction) => {
         await subInteraction.deferReply({ephemeral: true});

         const membersOnLoa: Collection<Snowflake, GuildMember> = (await interaction.guild?.roles.fetch(config.main.loaRole))?.members ?? new Collection();
         const reactedMembers: Collection<Snowflake, GuildMember> = (await interaction.guild?.roles.fetch(config.main.activityTestRole))?.members ?? new Collection();
         const LSTeam: Collection<Snowflake, GuildMember> = (await interaction.guild.roles.fetch(config.ranks.categories.ls))?.members ?? new Collection();
         const employees: Collection<Snowflake, GuildMember> = (await interaction.guild?.roles.fetch(config.ranks.categories.staff))?.members ?? new Collection();


         const inactiveMembers: Collection<Snowflake, GuildMember> = new Collection();

         for (const [id, member] of interaction.guild.members.cache) {
            if (!member.user.bot && employees.has(id) && !membersOnLoa.has(id) && !reactedMembers.has(id) && !LSTeam.has(id)) {
               inactiveMembers.set(id, member);
            }
         }

         let inactiveMembersString: string = "";

         if (inactiveMembers.size > 0) {
            for (const [id ,member] of inactiveMembers) {
               let username = member.user.username ?? "No username found";
               inactiveMembersString += `<@!${id}> (${username})\n`;
            }
         } else {
            inactiveMembersString = "No inactive members!";
         }

         const inactiveMembersEmbed = new EmbedBuilder()
            .setDescription(inactiveMembersString)
            .setColor("Blue");

         await subInteraction.editReply({embeds: [inactiveMembersEmbed]});
      },
      {
         message: mainMessage,
         time: ms.parse("1m"),
      }
   )


   devInfoButton.onClick(
      async (subInteraction: ButtonInteraction) => {
         const devInfoEmbed = new EmbedBuilder()
            .setFields(
               {name: "Doc ID", value: document.id},
               {name: "ID", value: document.ID},
               {name: "buttonID", value: document.buttonID},
               {name: "createdBy", value: document.createdBy},
               {name: "Deadline", value: document.deadline + "\n" + `(${new Date(document.deadline).getTime()})`}
            )
            .setColor("Blurple")
         const reactedMembersButton = new ButtonKit()
            .setLabel("Reacted employees")
            .setStyle(ButtonStyle.Secondary)
            .setCustomId(uuid());
         
         const devInfoMessage = await subInteraction.reply({
            ephemeral: true,
            embeds: [devInfoEmbed],
            components: [new ActionRowBuilder<ButtonKit>({components: [reactedMembersButton]})],
            fetchReply: true});
         
         reactedMembersButton.onClick(
            async (subSubInteraction: ButtonInteraction) => {
               let reactedMembersString = "";
               for (const memberID of document.membersReacted) {
                  let username = interaction.guild?.members.cache.get(memberID)?.user.username ?? "No username found";
                  reactedMembersString += `<@!${memberID}> (${username})\n`;
               }
               const plainReactedMembersEmbed = new EmbedBuilder()
                  .setDescription(reactedMembersString || "No members reacted.")
                  .setColor("Grey");
               await subSubInteraction.reply({ephemeral: true, embeds: [plainReactedMembersEmbed]});
            },
            {
               message: devInfoMessage,
               time: ms.parse("1m"),
            }
         )
      },
      {
         message: mainMessage,
         time: ms.parse("1m")
      }
   )
}