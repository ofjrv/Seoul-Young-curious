import { createApp } from "./app.js";

const port = Number(process.env.MISSION_PORT ?? 3000);
const server = createApp();

server.listen(port, "127.0.0.1", () => {
  console.log(`Receipt mission server: http://127.0.0.1:${port}`);
});
