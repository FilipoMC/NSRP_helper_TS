import type { Client } from 'discord.js';

import setupApiServer from "../../api/index";

export default async (client: Client<true>) => {
  console.log(`${client.user.tag} is online!`);

  // await setupApiServer(client);
};
