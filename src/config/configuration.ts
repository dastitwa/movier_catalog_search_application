export default () => ({
    port: parseInt(process.env.PORT ?? '3000', 10),
  
    elasticsearch: {
      node: process.env.ELASTICSEARCH_NODE,
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  });