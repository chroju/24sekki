import { Hono } from "hono";
import { sekki } from "./24sekki";

const app = new Hono();
app.route("/api/24sekki", sekki);

export default app;
