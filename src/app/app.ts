import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { IndexRoutes } from "./routes";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { notFound } from "./middleware/notFound";

const app: Application = express();

const envAllowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    ...envAllowedOrigins,
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS Error: Origin ${origin} not allowed`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "Apex Retail POS & Inventory Backend Engine is running!",
        timestamp: new Date().toISOString(),
    });
});

// API Routes
app.use("/api/v1", IndexRoutes);

// Error handlers
app.use(globalErrorHandler);
app.use(notFound);

export default app;
