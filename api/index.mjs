import bootstrap from '../dist/webshop/server/server.mjs';

export default async function handler(req, res) {
  const app = await bootstrap();
  return app(req, res);
}
