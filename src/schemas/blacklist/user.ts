import { Schema, model } from "mongoose";
import { IPartnership } from "../partnership";

export interface IUserBlacklist {
   user_id: number,
   user_name: string,
   dc_user_name: string,
   dc_user_id: string,
   reason: string,
   blacklisted_by: string,
   revoked?: boolean,
   revoke_reason?: string,
   revoked_by?: string,
};

export const SUserBlacklist = new Schema<IUserBlacklist>({
   user_id: {type: Number, required: true},
   user_name: {type: String, required: true},
   dc_user_name: {type: String, default: undefined},
   dc_user_id: {type: String, default: undefined},
   reason: {type: String, required: true},
   blacklisted_by: {type: String, required: true},
   revoked: {type: Boolean, default: false},
   revoke_reason: {type: String, default: undefined},
   revoked_by: {type: String, default: undefined}
})

export const MUserBlacklist = model<IUserBlacklist>("blacklists", SUserBlacklist);