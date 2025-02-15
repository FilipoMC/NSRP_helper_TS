import "dotenv/config";

const {testServer, clientId} = {testServer: "1176510176417808435", clientId: "1176510108260376656"};

import { SlashCommandBuilder } from "@discordjs/builders";
import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";

const token = process.env.TOKEN;

const rest = new REST({ version: "9" }).setToken(token);

rest.get(Routes.applicationCommands(clientId))
	.then(data => {
		const promises = [];
		for (const command of data) {
			const deleteUrl = `${Routes.applicationCommands(clientId)}/${
				command.id
			}`;
			promises.push(rest.delete(deleteUrl));
		}
		console.log("Deleted global slash commands");
		return Promise.all(promises);
	})
	.catch(console.log);
