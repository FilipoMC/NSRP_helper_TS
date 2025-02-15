import 'dotenv/config';
import config from "./config/config.json";

import mongoose from 'mongoose';

import { Client, IntentsBitField } from 'discord.js';
import { CommandKit } from 'commandkit';

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import setupApiServer from "./api/index.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

new CommandKit({
  client,
  eventsPath: join(__dirname, 'events'),
  commandsPath: join(__dirname, 'commands'),
  devUserIds: config.devs,
  devGuildIds: ["1176510176417808435"],
  validationsPath: join(__dirname, "validations")
});

(async () => {
  try{
    if (await mongoose.connect(process.env.MONGODB_CONNECT as string)) {
      console.log("✅ Connected to DB");
    } else {
      console.log("❌ I couldn't connect to DB");
    }
    
    await client.login(process.env.TOKEN);
    await setupApiServer(client);
  } catch (e) {
    console.log("❌ There was an error while connecting to the database and/or logging in.");
    console.log(e);
  }
})();