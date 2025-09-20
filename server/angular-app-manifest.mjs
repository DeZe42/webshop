
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "preload": [
      "chunk-3EEEIDHU.js"
    ],
    "route": "/"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-O5J2EKTW.js"
    ],
    "route": "/products"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-O5J2EKTW.js"
    ],
    "route": "/products/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-LEEY6G3E.js"
    ],
    "route": "/cart"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 6083, hash: '5d9a798e92271ea3c8b4fa4503896db8c7ab18202153d30540e8e84307cb3119', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1098, hash: '116b78721446bac9270d710c0cd350f12c0cbaa44a92a42fed004748a0699e7b', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-HZ7DFUJC.css': {size: 13746, hash: 's2nhkXjYZ64', text: () => import('./assets-chunks/styles-HZ7DFUJC_css.mjs').then(m => m.default)}
  },
};
