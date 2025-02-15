import type { SlashCommandProps } from "commandkit";

import { MPartnership as PartnershipSchema, IPartnership } from "../../../schemas/partnership.ts";

import {parse as ms} from "@lukeed/ms";

import config from "../../../config/config.json";
import { ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonStyle, ComponentType, EmbedBuilder, GuildMember, ModalBuilder, TextChannel, TextInputBuilder, TextInputModalData, TextInputStyle, User } from "discord.js";
import { getFirstDiscordInviteFromString } from "../../../utils/getFirstDiscordInviteFromString.ts";

export default async function({ interaction, client }: SlashCommandProps) {
   // await interaction.deferReply({ephemeral: true});

   const rep: GuildMember = interaction.options.get("rep")?.member as GuildMember;
   const ping: boolean = interaction.options.getBoolean("ping") as boolean;
   const prompt: boolean = interaction.options.getBoolean("prompt") as boolean;

   const pingReady: string = ping ? `<@&${config.partnerPingRole}>\n` : "";

   const partnerChannel: TextChannel = interaction.guild?.channels.cache.get(config.partnerChannel) as TextChannel;
   const partnerLogsChannel: TextChannel = interaction.guild?.channels.cache.get(config.partnerLogChannel) as TextChannel;

   const modalCustomID = `pCreate-${interaction.user.id}-${interaction.id}`;

   const partnershipModal = new ModalBuilder()
      .setTitle("Partnership")
      .setCustomId(modalCustomID)
      .setComponents([
         new ActionRowBuilder<TextInputBuilder>()
            .setComponents([
               new TextInputBuilder()
                  .setCustomId("serverAd")
                  .setLabel("Server Ad")
                  .setStyle(TextInputStyle.Paragraph)
                  .setMaxLength(3950)
                  .setRequired(true)
            ])
      ])
   
   await interaction.showModal(partnershipModal);

   const modalInteraction = await interaction.awaitModalSubmit({time: 60_000, filter: m => m.customId === modalCustomID}).catch(() => null)
   if (!modalInteraction) return;

   await modalInteraction.deferReply({ephemeral: true});

   const serverAd: string = modalInteraction.fields.getTextInputValue("serverAd");

   const serverInvite: string | null = getFirstDiscordInviteFromString(serverAd);

   if (!serverInvite) {
      await interaction.followUp({content: "❌ Invite not found in the ad.", ephemeral: true});
      return;
   }

   const tempCheck = await PartnershipSchema.findOne({invite: serverInvite});

   if (tempCheck) {
      await interaction.followUp({content: `❌ This server invite is already partnered. Partnership id: ${tempCheck.logMessageID}`, ephemeral: true});
      return;
   }

   const logEmbed = new EmbedBuilder()
      .setTitle("New Partnership.")
      .setDescription(
         "Server Ad:\n```" +
         serverAd + "```\n" +
         `Invite: https://${serverInvite}` + "\n" +
         `By: ${interaction.user}` + "\n" +
         `Rep: ${rep.user}`
      )
   
   if (!prompt) {
      const message = await partnerChannel.send(
         serverAd + "\n" +
         "``` ```\n" + 
         pingReady +
         `Rep: ${rep.user}`
      );
      const logMessage = await partnerLogsChannel.send({embeds: [logEmbed]});
      await rep.roles.add(config.partnerRole);

      await PartnershipSchema.create({
         ad: serverAd,
         by: interaction.user.id,
         invite: serverInvite,
         messageID: message.id,
         logMessageID: logMessage.id,
         rep: rep.user.id
      } as IPartnership);
      await modalInteraction.editReply("✅ Success!");
      await rep.user.send(`Your partnership id is ${logMessage.id}`).catch(() => null);
      return;
   } else {
      const promptEmbed = new EmbedBuilder()
         .setTitle("Confirmation")
         .setDescription(
            `${interaction.user} has requested you to send our server's ad.\n` +
            `Once you've done it, press the button bellow for your ad to be sent.`
         )
         .setColor("Green")
         .setFooter({text: "This prompt will expire in 24 hours."});

      const buttonID = `partner-prompt-button-${rep.id}-${Date.now()}`;


      const row = new ActionRowBuilder<ButtonBuilder>({components: [
         new ButtonBuilder({customId: buttonID, label: "I've sent the ad.", style: ButtonStyle.Success})
      ]})
      const promptMessage = await interaction.channel?.send({content: `${rep.user}`, embeds: [promptEmbed], components: [row]})
      
      if (!promptMessage) return;

      await modalInteraction.editReply("✅ Success!");

      const buttonInteraction = await promptMessage.awaitMessageComponent({componentType: ComponentType.Button, filter: b => b.customId === buttonID, time: ms("24h")}).catch(() => null)
      if (buttonInteraction){
         const message = await partnerChannel.send(
            serverAd + "\n" +
            "``` ```\n" + 
            pingReady +
            `Rep: ${rep.user}`
         );
         const logMessage = await partnerLogsChannel.send({embeds: [logEmbed]});
         await rep.roles.add(config.partnerRole);
   
         await PartnershipSchema.create({
            ad: serverAd,
            by: interaction.user.id,
            invite: serverInvite,
            messageID: message.id,
            logMessageID: logMessage.id,
            rep: rep.user.id
         } as IPartnership)
         await buttonInteraction?.reply(`✅ Ad sent. Partnership id: ${logMessage.id}`);
         await rep.user.send(`Your partnership id is ${logMessage.id}`).catch(() => null);
      }

   }
   
}
