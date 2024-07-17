import { createSwaggerSpec } from "next-swagger-doc";
import User from "./User.json"
import Auth from "./User.json"

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api", // define api folder under app folder
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Next Swagger API Example",
        version: "1.0",
      },

      servers: [
        {
          url: "http://localhost:3000/api",
        },
      ],

      tags: [
        {
          name: "User",
          description: "User related end-points",
        },
        {
          name: "Auth",
          description: "Auth related end-points",
        },
        {
          name: "Post",
          description: "Post related end-points",
        },
      ],

      securityDefinitions: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      paths: {
        "/api/hello": {
          get: {
            tags: ["User"],
            User,
          },

          post: {
            tags: ["User"],
            User,
          },
        },
      },

      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
