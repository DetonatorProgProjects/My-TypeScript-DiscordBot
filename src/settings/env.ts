import { z } from "zod";

const envSchema = z.object({
    BOT_TOKEN: z.string({ description: "Discord Bot Token is required" }).min(1),
    WEBHOOK_LOGS_URL: z.string().url().optional(),
    MONGO_URI: z.string({ description: "MongoDb URI is required" }).min(1), 
    LOG_CHANNEL_ID: z.string({ description: "LOGS Id is required" }).min(1),
    
    AUTO_ROLE_NAME: z.string({ description: "ROLE_NAME is required" }).min(1), 
    WELCOME_CHANNEL_ID: z.string({ description: "WELCOME CHANNEL Id is required" }).min(1),
    GOODBYE_CHANNEL_ID: z.string({ description: "GOODBYE CHANNEL Id is required" }).min(1),
    // Env vars...
});

type EnvSchema = z.infer<typeof envSchema>;

export { envSchema, type EnvSchema };