import type { SlashCommandProps, CommandOptions } from "commandkit";
import { Application, EmbedBuilder, EmbedField, GuildMember, Role, SlashCommandBuilder } from "discord.js";

import * as config from "../../config/index.ts";

export const data = new SlashCommandBuilder()
   .setName("punish-member")
   .setDescription("Punish a member.")
   .setDMPermission(false)
   .addUserOption(o => o
      .setName("member")
      .setDescription("The member to punish.")
      .setRequired(true)
   )
   .addStringOption(o => o
      .setName("punishment")
      .setDescription("The punishment.")
      .setRequired(true)
   )
   .addStringOption(o => o
      .setName("notes")
      .setDescription("Notes to the punishment. (Do not mention roles)")
      .setRequired(false)
   )
   .addBooleanOption(o => o
      .setName("appealable")
      .setDescription("Is this punishment appealable? (Default: yes)")
      .setRequired(false)
   )

export async function run({ interaction, client }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   const member: GuildMember = interaction.options.getMember("member") as GuildMember;
   const punishment: string = interaction.options.getString("punishment") as string;
   const notes: (string | null) = interaction.options.getString("notes") as (string | null);
   const appealable: boolean = interaction.options.getBoolean("appealable") as boolean;

   const BRC = config.emojis.bottomRightCurve;

   const fieldsForEmbed: Array<EmbedField> = [
       {
         name: "Member: ",
         value: `${BRC}${member.user} (${member.user.username})`,
         inline: false
      },
      {
         name: "Punished by: ",
         value: `${BRC}${interaction.user} (${interaction.user.username})`,
         inline: true
      },
      
      {
         name: "Punishment: ",
         value: `${BRC}${punishment}`,
         inline: false
      },
      {
         name: "Notes: ",
         value: `${BRC}${notes ? notes : "N/A"}`,
         inline: true
      },
      {
         name: "Appealable: ",
         value: `${BRC}${appealable === false ? "No" : "Yes"}`,
         inline: true
      }
   ]

   const fieldsForDMEmbed: Array<EmbedField> = [
      {
         name: "Punished by: ",
         value: `${BRC}${interaction.user} (${interaction.user.username})`,
         inline: true
      },
      
      {
         name: "Punishment: ",
         value: `${BRC}${punishment}`,
         inline: false
      },
      {
         name: "Notes: ",
         value: `${BRC}${notes ? notes : "N/A"}`,
         inline: true
      },
      {
         name: "Appealable: ",
         value: `${BRC}${appealable === false ? "No" : "Yes"}`,
         inline: true
      }
   ]

   const embed = new EmbedBuilder()
      .setTitle("Punishment")
      .setFields(fieldsForEmbed)
      .setColor("Red");
   
   const DMEmbed = new EmbedBuilder()
      .setTitle("You have been punished.")
      .setFields(fieldsForDMEmbed)
      .setColor("Red");

   await interaction.channel?.send({embeds: [embed], content: `||${member.user}||`});
   await member.send({embeds: [DMEmbed]}).catch(() => null);
   await interaction.editReply("✅ Success!");
}

export const options: CommandOptions = {
   // neededRoles: [config.ranks.categories.ia, config.ranks.categories.mg],
   useCategoryPerms: true
}