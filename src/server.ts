import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';
import { generateSitemap } from './sitemap';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

// allowedHosts: localhost engedélyezett fejlesztésben; production-ban ALLOWED_HOSTS env var-on át adható meg
const allowedHosts = (process.env['ALLOWED_HOSTS'] ?? 'localhost').split(',').filter(Boolean);
const angularApp = new AngularNodeAppEngine({ allowedHosts });

const SITE_URL = process.env['SITE_URL'] ?? environment.siteUrl;
const API_URL = process.env['API_URL'] ?? environment.apiUrl;

app.get('/sitemap.xml', async (_req, res) => {
  const xml = await generateSitemap(SITE_URL, API_URL);
  res.setHeader('Content-Type', 'application/xml');
  res.send(xml);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environmentDevelopment variable, or defaults to 4000.
 */

if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
