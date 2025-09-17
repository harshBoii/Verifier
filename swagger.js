const swaggerAutogen = require('swagger-autogen')();

const doc = {
  openapi: '3.0.0',
  info: {
    title: 'My Next.js API',
    description: 'Auto-generated docs with swagger-autogen'
  },
  servers: [{ url: 'http://localhost:3000' }]
};

const outputFile = './public/swagger.json';

// 👇 Make sure to include *all* your API paths
const endpointsFiles = [
  './src/app/api/**/*.js',    // for JS App Router handlers
  './src/app/api/**/*.ts',    // if using TypeScript
  './pages/api/**/*.js',      // for Pages Router
  './pages/api/**/*.ts'
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('✅ swagger.json generated at', outputFile);
});
