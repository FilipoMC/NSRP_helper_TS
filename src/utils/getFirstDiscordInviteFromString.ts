export function getFirstDiscordInviteFromString(string: string): string | null {
   const regex = /(https:\/\/)?(?<discordNativeInvite>(discord(app)?\.com\/invite\/\S*)|(discord\.gg\/\S*))|(?<shortInvite>(discord\.(me|li|io)|dsc\.gg)\/\S*)/g;

   let matchedResults: RegExpExecArray | null = null;

   while (!matchedResults || !matchedResults?.groups?.discordNativeInvite) { 
      matchedResults = regex.exec(string);
      if (!matchedResults) return null;
   }

   return matchedResults.groups?.discordNativeInvite ?? null;
}