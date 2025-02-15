import type { SlashCommandProps, CommandOptions } from "commandkit";
import { Application, Embed, EmbedBuilder, EmbedField, GuildMember, Role, SlashCommandBuilder } from "discord.js";

import * as config from "../../config/index.ts";

export const data = new SlashCommandBuilder()
   .setName("punish-staff")
   .setDescription("Punish a staff member.")
   .setDMPermission(false)
   .addUserOption(o => o
      .setName("member")
      .setDescription("The member to punish.")
      .setRequired(true)
   )
   .addRoleOption(o => o
      .setName("punishment")
      .setDescription("The punishment. (Punishment role)")
      .setRequired(true)
   )
   .addStringOption(o => o
      .setName("reason")
      .setDescription("Reason of the punishment")
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

const fail = config.emojis.red_cross;
const success = config.emojis.green_checkmark;

export async function run({ interaction, client }: SlashCommandProps) {
   await interaction.deferReply({ephemeral: true});
   const member: GuildMember = interaction.options.getMember("member") as GuildMember;
   const punishment: Role = interaction.options.getRole("punishment") as Role;
   const reason: string = interaction.options.getString("reason") as string;
   const notes: (string | null) = interaction.options.getString("notes") as (string | null);
   const appealable: boolean = interaction.options.getBoolean("appealable") as boolean;

   if (!member.roles.cache.has(config.ranks.categories.staff)) {
      await interaction.followUp(`${fail} This member is not a staff member. If possible, use Wick's commands, if not, use /punish-member.`);
      return;
   }

   if (!config.punishments.punishmentsId.includes(punishment.id)) {
      interaction.editReply(`${fail} This role is not a punishment!`);
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
         name: "Punished by: ",
         value: `${BRC}${interaction.user} (${interaction.user.username})`,
         inline: true
      },
      
      {
         name: "Punishment: ",
         value: `${BRC}${punishment} (${punishment.name})`,
         inline: false
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
         value: `${BRC}${punishment.name}`,
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
   if (punishment.id !== config.punishments.fired && punishment.id !== config.punishments.verbalWarn) {
      let dr = false;
      await member.roles.add(punishment.id).catch(async () => {
         await interaction.editReply(`${fail} I couldn't add the role to the user! Do it yourself.`);
         dr = true;
      })
      if (dr) return;
   }
   await interaction.editReply(`${success} Success!`);
}

export const options: CommandOptions = {
   // neededRoles: [config.ranks.categories.ia, config.ranks.categories.mg],
   useCategoryPerms: true
}