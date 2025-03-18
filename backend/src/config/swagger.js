const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Quest Platform API',
            version: '1.0.0',
            description: 'API documentation for Quest Platform',
            contact: {
                name: 'Dhairy Patel'
            }
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT}`,
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: [path.join(__dirname, '../route/route.js')], // Using absolute path
};

const specs = swaggerJsdoc(options);
module.exports = { swaggerUi, swaggerSpec: specs };