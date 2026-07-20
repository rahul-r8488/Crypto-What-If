import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Crypto What-If API",
      version: "2.0.0",
      description:
        "REST API for the Crypto What-If calculator. Calculates hypothetical cryptocurrency investment returns, stores public history, and supports multi-coin comparison.",
      contact: {
        name: "Crypto What-If",
      },
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://your-backend.vercel.app",
        description: "Production server",
      },
    ],
    components: {
      schemas: {
        CalculationResult: {
          type: "object",
          properties: {
            crypto: { type: "string", example: "BTC" },
            date: { type: "string", example: "2021-01-01" },
            invested: { type: "number", example: 10000 },
            priceThen: { type: "number", example: 2300000 },
            priceNow: { type: "number", example: 58000000 },
            units: { type: "number", example: 0.00434782 },
            valueToday: { type: "number", example: 252173.91 },
            profit: { type: "number", example: 242173.91 },
            roi: { type: "string", example: "+2421.74%" },
            type: { type: "string", enum: ["single", "compare"] },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2024-01-15T10:30:00Z",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Calculator",
        description: "Single coin what-if calculations",
      },
      {
        name: "History",
        description: "Public calculation history",
      },
      {
        name: "Compare",
        description: "Multi-coin comparison",
      },
    ],
  },
  apis: ["./controllers/*.js"], // reads JSDoc from all controllers
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
