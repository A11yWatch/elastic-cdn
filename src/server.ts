import { createServer } from "./proto/website-server";

createServer().catch((e) => {
  console.error(e);
});
