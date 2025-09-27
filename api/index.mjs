import server from '../dist/webshop/server/server.mjs';

export default function handler(req, res) {
  server.app()(req, res);
}
