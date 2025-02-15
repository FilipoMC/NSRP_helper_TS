import type { SlashCommandProps, CommandOptions } from "commandkit";

import * as config from "../../config/index.ts";
import { Embed, EmbedBuilder, EmbedField, GuildMember, Role, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
   .setName("rank-change")
   .setDescription("Promote or demote a staff member.")
   .setDMPermission(false)
   .addStringOption(o => o
      .setName("action")
      .setDescription("Action to make")
      .addChoices([
         {name: "Promote", value: "promote"},
         {name: "Demote", value: "demote"},
      ])
      .setRequired(true)
   )
   .addUserOption(o => o
      .setName("member")
      .setDescription("Staff member to take the action on")
      .setRequired(true)
   )
   .addRoleOption(o => o
      .setName("before")
      .setDescription("Rank before the action.")
      .setRequired(true)
   )
   .addRoleOption(o => o
      .setName("after")
      .setDescription("Rank after the action")
      .setRequired(true)
   )
   .addStringOption(o => o
      .setName("reason")
      .setDescription("Reason of the action")
      .setRequired(true)
   )
   .addStringOption(o => o
      .setName("notes")
      .setDescription("Notes on the action")
      .setRequired(false)
   )

export async function run( { client, interaction }: SlashCommandProps ) {
   await interaction.deferReply({ephemeral: true});
   const action: "promote" | "demote" = interaction.options.getString("action") as "promote" | "demote";
   const member: GuildMember = interaction.options.getMember("member") as GuildMember;
   const before: Role = interaction.options.getRole("before") as Role;
   const after: Role = interaction.options.getRole("after") as Role;
   const reason: string = interaction.options.getString("reason") as string;
   const notes: string | null = interaction.options.getString("notes") as string | null;

   if (!interaction.inCachedGuild()) return;
   if (interaction.member.roles.highest.position <= member.roles.highest.position) {
      await interaction.editReply("❌ You cannot take this action on a member that is higher than you!");
      return;
   }

   if (!config.ranks.staffRanks.some(rank => rank.role === before.id) || !config.ranks.staffRanks.some(rank => rank.role === after.id)) {
      await interaction.editReply("❌ One of the ranks you provided is not a staff rank.");
      return;
   }

   const BRC = config.emojis.bottomRightCurve;

   const fieldsForEmbed: Array<EmbedField> = [
      {
         name: "Member: ",
         value: `${BRC}${member.user} (${member.user.username})`,
         inline: false
      },
      {
         name: "Action by: ",
         value: `${BRC}${interaction.user} (${interaction.user.username})`,
         inline: false
      },
      {
         name: "Rank before: ",
         value: 
            `${BRC}${before}\n` +
            `${BRC}(${before.name})`,
         inline: true 
      },
      {
         name: "Rank after: ",
         value: 
            `${BRC}${after}\n` +
            `${BRC}(${after.name})`,
         inline: true 
      },
      {
         name: "Reason: ",
         value: `${BRC}${reason}`,
         inline: false
      },
      {
         name: "Notes: ",
         value: `${BRC}${notes ? notes : "N/A"}`,
         inline: true
      }
   ]

   const fieldsForDMEmbed: Array<EmbedField> = [
      {
         name: "Action by: ",
         value: `${BRC}${interaction.user} (${interaction.user.username})`,
         inline: false
      },
      {
         name: "Rank before: ",
         value: 
            `${BRC}(${before.name})`,
         inline: true 
      },
      {
         name: "Rank after: ",
         value: 
            `${BRC}(${after.name})`,
         inline: true 
      },
      {
         name: "Reason: ",
         value: `${BRC}${reason}`,
         inline: false
      },
      {
         name: "Notes: ",
         value: `${BRC}${notes ? notes : "N/A"}`,
         inline: true
      }
   ]

   let embed: EmbedBuilder;
   let DMEmbed: EmbedBuilder; 

   if (action === "promote") {
      embed = new EmbedBuilder()
         .setTitle("Promotion.")
         .setColor("Green")
         .setFields(fieldsForEmbed);
      DMEmbed = new EmbedBuilder()
         .setTitle("You have been promoted!")
         .setColor("Green")
         .setFields(fieldsForDMEmbed);
   } else if (action === "demote") {
      embed = new EmbedBuilder()
         .setTitle("Demotion.")
         .setColor("Red")
         .setFields(fieldsForEmbed);
      DMEmbed = new EmbedBuilder()
         .setTitle("You have been demoted!")
         .setColor("Red")
         .setFields(fieldsForDMEmbed);
   } else {
      embed = new EmbedBuilder();
      DMEmbed = new EmbedBuilder();
   }

   await interaction.channel?.send({content: `||${member.user}||`, embeds: [embed]});
   await member.user.send({embeds: [DMEmbed]}).catch(() => null);
   await interaction.editReply("✅ Success!");
}

export const options: CommandOptions = {
   useCategoryPerms: true
};