import { model, Schema } from "mongoose";

export interface IServerBlacklist {
   discord_id: string,
   discord_name: string,
   roblox_group_id?: number,
   reason: string,
   blacklisted_by: string,
   revoked?: boolean,
   revoke_reason?: string,
   revoked_by?: string,
};

export const SServerBlacklist = new Schema<IServerBlacklist>({
   discord_id: {type: String, required: true},
   discord_name: {type: String, required: true},
   roblox_group_id: {type: Number, default: undefined},
   reason: {type: String, required: true},
   blacklisted_by: {type: String, required: true},
   revoked: {type: Boolean, default: false},
   revoke_reason: {type: String, default: undefined},
   revoked_by: {type: String, default: undefined}
})

export const MServerBlacklist = model<IServerBlacklist>("server_blacklists", SServerBlacklist);