import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";

import registryJson from "../public/registry.json";

const app = new Hono();

app.use(prettyJSON({ force: true }));

app.get("/", (c) => c.json(registryJson));

export default app;
