// Cloudflare Pages Function: /api/daypass/start | verify | resend
// Bind a KV namespace as DAYPASS and set the SMS/email secrets listed in server/daypass.js.
import { handleDayPass } from '../../../server/daypass.js';

export const onRequest = ({ request, env, params }) => handleDayPass(request, env, params.action);
