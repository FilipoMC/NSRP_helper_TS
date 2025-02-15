import { Client, IntentsBitField } from "discord.js";

import express, {Response, Request} from "express";

import newTicket from "./tickets/new-ticket";
import bodyParser from "body-parser";

const PORT = process.env.EXPRESS_PORT;
const TICKETS_TOKEN = process.env.EXPRESS_TICKETS_TOKEN;

export interface INewTicketPostBody {
	guild_id: string;
	user_id: string;
	ticket_id: number;
	ticket_channel_id: string;
	is_new_ticket: boolean;
	form_data?: any;
}

export default async function (client: Client) {
   const app = express();

   app.use(bodyParser.json());

   newTicket(client, app);

   app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
   }).on("error", (error) => {
      console.log(`Error with the API server:`);
      console.log(error);
   })
};