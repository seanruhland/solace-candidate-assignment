import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { advocates } from "../schema";
import { advocateData } from "./advocates";

const main = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const queryClient = postgres(process.env.DATABASE_URL);
  const db = drizzle(queryClient);
  try {
    const records = await db.insert(advocates).values(advocateData).returning();
    console.log("Seeded advocates:", records);
  } catch (error) {
    console.error("Failed to seed database:", error);
  } finally {
    await queryClient.end();
  }
};

main();