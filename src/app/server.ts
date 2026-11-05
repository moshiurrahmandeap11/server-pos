import { Server } from "http";
import app from "./app";
import { env } from "./config/env";

const PORT = env.PORT || 5000;
let server: Server;

// ANSI color codes for terminal formatting
const GREEN = "\x1b[32m";
const BOLD_GREEN = "\x1b[1;32m";
const RESET = "\x1b[0m";

const bootstrap = async () => {
    try {
        server = app.listen(PORT, () => {
            console.log(`${GREEN}===================================================${RESET}`);
            console.log(`${GREEN}POS Server running on http://localhost:${PORT}${RESET}`);
            console.log(`${GREEN}Environment: ${env.NODE_ENV}${RESET}`);
            console.log(`${GREEN}===================================================${RESET}`);
        });
    } catch (error) {
        console.error("Failed to start POS server:", error);
        process.exit(1);
    }
};

const handleExit = () => {
    if (server) {
        server.close(() => {
            console.log(`${GREEN}POS Server closed gracefully.${RESET}`);
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on("SIGTERM", handleExit);
process.on("SIGINT", handleExit);

bootstrap();
