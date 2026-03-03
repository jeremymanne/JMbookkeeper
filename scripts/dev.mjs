import { createServer } from "net";
import { execSync } from "child_process";

function findOpenPort(startPort = 3000) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on("error", () => {
      resolve(findOpenPort(startPort + 1));
    });
  });
}

const port = await findOpenPort(3000);
console.log(`Starting on port ${port}`);
execSync(`npx next dev -p ${port}`, { stdio: "inherit" });
