import { Client, RequestBody } from "discord.js";
import express, { Express, Response, Request } from 'express';

import partnershipTicket from "./new-ticket-src/partnership-ticket";

const TICKETS_TOKEN = process.env.EXPRESS_TICKETS_TOKEN;

export interface INewTicketPostBody {
	guild_id: string;
	user_id: string;
	ticket_id: number;
	ticket_channel_id: string;
	is_new_ticket: boolean;
	form_data?: any;
}

export default async function (client: Client, app: Express) {
   app.post("/tickets/new-ticket", async (req: Request<{}, {}, INewTicketPostBody>, res: Response) => {
      try {
         if (req.headers.authorization !== TICKETS_TOKEN) {
            res.status(403).send({});
            return;
         }

         if (!client.isReady()) {
            res.status(403).send({});
            return;
         }

         const body: INewTicketPostBody = req.body;
         
         const ticketChannel = await client.channels.fetch(body.ticket_channel_id);

         if (!body.is_new_ticket) {
            res.status(400).send({});
            return;
         }
         if (!ticketChannel || !ticketChannel.isThread()) {
            res.status(400).send({});
            return;
         }
         
         if (ticketChannel.name.startsWith("ticket-p")) {
            partnershipTicket(client, ticketChannel);
            res.status(200).send({});
            return;
         }

         res.status(404).send({});
      } catch (e) {
         res.status(500).send({});
      }
   })
}