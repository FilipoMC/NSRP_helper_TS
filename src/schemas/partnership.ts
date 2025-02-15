import { Schema, model } from "mongoose";

export interface IPartnership {
   by: String;
   rep: String;
   ad: string;
   invite: string;
   messageID: string;
   logMessageID: string;
};

export const SPartnership = new Schema<IPartnership>({
   by: {type: String, required: true},
   rep: {type: String, required: true},
   ad: {type: String, required: true},
   invite: {type: String, required: true},
   messageID: {type: String, required: true},
   logMessageID: {type: String, required: true}
});

export const MPartnership = model<IPartnership>("partnerships", SPartnership);