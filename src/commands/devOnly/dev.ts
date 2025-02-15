import { CommandOptions, SlashCommandProps } from "commandkit";
import { SlashCommandBuilder } from "discord.js";

import subcommands from "../../subcommands/dev/index";

export const data = new SlashCommandBuilder()
   .setName("dev")
   .setDescription("dev stufff")
   .setDMPermission(false)
   .addSubcommandGroup(sg => sg
      .setName("action")
      .setDescription("Actions like restart.")
      .addSubcommand(s => s
         .setName("restart")
         .setDescription("Restart the bot.")
      )
      .addSubcommand(s => s
         .setName("fix-partnership-invites")
         .setDescription("Fix partnership invites.")
      )
   ) 
   .addSubcommandGroup(sg => sg
      .setName("database")
      .setDescription("Database stuff")
      .addSubcommand(s => s
         .setName("delete-doc")
         .setDescription("Delete a document from a model.")
         .addStringOption(o => o
            .setName("model")
            .setDescription("The model to delete the doc from.")
            .setRequired(true)
            .setChoices([
               {name: "Blacklist.", value: "blacklist"},
               {name: "Partnership", value: "partnership"}
            ])
         )
         .addStringOption(o => o
            .setName("id")
            .setDescription("Main ID of the doc.")
            .setRequired(true)
         )
      )
   )

export async function run({ client, interaction }: SlashCommandProps) {
   const subcommandGroup = interaction.options.getSubcommandGroup();
   const subcommand = interaction.options.getSubcommand();

   if (subcommandGroup === "database") {
      switch (subcommand) {
         case "delete-doc":
            await subcommands.database.delete({interaction: interaction, client: client} as SlashCommandProps);
         break;
      }
   } else if (subcommandGroup === "action") {
      switch (subcommand) {
         case "restart":
            await subcommands.action.restart({interaction: interaction, client: client} as SlashCommandProps);
         break;
         case "fix-partnership-invites":
            await subcommands.action.fixPartnershipInvites({interaction: interaction, client: client} as SlashCommandProps);
         break;
      }
   }
}

export const options: CommandOptions = {
   globalDevOnly: true
};