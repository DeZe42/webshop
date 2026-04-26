# Changelog

A projekt [Semantic Versioning](https://semver.org/) elvét követi.

---

## [Unreleased]

### Security

- Token tárolás átállítva `localStorage` → `sessionStorage`-ra (rövidebb élettartam, XSS kockázat csökkentése)
- `window.postMessage` wildcard origin (`'*'`) javítva `window.location.origin`-ra
- Google Consent Mode v2 hozzáadva: minden non-essential storage alapból `denied`
- `JSON.parse` localStorage adatokra runtime type guard validáció

### Added

- `ConsentService`: GDPR-kompatibilis consent state management, Google Consent Mode v2 integrációval
- `ConsentBanner` komponens: cookie banner opt-in / opt-out UI
- `IdGeneratorService`: UUID generálás centralizálva (`crypto.randomUUID`)
- SSR ADR dokumentum (`docs/adr/001-ssr-decision.md`) threat model-lel
- CI pipeline kiegészítve: Lighthouse CI + consent regressziós futtatás
- Lighthouse budget konfig (`.github/lighthouse-budget.json`)

### Changed

- `GtmService`: minden esemény automatikusan kap `event_id`, `timestamp`, `app_version`, `env` property-t
- `ProductsService`: HTTP timeout (5s) és exponential backoff retry (max 2x) minden végponton
- `ProductsService.getAll()`: hiba elnyelés megszüntetve, hibák propagálnak az effect-hez
- Bundle budget szigorítva: warning 350 kB, error 600 kB (volt: 500 kB / 1 MB)
- `@typescript-eslint/no-floating-promises` ESLint rule bekapcsolva (type-aware lint)
- `.editorconfig`: `end_of_line = lf` hozzáadva
- `index.html`: `lang="en"` → `lang="hu"` javítva
- `environment.ts` / `environment.development.ts`: `appVersion` mező hozzáadva

### Fixed

- Floating Promise-ok javítva `void` operátorral: `router.navigate()`, `keycloak.logout()`, `keycloak.login()`

---

## [1.2.0] - 2025-10-10

### Added

- Implemented cart synchronization via BroadcastChannel
- Added discriminated union type for Product model

### Fixed

- Race condition between localStorage sync and UI signal update

### Improved

- Lazy loaded routes to reduce initial bundle size

## [1.1.0] - 2025-09-20

### Added

- SEO and Open Graph meta management via SeoService

## [1.0.0] - 2025-09-01

### Initial release

- Base product list, cart, login, dashboard
