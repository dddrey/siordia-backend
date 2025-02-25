import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: " SKILL UP IPI",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;
