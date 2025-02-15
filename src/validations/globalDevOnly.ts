import { ValidationProps } from "commandkit";

export default function({interaction, commandObj, handler}: ValidationProps) {
if (!commandObj?.options?.globalDevOnly) return;

if (!interaction.isChatInputCommand()) return;
if (!interaction.inCachedGuild()) return;

if (!handler.devUserIds.includes(interaction.user.id)) {
   interaction.reply({content: "❌ This command can only be used by developers.", ephemeral: true});
   return true;
}
}