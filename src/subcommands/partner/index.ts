import type { SlashCommandProps } from "commandkit";

import questions from './src/questions.ts';
import create from "./src/create.ts";
import find from "./src/find.ts";
import terminate from "./src/terminate.ts";
import resendAd from "./src/resend-ad.ts";

export default {
   questions: questions,
   create: create,
   find: find,
   terminate: terminate,
   resendAd: resendAd
};