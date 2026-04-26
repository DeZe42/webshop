# Angular Webshop — Demo Dokumentáció

> Ez a dokumentum az alkalmazás technikai megvalósítását mutatja be elvárás-kategóriánként, demo prezentációhoz összeállítva.

---

## Alkalmazás áttekintése

A **webshop** egy modern Angular 20 alapú e-kereskedelmi alkalmazás, amely tartalmaz:

- Terméklistázást és részletes termékoldalt
- Kosárkezelést többfülös szinkronizációval
- Admin dashboardot valós idejű WebSocket értesítésekkel
- JWT és Keycloak SSO alapú kettős autentikációt
- Teljes körű NgRx state managementet
- Szerver oldali renderinget (SSR) és SEO optimalizációt
- GTM analytics integrációt

**Tech stack:** Angular 20 · NgRx 20 · Keycloak-Angular · Socket.io · Tailwind CSS 4 · RxJS 7 · Jasmine/Karma

---

## Tartalomjegyzék

1. [Clean Code & Programozási paradigmák](#1-clean-code--programozási-paradigmák)
2. [Rendering stratégiák — SSR / SSG](#2-rendering-stratégiák--ssr--ssg)
3. [Szoftvertervezési minták és hibakezelés](#3-szoftvertervezési-minták-és-hibakezelés)
4. [Defensive & Offensive kód — Újrafelhasználhatóság](#4-defensive--offensive-kód--újrafelhasználhatóság)
5. [TypeScript haladó funkciók](#5-typescript-haladó-funkciók)
6. [CSS — Layout, változók, animáció](#6-css--layout-változók-animáció)
7. [Formkezelés és validáció](#7-formkezelés-és-validáció)
8. [Web API-k — Notification, BroadcastChannel, postMessage](#8-web-apik--notification-broadcastchannel-postmessage)
9. [State Management](#9-state-management)
10. [Angular architektúra és konfiguráció](#10-angular-architektúra-és-konfiguráció)
11. [Angular haladó funkciók](#11-angular-haladó-funkciók)
12. [Teljesítmény-optimalizáció](#12-teljesítmény-optimalizáció)
13. [SEO](#13-seo)
14. [Analytics — GTM, GA4](#14-analytics--gtm-ga4)
15. [Accessibility](#15-accessibility)
16. [Autentikáció és authorizáció](#16-autentikáció-és-authorizáció)
17. [Tesztelés](#17-tesztelés)
18. [Tooling és DevOps](#18-tooling-és-devops)
19. [OWASP, GDPR, Biztonság](#19-owasp-gdpr-biztonság)
20. [Git és CI/CD](#20-git-és-cicd)

---

## 1. Clean Code & Programozási paradigmák

### ✅ Deklaratív programozás

> **Mi ez?** A "mit csináljon" leírása a "hogyan" helyett — az adatfolyamot és transzformációkat definiáljuk, nem lépésenkénti utasításokat adunk a gépnek.

Az alkalmazás Angular Signals és computed értékeket használ reaktív, deklaratív adatfolyamokhoz — ahelyett, hogy imperatív `subscribe()` hívásokat alkalmazna.

**Fájl:** `src/app/features/products/product-list/product-list.ts`

```typescript
// Deklaratív szűrés — computed signal, nem imperatív loop
filteredProducts = computed(() =>
  this.products().filter((product) => {
    const matchesName = product.name.toLowerCase().includes(this.searchTerm().toLowerCase());
    const matchesCategory = this.selectedCategory()
      ? product.type === this.selectedCategory()
      : true;
    return matchesName && matchesCategory;
  }),
);
```

**Fájl:** `src/app/core/state/cart/cart.reducer.ts`

```typescript
// Deklaratív állapotfrissítés — on() + spread operator
on(CartActions.addToCart, (state, { item }) => {
  const existing = state.items.find((i) => i.id === item.id);
  return {
    ...state,
    items: existing
      ? state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
        )
      : [...state.items, item],
  };
}),
```

Array metódusok (`filter`, `map`, `find`, `reduce`) használata imperatív ciklusok helyett az egész kódbázisban.

---

### ✅ KISS (Keep It Simple, Stupid)

> **Mi ez?** Legyen egyszerű — kerüld a felesleges bonyolítást, írj könnyen érthető, tömör kódot. Ha bonyolultabbá kell tenni, legyen rá jó ok.

Minden service egyetlen felelősséggel rendelkezik:

- `AuthService` — csak autentikáció
- `SeoService` — csak meta tag kezelés
- `GtmService` — csak GTM dataLayer push
- `NotificationService` — csak WebSocket kapcsolat és értesítések

Nincs felesleges absztrakció — pl. az interceptor 20 sorban kezeli a Bearer token csatolást.

**Fájl:** `src/app/core/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (req.url.startsWith(environment.apiUrl) && token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
```

---

### ✅ DRY (Don't Repeat Yourself)

> **Mi ez?** Ne ismételd önmagad — ugyanaz a logika csak egy helyen legyen a kódban. Ha változtatni kell, elég egy helyen módosítani.

- A `Card` komponens újrafelhasználható mind a terméklistán, mind a dashboardon (`isDashboard` input signal alapján más gombok)
- Az `SeoService.setMeta()` egyetlen metódus, minden komponens ezt hívja
- A route path konstansok (`PRODUCTS_PATH`, `CART_PATH` stb.) egy helyen definiáltak, mindenhol ezeket importálják

**Fájl:** `src/app/app.routes.ts`

```typescript
// Path konstansok — egyszer definiálva, bárhonnan importálható
export const PRODUCTS_PATH = 'products';
export const CART_PATH = 'cart';
export const LOGIN_PATH = 'login';
export const DASHBOARD_PATH = 'dashboard';
```

---

### ✅ YAGNI (You Aren't Gonna Need It)

> **Mi ez?** Ne írj olyat, amire még nincs szükség — csak a jelenlegi elvárást valósítsd meg, ne tervezz hipotetikus jövőbeli funkciókra.

Az alkalmazásban nincs felesleges absztrakciós réteg, nincs előre megírt "jövőbeli" funkció. Pl. a state management csak a szükséges actions/selectors-t tartalmazza, nincs generikus "universal CRUD" osztály, amit soha nem használnának.

---

### ✅ SOLID elvek

> **Mi ez?** 5 objektumorientált tervezési elv az átlátható, bővíthető kódért: **S**ingle Responsibility (egy felelősség), **O**pen/Closed (nyitott bővítésre, zárt módosításra), **L**iskov Substitution (leszármazott felválthatja a szülőt), **I**nterface Segregation (kis, specifikus interfészek), **D**ependency Inversion (absztrakciótól függj, ne konkrét implementációtól).

**Single Responsibility:** Minden service és komponens egy felelősséggel rendelkezik (lásd fent).

**Open/Closed:** A `Product` típus discriminated union-nal bővíthető, az összes meglévő kód érintése nélkül:

```typescript
// Új típus hozzáadása nem érinti a meglévő kódot
export type Product = LaptopProduct | PhoneProduct | TabletProduct | AccessoryProduct;
```

**Liskov Substitution:** A `RegisterDto extends LoginDto` — a regisztrációs DTO tartalmaz minden login mezőt + name:

```typescript
export interface RegisterDto extends LoginDto {
  name: string;
}
```

**Interface Segregation:** A `PageMeta` interface `Partial<PageMeta>` formában kerül átadásra, hogy a hívó csak a szükséges mezőket adja meg.

**Dependency Inversion:** Angular DI rendszer — komponensek interfészre (service tokenre) hivatkoznak, nem konkrét implementációra. `inject(Store)`, `inject(AuthService)` stb.

---

### ✅ Early Return

> **Mi ez?** Kilépés a függvényből minél korábban, ha az előfeltétel nem teljesül — elkerüli a mélyen egymásba ágyazott if-eket, a kód lineárisan olvasható marad.

**Fájl:** `src/app/features/dashboard/dashboard/dashboard.ts`

```typescript
public addNewProduct(): void {
  if (this.newProductForm.invalid) return;  // ← early return
  // ... a logika csak valid form esetén fut
}
```

**Fájl:** `src/app/features/products/product-detail/product-detail.ts`

```typescript
public ngOnInit(): void {
  this.product.set(this._route.snapshot.data['product']);
  const product = this.product();
  if (!product) return;  // ← early return null esetén
  // ... SEO és schema beállítás
}
```

**Fájl:** `src/app/core/services/seo.service.ts`

```typescript
private updateTag(tag: MetaDefinition): void {
  if (!isValidMetaContent(tag.content)) {
    return;  // ← early return üres/null content esetén
  }
  this._meta.updateTag(tag);
}
```

---

### ✅ OOP — Hierarchikus modellezés, öröklés

> **Mi ez?** Objektumorientált programozás — valós problémák osztályok és objektumok formájában modellezve. Az öröklés lehetővé teszi, hogy egy típus átvegye a szülő tulajdonságait és viselkedését, majd azt kiegészítse.

**Fájl:** `src/app/core/models/product.model.ts`

Az OOP öröklés Interface szintű hierarchia formájában valósul meg — `BaseProduct` tartalmazza a közös tulajdonságokat, az altípusok (`LaptopProduct`, `PhoneProduct`, `TabletProduct`, `AccessoryProduct`) ebből örökölnek és bővítik saját mezőkkel:

```typescript
export interface BaseProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  keywords: string[];
}

export interface LaptopProduct extends BaseProduct {
  type: 'laptop';
  ramGb: number;
  cpu: string;
  os: string;
  screenInch: number;
}

export interface AccessoryProduct extends BaseProduct {
  type: 'accessory';
  compatibleWith?: string;
}
```

**Szintén öröklés:** `RegisterDto extends LoginDto` a service rétegben.

---

### ⚠️ Mixin

> **Mi ez?** Viselkedés és tulajdonságok megosztása osztályok között az öröklési hierarchián kívül — egy osztály több forrásból "keverhet" össze funkcionalitást anélkül, hogy belőlük örökölne.

A kódbázis TypeScript interface-öröklést alkalmaz (amely funkcionálisan hasonló a Mixin koncepcióhoz). Hagyományos TypeScript class-based Mixin implementáció nem található, de az interface composition (`extends BaseProduct`) pontosan azt a célt szolgálja — közös viselkedés/tulajdonság megosztása több típus között.

---

## 2. Rendering stratégiák — SSR / SSG

### ✅ SSR (Server-Side Rendering) — Szerver oldali renderelés

> **Mi ez?** Az oldal HTML-je a szerveren generálódik minden kérésnél, nem a böngészőben. A felhasználó azonnal kész tartalmat kap — gyorsabb FCP, jobb SEO, de szerver infrastruktúrát igényel.

Az alkalmazás teljes SSR támogatással rendelkezik Angular Universal / Express szerveren keresztül.

**Fájl:** `package.json`

```json
{
  "serve:ssr:webshop": "node dist/webshop/server/server.mjs"
}
```

**Fájl:** `src/app/app.config.ts`

```typescript
provideClientHydration(withEventReplay()),  // SSR hydration + esemény visszajátszás
```

**Platform-aware kód** (SSR-safe) — minden böngésző-specifikus API-t feltételesen hívunk:

**Fájl:** `src/app/core/services/auth.service.ts`

```typescript
getToken(): string | null {
  if (isPlatformBrowser(this._platformId)) {
    return localStorage.getItem('access_token');  // Csak böngészőben
  }
  return null;  // Szerveren null-t ad vissza
}
```

**Fájl:** `src/app/core/services/notification.service.ts`

```typescript
constructor() {
  if (isPlatformBrowser(this.platformId)) {
    this.connect();  // WebSocket csak böngészőben indul el
  }
}
```

**Fájl:** `src/app/core/guards/auth.guard.ts`

```typescript
if (!isPlatformBrowser(platformId)) {
  return true; // Szerveren mindig átenged (SSR kompatibilitás)
}
```

**Rendering stratégiák összehasonlítása (tudás):**

| Stratégia             | Előny                       | Hátrány                 | Mikor érdemes                |
| --------------------- | --------------------------- | ----------------------- | ---------------------------- |
| **CSR** (Client-Side) | Egyszerű deploy, interaktív | Rossz SEO, lassú FCP    | Admin panelek, SPA-k         |
| **SSR** (Server-Side) | Jó SEO, gyors FCP           | Szerver szükséges, TTFB | Webshopok, híroldalak        |
| **SSG** (Static)      | Legjobb teljesítmény, CDN   | Nem dinamikus           | Blog, landing page           |
| **ISR** (Incremental) | Statikus + frissíthető      | Komplex infra           | E-commerce kategória oldalak |

Ez az alkalmazás **SSR-t** használ, ami webshophoz optimális: jó SEO + dinamikus tartalom.

---

### ✅ Provider fogalom

> **Mi ez?** Az Angular DI konténer bejegyzése — megmondja az alkalmazásnak, hogyan hozzon létre egy service-t, milyen értékkel injektálja, és milyen hatókörrel legyen elérhető (root, component, module szinten).

**Fájl:** `src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    ...provideKeycloakAngular(), // Feature provider (kondicionális)
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(), // Globális hibakezelő
    provideZonelessChangeDetection(), // Zoneless CD provider
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(
      StoreModule.forRoot({ cart: cartReducer, products: productsReducer, auth: authReducer }),
      EffectsModule.forRoot([ProductsEffects, AuthEffects]),
      StoreDevtoolsModule.instrument({ maxAge: 25 }),
    ),
  ],
};
```

Minden service `providedIn: 'root'` — tree-shakeable singleton provider:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService { ... }
```

---

## 3. Szoftvertervezési minták és hibakezelés

### ✅ Redux Pattern (NgRx)

> **Mi ez?** Egyirányú adatfolyam — az alkalmazás állapota csak Action-ökön keresztül módosítható, a Reducer pure functionként számolja ki az új állapotot, az Effect kezeli a mellékhatásokat (API hívások). Kiszámítható, debuggolható állapotkezelés.

Az alkalmazás teljes Redux architektúrát valósít meg:

- **Actions** — esemény leírók
- **Reducers** — pure function állapotfrissítők
- **Effects** — side-effect kezelők (API hívások)
- **Selectors** — memoizált állapot-lekérdezők

Lásd részletesen a [9. State Management](#9-state-management) szekciót.

---

### ✅ Observer Pattern (RxJS)

> **Mi ez?** Megfigyelő minta — egy forrás (Observable) eseményeket bocsát ki, a feliratkozók (Observer) reagálnak rájuk. Aszinkron adatfolyamok kezelésére használjuk: HTTP kérések, időzítők, user interakciók.

**Fájl:** `src/app/core/state/products/products.effects.ts`

```typescript
loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ProductsActions.loadProducts),
    switchMap(() =>
      this.productsService.getAll().pipe(
        map((products) => ProductsActions.loadProductsSuccess({ products })),
        catchError((error) =>
          of(ProductsActions.loadProductsFailure({ error: { message: error.message } })),
        ),
      ),
    ),
  ),
);
```

`switchMap` → ha új `loadProducts` action érkezik, az előző API hívás lemondásra kerül (race condition védelem).

---

### ✅ Singleton Pattern

> **Mi ez?** Garantálja, hogy egy osztályból az egész alkalmazásban csak egyetlen példány létezzen — mindenki ugyanazt az objektumot kapja.

Minden service `providedIn: 'root'` — garantált singleton az egész alkalmazáson belül. A `CartSyncService` pl. pontosan egy BroadcastChannel példányt tart fenn az összes fül között.

---

### ✅ Strategy Pattern

> **Mi ez?** Futásidőben cserélhető algoritmus vagy viselkedés — ugyanaz az interfész, más implementáció. A hívó kódnak nem kell tudnia, melyik konkrét stratégia fut.

**Fájl:** `src/app/features/login/login.ts`

A login stratégia futásidőben cserélhető — JWT vs. Keycloak:

```typescript
loginWithJwt(): void {
  this._store.dispatch(AuthActions.login({ credentials }));
}

loginWithKeycloak(): void {
  if (this.keycloak) {
    this.keycloak.login();
  }
}
```

A stratégia választása az `environment.useKeycloak` flag alapján történik.

---

### ✅ Teljes körű hibakezelés

**API szint** — Effects-ben `catchError` minden async műveletnél:

```typescript
catchError((error) =>
  of(ProductsActions.loadProductsFailure({ error: { message: error.message } })),
),
```

**UI szint** — Az auth state tárolja a hibát, a komponens jeleníti meg:

```typescript
// auth.reducer.ts
on(AuthActions.loginFailure, (state, { error }) => ({
  ...state, loading: false, error
})),
```

**WebSocket szint** — reconnect logika exponenciális visszalépéssel:

```typescript
private handleReconnect(): void {
  if (this.reconnectAttempts < this.maxReconnectAttempts) {
    this.reconnectAttempts++;
    setTimeout(() => {
      this.socket?.connect();
    }, 2000 * this.reconnectAttempts);  // Exponenciális backoff
  }
}
```

**Globális hibakezelő:**

```typescript
// app.config.ts
provideBrowserGlobalErrorListeners(),  // Nem kezelt hibák globális elfogása
```

**Defensive validation** — BroadcastChannel üzenetek validálása:

```typescript
if (!Array.isArray(incoming) || !incoming.every(isProduct)) {
  console.warn('Invalid broadcast message received', incoming);
  return;
}
```

---

## 4. Defensive & Offensive kód — Újrafelhasználhatóság

### ✅ Defensive kód

> **Mi ez?** Védekezik a váratlan vagy érvénytelen bemenetek ellen — mindig feltételezi, hogy rossz adat érkezhet kívülről, és minden esetben ellenőriz mielőtt felhasználja.

**Type guard validáció** — `cart-sync.service.ts`:

```typescript
if (!Array.isArray(incoming) || !incoming.every(isProduct)) {
  console.warn('Invalid broadcast message received', incoming);
  return;
}
```

**Null check + early return** — `product-detail.ts`:

```typescript
const product = this.product();
if (!product) return;
```

**Platform check** — minden böngésző API előtt:

```typescript
if (isPlatformBrowser(this._platformId)) {
  return localStorage.getItem('access_token');
}
return null;
```

**Optional chaining** a socket kezelésnél:

```typescript
this.socket?.connect();
this.channel?.postMessage(items);
this.channel?.close();
```

---

### ✅ Offensive kód

> **Mi ez?** Gyorsan megbukik ("fail fast") — feltételezi, hogy az adott belső adat érvényes, és a rendszer azonnal és érthetően jelez hibát, ha ez nem így van. Nem rejti el a problémát.

**Type narrowing switch** — `product-detail.ts`:

A kód feltételezi, hogy ha a type guard átenged, az adat érvényes. A switch minden ágban szándékosan a típusos mezőket éri el:

```typescript
switch (product.type) {
  case 'laptop':
    console.log(product.ramGb); // TypeScript TUDJA, hogy ez LaptopProduct
    break;
  case 'phone':
    console.log(product.os);
    break;
}
```

**Confirm dialog** — `card.ts`:

```typescript
deleteProduct(id: string): void {
  if (confirm('Biztosan törölni szeretnéd ezt a terméket?')) {
    this._store.dispatch(ProductsActions.deleteProduct({ id }));
  }
}
```

---

### ✅ Újrafelhasználható komponensek és kódok

**Card komponens** — `src/app/shared/card/card.ts`

Ugyanaz a komponens jelenik meg a terméklistán és a dashboardon, az `isDashboard` input signal alapján más gombokat renderel.

**SeoService** — `src/app/core/services/seo.service.ts`

Bármely komponensből egyetlen hívással beállítható az összes meta adat:

```typescript
this._seoService.setMeta({ title: product.name, description: product.description, ... });
```

**Route path konstansok** — `src/app/app.routes.ts`

```typescript
export const PRODUCTS_PATH = 'products';
export const LOGIN_PATH = 'login';
// Importálható bárhonnan, így nem kell string literálokat írni
```

---

### ✅ Projekt áttekintése és optimalizálás

Az alkalmazás feature-alapú mappaszervezést alkalmaz (Angular StyleGuide szerint):

```
src/app/
├── core/          ← Singleton servicek, guards, interceptors, state, models, utils
├── features/      ← Lazy-loadolt feature modulok
│   ├── home/
│   ├── login/
│   ├── dashboard/
│   ├── products/
│   └── cart/
└── shared/        ← Újrafelhasználható komponensek (Card, Header)
```

---

## 5. TypeScript haladó funkciók

### ✅ void, null, string | null típusok

> **Mi ez?** TypeScript alapvető speciális típusok: `void` = a függvény nem ad vissza értéket; `null` = szándékosan hiányzó érték; `unknown` = ismeretlen típus, használat előtt ellenőrzés kell; `never` = soha nem érhető el ez az ág (pl. kimerítő switch).

```typescript
// void — mellékhatás effektek
deleteProduct(id: string): void { ... }

// string | null — platform-aware token lekérés
getToken(): string | null {
  if (isPlatformBrowser(this._platformId)) {
    return localStorage.getItem('access_token');
  }
  return null;
}
```

### ✅ Discriminated Union

> **Mi ez?** Típusok uniója egy egyedi megkülönböztető mezővel — a TypeScript a `type` mező értéke alapján automatikusan tudja, melyik altípusról van szó, és csak az ahhoz tartozó mezőket engedi elérni.

**Fájl:** `src/app/core/models/product.model.ts`

```typescript
export type Product = LaptopProduct | PhoneProduct | TabletProduct | AccessoryProduct;
// Minden altípusnak egyedi 'type' literál mezője van — ez a discriminant
```

A TypeScript a `product.type` értéke alapján automatikusan leszűkíti a típust a switch/if ágakban.

### ✅ Type Guards (`typeof`, `instanceof`, `in`)

> **Mi ez?** Futásidőbeli ellenőrzés, amely megmondja a TypeScript fordítónak, hogy egy `unknown` típusú érték milyen konkrét típusú — a függvény visszatérési típusa (`item is Product`) szűkíti a típust az elágazáson belül.

**Fájl:** `src/app/core/utils/type-guards.ts`

```typescript
export function isProduct(item: unknown): item is Product {
  return (
    typeof item === 'object' && // typeof guard
    item !== null &&
    'id' in item && // 'in' guard
    'name' in item &&
    'price' in item
  );
}
```

### ✅ Type Narrowing

> **Mi ez?** A TypeScript automatikusan leszűkíti az ismert típust egy if/switch elágazáson belül — ha belementünk a `case 'laptop':` ágba, a fordító már biztosan tudja, hogy `LaptopProduct`-ról van szó.

**Fájl:** `src/app/features/products/product-detail/product-detail.ts`

```typescript
switch (product.type) {
  case 'laptop':
    console.log(product.ramGb); // narrowed to LaptopProduct
    break;
  case 'phone':
    console.log(product.os); // narrowed to PhoneProduct
    break;
  case 'accessory':
    console.log(product.compatibleWith); // narrowed to AccessoryProduct
    break;
}
```

### ✅ Utility Types

> **Mi ez?** Beépített TypeScript típusmanipuláló segédeszközök — meglévő típusokból új típusokat hoznak létre anélkül, hogy mindent újra kellene definiálni. Pl. `Partial<T>` minden mezőt opcionálissá tesz, `Omit<T, K>` elhagyja a megadott mezőt.

**Fájl:** `src/app/core/services/seo.service.ts`

```typescript
public setMeta(overridedMeta: Partial<PageMeta>): void { ... }
// Partial<T> — minden mező opcionális
```

**Fájl:** `src/app/core/services/gtm.service.ts`

```typescript
pushEvent(event: string, params?: Omit<GtmEvent, 'event'>) { ... }
// Omit<T, K> — 'event' mező kizárása a params-ból
```

**Fájl:** `src/app/core/services/products.service.ts`

```typescript
create(product: Partial<Product>): Observable<Product> { ... }
// Partial<Product> — részleges termék létrehozáshoz
```

### ✅ Generics

> **Mi ez?** Típusparaméterezett kód — ugyanaz a függvény, osztály vagy interfész különböző típusokkal is működik, típusbiztonság megőrzésével. Pl. `signal<Notification[]>` egy Notification tömböt tároló signal.

**Fájl:** `src/app/core/services/auth.service.ts`

```typescript
return this._http.post<AuthResponse>(`${this._apiUrl}/login`, data);
// post<T> — típusos HTTP válasz
```

**Fájl:** `src/app/core/services/notification.service.ts`

```typescript
notifications = signal<Notification[]>([]);
// signal<T> — típusos reactive signal
```

### ✅ Dynamic Import

> **Mi ez?** Modul betöltése futásidőben (`import()`), nem fordítási időben — a böngésző csak akkor tölti le a kódot, ha ténylegesen szükség van rá. Ez az alapja a route lazy loadingnak és a code splittingnek.

**Fájl:** `src/app/app.routes.ts`

```typescript
{
  path: PRODUCTS_PATH,
  loadChildren: () =>
    import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
},
```

Az összes feature modul dinamikus importtal töltődik — ez biztosítja a code splittinget.

### ✅ Entity Types és Interfaces

> **Mi ez?** Erősen típusos adatstruktúrák definiálása interfészekkel — a szerver válaszok, DTO-k és domain objektumok mind explicit TypeScript típussal rendelkeznek, a fordító felismeri az elgépeléseket és hiányzó mezőket.

```typescript
export interface AuthResponse { ... }
export interface LoginDto { ... }
export interface RegisterDto extends LoginDto { ... }
export interface PageMeta { ... }
export interface Notification { ... }
export interface GtmEvent { ... }
export interface CartState { ... }
export interface ProductsState { ... }
export interface AuthState { ... }
```

---

## 6. CSS — Layout, változók, animáció

### ✅ Tailwind CSS — Flex & Grid layout

> **Mi ez?** CSS layout rendszerek: **Flexbox** egydimenziós elrendezésre (sor vagy oszlop), **CSS Grid** kétdimenziós rácsra (sorok és oszlopok egyszerre). A Tailwind utility osztályokkal (`flex`, `grid`, `grid-cols-3`) közvetlenül a HTML-ben alkalmazzák.

**Fájl:** `src/app/shared/card/card.html`

```html
<!-- Grid layout terméklistán -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
```

**Fájl:** `src/app/shared/header/header.html`

```html
<!-- Flex navigáció -->
<nav class="flex items-center justify-between px-6 py-4"></nav>
```

### ✅ Responsive Design — Media queries (Tailwind breakpointok)

Az alkalmazás mobile-first Tailwind breakpointokat használ:

```html
<!-- sm: 640px, md: 768px, lg: 1024px -->
<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  <h1 class="text-3xl md:text-5xl font-bold">
    <div class="flex flex-col sm:flex-row gap-4"></div>
  </h1>
</div>
```

### ✅ CSS Animáció (Tailwind transition)

```html
<!-- Hover scale animáció terméklistán -->
<div class="hover:scale-105 transition-transform duration-200">
  <!-- Shadow animáció -->
  <div class="shadow-md hover:shadow-xl transition-shadow">
    <!-- Szín átmenet gombokhoz -->
    <button class="bg-blue-600 hover:bg-blue-700 transition-colors"></button>
  </div>
</div>
```

**Fájl:** `src/app/shared/card/card.ts` — host stílus (CSS encapsulation):

```typescript
styles: [
  `
    :host {
      display: flex;
    }
  `,
],
```

### ✅ CSS változók

A Tailwind CSS 4 CSS custom properties alapon működik. A `styles.scss` importálja:

```scss
@use 'tailwindcss';
```

### ✅ Pseudo-class és state selectorok

```html
disabled:bg-gray-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:outline-none
hover:bg-blue-700 group-hover:opacity-100
```

### ⚠️ CSS-in-JS

A kódbázis Tailwind-et és Angular inline styles-t használ. Hagyományos CSS-in-JS library (pl. styled-components) nem alkalmazott — ez szándékos döntés, mert Tailwind ezt a használati esetet más megközelítéssel oldja meg (utility-first). Az inline `styles: [...]` Angular komponensben szintén CSS-in-JS megközelítés.

---

## 7. Formkezelés és validáció

### ✅ Reactive Forms

**Fájl:** `src/app/features/dashboard/dashboard/dashboard.ts`

```typescript
newProductForm = new FormGroup({
  name: new FormControl('', [Validators.required, Validators.minLength(3)]),
  price: new FormControl(0, [Validators.required, Validators.min(1)]),
  type: new FormControl<Product['type']>('accessory', Validators.required),
  description: new FormControl('', [Validators.required, Validators.minLength(10)]),
  image: new FormControl('', [Validators.required]),
  keywords: new FormControl(''),
  os: new FormControl(''),
  screenInch: new FormControl<number | null>(null),
  ramGb: new FormControl<number | null>(null),
  cpu: new FormControl(''),
  compatibleWith: new FormControl(''),
});
```

**Fájl:** `src/app/features/login/login.ts`

```typescript
loginForm = new FormGroup({
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [Validators.required, Validators.minLength(6)]),
});
```

### ✅ Form validáció + hibaüzenet megjelenítés

A sablonban feltételes validáció megjelenítés:

```html
<div *ngIf="form.name.invalid && form.name.touched" class="text-red-500 text-sm">
  <span *ngIf="form.name.errors?.['required']">A név megadása kötelező.</span>
  <span *ngIf="form.name.errors?.['minlength']">Minimum 3 karakter szükséges.</span>
</div>
```

### ✅ File upload feldolgozás

**Fájl:** `src/app/features/dashboard/dashboard/dashboard.ts`

```typescript
public onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.newProductForm.patchValue({ image: reader.result as string });
    };
    reader.readAsDataURL(file);  // Base64 kódolás
  }
}
```

---

## 8. Web API-k — Notification, BroadcastChannel, postMessage

### ✅ Socket.io WebSocket (Notification API)

> **Mi ez?** WebSocket = kétirányú, tartós TCP kapcsolat szerver és böngésző között — a szerver bármikor küldhet üzenetet a kliensnek anélkül, hogy a kliens kérne. Valós idejű értesítésekre, chatra, live frissítésekre használják. A Socket.io könyvtár ezt egyszerűsíti le és fallback-kel (polling) egészíti ki.

**Fájl:** `src/app/core/services/notification.service.ts`

```typescript
private connect(): void {
  this.socket = io(environment.apiUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  this.socket.on('notification', (data: Notification) => {
    this.notifications.update((list) => [...list, { ...data, timestamp: new Date(data.timestamp) }]);
  });

  this.socket.on('connect_error', (error) => {
    this.handleReconnect();  // Automatikus újracsatlakozás
  });
}
```

Exponenciális backoff reconnect logika (5 kísérlet, 2/4/6/8/10 másodperces késleltetéssel).

---

### ✅ BroadcastChannel API

> **Mi ez?** Böngésző beépített API, amely lehetővé teszi az üzenetküldést az ugyanazon origin-en futó, párhuzamosan megnyitott böngészőlapfülek között — szerver nélkül, közvetlenül böngészőből böngészőbe.

**Fájl:** `src/app/core/services/cart-sync.service.ts`

```typescript
this.channel = new BroadcastChannel('cart_channel');

// Küldés másik fülnek
this.channel?.postMessage(items);

// Fogadás más fülekből
this.channel.onmessage = (event) => {
  const incoming = event.data;
  // ... validáció és store frissítés
};
```

A kosár állapota automatikusan szinkronizálódik az összes megnyitott böngészőfül között.

---

### ✅ window.postMessage

> **Mi ez?** Böngésző API ugyanazon böngészőn belüli ablakok, iframek vagy popup-ok közötti biztonságos üzenetküldésre — különböző origin-ek között is működik, ha engedélyezett.

**Fájl:** `src/app/shared/card/card.ts`

```typescript
addToCart(product: Product): void {
  this._store.dispatch(CartActions.addToCart({ item }));
  window.postMessage({ type: 'CART_UPDATED', data: product }, '*');
}
```

**Fájl:** `src/app/app.ts`

```typescript
private _messageHandler = (event: MessageEvent) => {
  if (event.data?.type === 'CART_UPDATED') {
    console.log('Kosár frissült', event.data.data);
  }
};

ngOnInit(): void {
  if (this.isBrowser) window.addEventListener('message', this._messageHandler);
}

ngOnDestroy(): void {
  if (this.isBrowser) window.removeEventListener('message', this._messageHandler);
}
```

Memóriaszivárgás ellen az event listener `ngOnDestroy`-ban eltávolításra kerül.

---

### ✅ localStorage Events

> **Mi ez?** A `localStorage` egy böngészőben tárolt, kulcs-érték alapú adattároló — oldalbetöltések és munkamenet-újraindítások között is megmarad. A `storage` eseményen keresztül más lapfülek is értesülhetnek a változásokról.

**Fájl:** `src/app/core/services/cart-sync.service.ts`

```typescript
// Kosár mentése localStorage-be minden változáskor
localStorage.setItem('cart_items', JSON.stringify(items));

// Visszatöltés induláskor
const saved = localStorage.getItem('cart_items');
if (saved) {
  const items: CartItem[] = JSON.parse(saved);
  items.forEach((item) => this.store.dispatch(CartActions.addToCart({ item })));
}
```

---

## 9. State Management

> **Mi ez?** Központi állapotkezelés — az alkalmazás összes adata egyetlen, kiszámítható forrásban (store) van tárolva. Minden komponens onnan olvas, nem egymástól. Áttekinthetővé teszi az adatfolyamot, megkönnyíti a debuggolást és a tesztelést.

### ✅ NgRx — Teljes Redux implementáció

> **Mi ez?** Angular-ra épített Redux implementáció RxJS-sel — reaktív, egyirányú adatfolyam. Az NgRx a Redux elveket Angular-specifikus eszközökkel valósítja meg: `Store`, `Actions`, `Reducers`, `Effects`, `Selectors`.

Az alkalmazás **3 state slice-t** kezel:

#### Cart State

**Fájl:** `src/app/core/state/cart/cart.actions.ts`

```typescript
export const addToCart = createAction('[Cart] Add To Cart', props<{ item: CartItem }>());
export const removeFromCart = createAction('[Cart] Remove From Cart', props<{ id: string }>());
export const clearCart = createAction('[Cart] Clear Cart');
```

**Fájl:** `src/app/core/state/cart/cart.reducer.ts`

```typescript
export type CartItem = Product & { quantity: number };

export const cartReducer = createReducer(
  initialState,
  on(CartActions.addToCart, (state, { item }) => {
    const existing = state.items.find((i) => i.id === item.id);
    return {
      ...state,
      items: existing
        ? state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i,
          )
        : [...state.items, item],
    };
  }),
);
```

**Fájl:** `src/app/core/state/cart/cart.selectors.ts`

```typescript
export const selectCartTotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0),
);
```

#### Products State

**Fájl:** `src/app/core/state/products/products.effects.ts`

```typescript
loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ProductsActions.loadProducts),
    switchMap(() =>
      this.productsService.getAll().pipe(
        map((products) => ProductsActions.loadProductsSuccess({ products })),
        catchError((error) =>
          of(ProductsActions.loadProductsFailure({ error: { message: error.message } })),
        ),
      ),
    ),
  ),
);
```

#### Auth State

Auth lifecycle: `initAuth` → localStorage ellenőrzés → `initAuthSuccess` → guard átenged

```typescript
// auth.effects.ts — Session visszatöltés
initAuth$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.initAuth),
    map(() => {
      if (isPlatformBrowser(this.platformId)) {
        const token = localStorage.getItem('access_token');
        const userJson = localStorage.getItem('user');
        if (token && userJson) {
          return AuthActions.initAuthSuccess({ user: JSON.parse(userJson), token });
        }
      }
      return { type: '[Auth] Init Auth No Session' };
    }),
  ),
);
```

#### Selectors

```typescript
// Memorizált lekérdezők
export const selectIsAdmin = createSelector(
  selectAuthState,
  (state) => state.user?.role === 'admin',
);
```

---

## 10. Angular architektúra és konfiguráció

### ✅ Angular StyleGuide és file-structure

> **Mi ez?** Az Angular csapat által javasolt hivatalos kódszervezési és elnevezési konvenciók — feature-alapú mappák, `kebab-case` fájlnevek, egy fájl = egy felelősség. Segít, hogy bármely Angular projekt azonnal felismerhető legyen.

Az alkalmazás követi az [Angular StyleGuide](https://angular.io/guide/styleguide) ajánlásait:

- Feature-based mappaszervezés
- `core/` — singleton servicek
- `features/` — lazy-loadolt feature modulok
- `shared/` — újrafelhasználható komponensek
- Minden fájl `kebab-case` névvel
- Komponens fájlok: `feature.ts`, `feature.html`, `feature.scss`, `feature.spec.ts`

### ✅ angular.json konfiguráció

> **Mi ez?** Az Angular CLI fő konfigurációs fájlja — tartalmazza a build beállításokat, fájlcseréket (environments), bundle budgeteket, stílusprocesszort, SSR belépési pontot, és azt, hogy melyik `ng` parancs mit csináljon.

- **SSR konfiguráció** — `server.ts` entry point
- **Build budgets** — 500kB initial warning, 1MB error; 4kB component style warning
- **Environment fileReplacements** — `environment.ts` → `environment.development.ts` dev módban
- **Standalone components** — alapértelmezett
- **SCSS** — stílusprocesszor

### ✅ Environments

> **Mi ez?** Környezetfüggő konfigurációs fájlok — dev módban más API URL-t, más feature flag-eket (pl. Keycloak bekapcsolva) tartalmaz, mint production-ben. Az `angular.json` build ideje cseréli le a fájlt.

**Fájl:** `src/environments/environment.ts` (production)

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:3000',
  useKeycloak: false,
};
```

**Fájl:** `src/environments/environment.development.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  useKeycloak: true, // Dev módban Keycloak bekapcsolva
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'myRealm',
    clientId: 'angular-app',
  },
};
```

### ✅ Build scriptek

```json
"start": "ng serve",
"build": "ng build --configuration production",
"build-dev": "ng build --configuration development",
"serve:ssr:webshop": "node dist/webshop/server/server.mjs",
"test": "ng test --watch=false --browsers=ChromeHeadless --code-coverage"
```

### ✅ Path alias

> **Mi ez?** TypeScript import rövidítés — ahelyett, hogy `../../../../environments/environment`-t írunk, elegendő az `@environments/environment`. Olvashatóbb kód, és nem törik el az import ha a fájlt más mappába mozgatjuk.

**Fájl:** `tsconfig.app.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@environments/*": ["src/environments/*"]
    }
  }
}
```

Így az importok `@environments/environment` formájúak — nem kell relatív útvonalat írni.

---

## 11. Angular haladó funkciók

### ✅ Guards — canMatch

> **Mi ez?** Route-védelem — az Angular router aktiválás előtt meghívja a guard függvényt. Ha `false`-t ad vissza, a navigáció megakad (pl. bejelentkező oldalra dob). A `canMatch` a route teljes eltávolítását is lehetővé teszi a routing táblából.

**Fájl:** `src/app/core/guards/auth.guard.ts`

Funkcionális guard (Angular 15+ stílus), SSR-safe, JWT + Keycloak kettős ellenőrzéssel:

```typescript
export const authCanMatch = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const store = inject(Store);

  if (!isPlatformBrowser(platformId)) return true; // SSR: átenged
  if (store.selectSignal(AuthSelectors.selectIsAuthenticated)()) return true; // JWT

  if (environment.useKeycloak) {
    const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL, { optional: true });
    // ... Keycloak esemény ellenőrzés
  }

  router.navigate([LOGIN_PATH]);
  return false;
};
```

### ✅ Interceptors — Funkcionális interceptor

> **Mi ez?** HTTP kérések és válaszok automatikus köztes kezelése — minden egyes kérés átmegy az interceptoron, ahol módosítható (pl. token hozzáfűzés), naplózható vagy hibakezelés adható hozzá. Az Angular 15+ funkcionális stílusban is írható.

**Fájl:** `src/app/core/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (req.url.startsWith(environment.apiUrl) && token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
```

Regisztrálva: `provideHttpClient(withInterceptors([authInterceptor]))`

### ✅ Signals

> **Mi ez?** Angular 16-ban bevezetett reaktív primitívek — egy `signal()` értékének változásakor az Angular automatikusan tudja, melyik komponenst kell frissíteni, Zone.js-nélküli, finomhangolt változásdetektálással.

Az alkalmazás kiterjedten használja az Angular Signals-t:

```typescript
// Alap signal
notifications = signal<Notification[]>([]);
isConnected = signal(false);
product = signal<Product | null>(null);
showNotifications = signal(false);

// Store signal
products = this._store.selectSignal(ProductsSelectors.selectAllProducts);
isAuthenticated = this._store.selectSignal(AuthSelectors.selectIsAuthenticated);

// Computed signal
filteredProducts = computed(() => this.products().filter(...));
authenticated = computed(() => this.jwtAuthenticated() || this.keycloakAuthenticated());

// Signal frissítés
this.notifications.update((list) => [...list, newNotification]);
this.showNotifications.update(v => !v);
```

### ✅ Change Detection — OnPush + Zoneless

> **Mi ez?** Változásdetektálás — az Angular mechanizmusa, amellyel eldönti, mikor frissítse a DOM-ot. **OnPush** = csak akkor fut le, ha az input referencia változott vagy Signal értesített. **Zoneless** = Zone.js nélkül fut, az Angular csak explicit jelzésre ellenőriz — maximális teljesítmény.

**Minden komponens** `ChangeDetectionStrategy.OnPush`-t használ:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

**Zoneless change detection** — nincs Zone.js:

```typescript
// app.config.ts
provideZonelessChangeDetection(),
```

Ez a kombináció a lehető legjobb teljesítményt biztosítja — Angular csak akkor ellenőriz, ha Signal változik.

### ✅ RxJS

> **Mi ez?** Reaktív programozás könyvtár — aszinkron adatfolyamok (HTTP, időzítők, events) kezelése operátorokkal. Pl. `switchMap` lemondja az előző hívást ha új jön, `catchError` elkapja a hibát, `map` transzformál.

```typescript
// switchMap — előző Observable lemondása
// catchError — hibakezelés
// map — transzformáció
// of — szinkron Observable
// filter — szűrés
// firstValueFrom — Promise konverzió (resolver-ben)
// Subject — destroy jelzésre (seo.service.ts)
```

### ✅ Dependency Injection mélyebb ismerete

> **Mi ez?** Az Angular DI rendszer — a komponensek és service-ek a szükséges függőségeket nem maguk hozzák létre, hanem az Angular konténer injektálja őket. **Injection token** = nem osztály alapú DI (pl. `PLATFORM_ID`). **Optional** = nem kötelező függőség, `null` is lehet. **Forward ref** = körkörös referencia feloldása.

**Optional dependency:**

```typescript
// auth.guard.ts
const keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL, { optional: true });
```

**PLATFORM_ID injection token:**

```typescript
private _platformId = inject(PLATFORM_ID);
```

**DOCUMENT injection token:**

```typescript
private _document = inject(DOCUMENT);  // seo.service.ts
```

**Keycloak opcionális injektálás:**

```typescript
private keycloak = this.useKeycloak ? inject(Keycloak, { optional: true }) : null;
```

### ✅ Resolverek

> **Mi ez?** Adatelőtöltő a navigáció előtt — a route resolver betölti a szükséges adatot még azelőtt, hogy a célkomponens aktiválódna. A komponens a `route.snapshot.data`-ból már kész adatot kap, nem kell töltést kezelni.

**Fájl:** `src/app/features/products/resolvers/product-detail.resolver.ts`

A route resolver betölti az adatot a komponens aktiválása előtt:

```typescript
@Injectable({ providedIn: 'root' })
export class ProductDetailResolver implements Resolve<Product | null> {
  async resolve(route: ActivatedRouteSnapshot): Promise<Product | null> {
    const id = route.params['id'];
    this._store.dispatch(ProductsActions.loadProducts());
    const products = await firstValueFrom(
      this._store.select(ProductsSelectors.selectAllProducts).pipe(
        filter((p) => p.length > 0),
        catchError(() => of([])),
      ),
    );
    return products.find((p) => p.id === id) || null;
  }
}
```

### ✅ Input Signals

> **Mi ez?** Angular 17+ stílusú komponens bemenet — az `input<T>()` Signal-t ad vissza a `@Input()` dekorátor helyett. Reaktív, típusbiztos, és közvetlenül használható `computed()` és `effect()` belsejében.

**Fájl:** `src/app/shared/card/card.ts`

```typescript
product = input<Product>();
isDashboard = input<boolean>();
```

Angular 17+ stílusú input signals — nem `@Input()` decorator.

---

## 12. Teljesítmény-optimalizáció

### ✅ Route Lazy Loading

> **Mi ez?** Modulok/komponensek betöltése csak szükség esetén, dynamic import-tal — az alkalmazás indulásakor csak a főoldal töltődik le, a többi feature modul kódja csak akkor kerül letöltésre, ha a felhasználó odanavigál.

**Fájl:** `src/app/app.routes.ts`

Minden feature modul lazy load — csak akkor töltődik le, ha a felhasználó odanavigál:

```typescript
{
  path: PRODUCTS_PATH,
  loadChildren: () =>
    import('./features/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
},
```

### ✅ Code Splitting

> **Mi ez?** A kód automatikus szétdarabolása kisebb fájlokra build-kor — a böngésző párhuzamosan töltheti le őket, és csak azt tölti le, amit ténylegesen használ. Az Angular CLI a lazy loading alapján automatikusan elvégzi.

A lazy loading automatikusan code splittelést eredményez — a build külön chunk fájlokat generál minden feature modulhoz.

### ✅ Tree Shaking

> **Mi ez?** Nem használt kód automatikus eltávolítása build-kor — a bundler "lerázza a fáról" azokat a modulokat, amelyekre nincs élő import hivatkozás. Kisebb bundle, gyorsabb betöltés.

- Standalone komponensek → Angular tree-shaker csak a ténylegesen használt kódot bundle-öli
- `providedIn: 'root'` → service csak akkor kerül a bundle-be, ha van rá hivatkozás

### ✅ OnPush + Zoneless (lásd fent)

### ✅ Memoizált Selectors

> **Mi ez?** Gyorsítótárazott lekérdezők — az NgRx `createSelector` csak akkor számolja újra az értéket, ha a bemeneti selector(ok) változtak. Ha ugyanazokkal a bemeneti értékekkel hívják meg, az előző eredményt adja vissza azonnal.

```typescript
export const selectCartTotal = createSelector(selectCartItems, (items) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0),
);
// createSelector automatikusan memoizál — csak akkor számol újra, ha a bemeneti selector változik
```

### ✅ Lazy image loading

**Fájl:** `src/app/shared/card/card.html`

```html
<img loading="lazy" decoding="async" [src]="product.image" [alt]="product.name" />
```

### ✅ NgOptimizedImage

> **Mi ez?** Angular beépített direktíva képek optimális betöltéséhez — automatikusan beállítja a `loading`, `fetchpriority`, `width`/`height` attribútumokat, figyelmeztet hiányzó méretek esetén, és javítja az LCP metrikát.

**Fájl:** `src/app/features/products/product-detail/product-detail.html`

```html
<img ngSrc="..." fetchpriority="high" width="400" height="400" />
```

### ✅ Bundle budgets

> **Mi ez?** Maximális bundle méret korlátok az `angular.json`-ban — ha a lefordított fájl átlépi a határt, az Angular CLI figyelmeztetést dob (warning) vagy leállítja a buildet (error). Megakadályozza, hogy a bundle észrevétlenül megnőjön.

**Fájl:** `angular.json`

```json
"budgets": [
  { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
  { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
]
```

### ✅ Computed Signals (memoizáció)

> **Mi ez?** Derivált Signal értékek — automatikusan újraszámolódnak, ha valamelyik forrás Signal változik, egyébként gyorsítótárazott értéket adnak vissza. Pont, mint egy spreadsheet cella amely más cellákból számol.

```typescript
filteredProducts = computed(() =>
  this.products().filter(...)
);
// Csak akkor fut újra, ha products() vagy searchTerm() változik
```

### ✅ Frontend performancia metrikák (tudás)

| Metrika                            | Leírás                      | Alkalmazásban                |
| ---------------------------------- | --------------------------- | ---------------------------- |
| **FCP** — First Contentful Paint   | Első tartalom megjelenése   | SSR javítja                  |
| **LCP** — Largest Contentful Paint | Legnagyobb elem megjelenése | `fetchpriority="high"` + SSR |
| **TTI** — Time To Interactive      | Mikor interaktív az oldal   | Lazy loading, OnPush         |
| **TBT** — Total Blocking Time      | Blokkoló JS idő             | Zoneless, code splitting     |
| **CLS** — Cumulative Layout Shift  | Elrendezés ugrások          | Képméretek megadása          |
| **SI** — Speed Index               | Vizuális betöltési sebesség | SSR + lazy loading           |

---

## 13. SEO

### ✅ Meta tagek — Open Graph, Twitter Card

> **Mi ez?** **Open Graph** = Facebook által kifejlesztett protokoll, amellyel meghatározhatjuk, hogyan jelenjen meg az oldalunk közösségi megosztáskor (cím, kép, leírás). **Twitter Card** = ugyanez Twitter-specifikusan. A kereső botok és közösségi platformok ezeket a `<meta>` tageket olvassák.

**Fájl:** `src/app/core/services/seo.service.ts`

```typescript
// Open Graph
this.updateTag({ name: 'og:title', property: 'og:title', content: meta.title });
this.updateTag({ name: 'og:image', property: 'og:image', content: meta.image });
this.updateTag({ name: 'og:description', property: 'og:description', content: meta.description });
this.updateTag({ name: 'og:site_name', property: 'og:site_name', content: meta.siteName });

// Twitter Card
this.updateTag({ name: 'twitter:title', content: meta.title });
this.updateTag({ name: 'twitter:description', content: meta.description });
this.updateTag({ name: 'twitter:image', content: meta.image });
this.updateTag({ name: 'twitter:site', content: meta.siteName });
```

### ✅ Canonical URL

> **Mi ez?** Megmondja a keresőknek, melyik az oldal "eredeti", kanonikus URL-je — elkerüli a duplikált tartalom problémát, ha ugyanaz az oldal több URL-en is elérhető (pl. `?sort=asc` paraméterrel). A Google ezt az URL-t indexeli.

```typescript
public setCanonicalUrl(url: string): void {
  let link: HTMLLinkElement | null = this._document.querySelector('link[rel="canonical"]');

  if (!link) {
    link = this._document.createElement('link');
    link.setAttribute('rel', 'canonical');
    this._document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}
```

Használat termékoldalakon:

```typescript
this._seoService.setCanonicalUrl(`https://yourwebshop.com/products/${product.id}`);
```

### ✅ Schema Markup — JSON-LD

> **Mi ez?** Strukturált adat a HTML `<head>`-ben — a keresők (Google) felolvassák és gazdagabb találati megjelenítést adhatnak: termékár, értékelés, elérhetőség közvetlenül a keresési eredményben. A **JSON-LD** formátum a legegyszerűbben kezelhető.

```typescript
public setProductSchema(product: Product): void {
  const script = this._document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "24"
    }
  });
  this._document.head.appendChild(script);
}
```

### ✅ robots.txt

**Fájl:** `public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /cart
Sitemap: https://yourwebshop.com/sitemap.xml
```

A dashboard és kosár nem indexelhető — csak a nyilvános oldalak.

### ✅ sitemap.xml

**Fájl:** `public/sitemap.xml`

```xml
<url>
  <loc>https://yourwebshop.com/</loc>
  <priority>1.0</priority>
  <changefreq>daily</changefreq>
</url>
<url>
  <loc>https://yourwebshop.com/products</loc>
  <priority>0.9</priority>
  <changefreq>daily</changefreq>
</url>
```

### ✅ SEO-barát URL-ek

Az útvonalak leíró, kisbetűs, kötőjel-mentes URL-eket használnak:

- `/products` — terméklista
- `/products/:id` — egyedi termék
- `/cart` — kosár
- `/login` — bejelentkezés

---

## 14. Analytics — GTM, GA4

### ✅ GTM dataLayer integráció

> **Mi ez?** **GTM** (Google Tag Manager) = külső mérőkódok (GA4, Facebook Pixel, konverziók) kezelése egy konténerből, kód módosítása nélkül. A **dataLayer** = JavaScript tömb, amelybe az alkalmazás eseményeket push-ol, a GTM ezeket figyeli és továbbítja a beállított analitikai eszközöknek.

**Fájl:** `src/app/core/services/gtm.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class GtmService {
  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      window.dataLayer = window.dataLayer || [];
    }
  }

  pushEvent(event: string, params?: Omit<GtmEvent, 'event'>) {
    window.dataLayer.push({ event, ...params });
  }
}
```

### ✅ Egyedi GTM esemény — kosárba rakás

**Fájl:** `src/app/shared/card/card.ts`

```typescript
addToCart(product: Product): void {
  const item: CartItem = { ...product, quantity: 1 };
  this._store.dispatch(CartActions.addToCart({ item }));

  // GTM event küldés
  this._gtmService.pushEvent('add_to_cart', {
    product_id: product.id,
    name: product.name,
    price: product.price,
  });
}
```

Az `add_to_cart` esemény automatikusan megjelenik a GTM konténerben és forwarding esetén a GA4-ben.

---

## 15. Accessibility

### ✅ Aria attribútumok

> **Mi ez?** ARIA = Accessible Rich Internet Applications — HTML attribútumok, amelyek kiegészítő szemantikai információt adnak a képernyőolvasóknak és asszisztív technológiáknak. Pl. `aria-label` leírja, mit csinál a gomb, ha nincs látható szöveg.

```html
<!-- Dashboard értesítés gomb -->
<button aria-label="Értesítések: {{ notifications().length }} db">
  <!-- Rejtett label keresőhöz -->
  <label for="search" class="sr-only">Keresés termékek között</label>
  <input id="search" type="text" ... />

  <!-- Kategória szűrő -->
  <label for="category" class="sr-only">Kategória</label>
  <select id="category" ...>
    <!-- Termék típusa -->
    <label for="typeSelect" class="sr-only">Termék típusa</label>
  </select>
</button>
```

### ✅ Szemantikus HTML

> **Mi ez?** A megfelelő HTML elem használata a tartalom értelmének kifejezéséhez — `<nav>` navigációhoz, `<main>` fő tartalomhoz, `<button>` gombhoz (ne `<div onclick>`). A böngészők, keresők és képernyőolvasók mind értelmezik ezeket.

```html
<header>...</header>
<nav>...</nav>
<main>...</main>
<section>...</section>
<article>...</article>

<!-- Form label asszociáció -->
<label for="email">Email cím</label>
<input id="email" type="email" />
```

### ✅ Képek alt szövege

```html
<img [alt]="product.name" ... />
```

### ✅ Focus és outline kezelés

```html
<input class="focus:ring-2 focus:ring-blue-500 focus:outline-none" />
<button class="focus:ring-2 focus:ring-offset-2"></button>
```

### ✅ Disabled állapot

```html
<button [disabled]="isLoading()" class="disabled:bg-gray-400 disabled:cursor-not-allowed"></button>
```

---

## 16. Autentikáció és authorizáció

### ✅ JWT alapú autentikáció

> **Mi ez?** JWT = JSON Web Token — titkosított, önálló token a felhasználó azonosságának igazolására. A szerver generálja bejelentkezéskor, a kliens tárolja és minden kéréshez elküldi (`Authorization: Bearer ...`). A szerver visszafejti és ellenőrzi, adatbázis lekérdezés nélkül.

**Flow:**

1. Felhasználó kitölti a login formot
2. `Store.dispatch(AuthActions.login({ credentials }))`
3. `AuthEffects.login$` meghívja az `AuthService.login()` HTTP kérést
4. Siker esetén `loginSuccess` action → token + user mentés localStorage-be + redirect
5. Minden API híváshoz az `authInterceptor` automatikusan hozzáfűzi a Bearer tokent
6. Az `authCanMatch` guard ellenőrzi az autentikált státuszt route váltáskor

**Fájl:** `src/app/core/services/auth.service.ts`

```typescript
login(data: LoginDto): Observable<AuthResponse> {
  return this._http.post<AuthResponse>(`${this._apiUrl}/login`, data);
}

getToken(): string | null {
  if (isPlatformBrowser(this._platformId)) {
    return localStorage.getItem('access_token');
  }
  return null;
}
```

### ✅ Keycloak SSO (OAuth / OIDC)

> **Mi ez?** **Keycloak** = nyílt forráskódú identity és access management szerver. **SSO** (Single Sign-On) = egyszeri bejelentkezés — egy fiókkal több alkalmazásba is belép a felhasználó. **OAuth 2.0** = nyílt authorizációs protokoll. **OIDC** (OpenID Connect) = OAuth-ra épülő identity réteg, amely a felhasználói adatokat is biztosítja.

**Fájl:** `keycloak.config.ts`

```typescript
return [
  provideKeycloak({
    config: {
      realm: environment.keycloak.realm,
      url: environment.keycloak.url,
      clientId: environment.keycloak.clientId,
    },
    initOptions: {
      onLoad: 'check-sso', // SSO session ellenőrzés oldalbetöltéskor
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'logout',
        sessionTimeout: 60000, // Auto logout 1 perc inaktivitás után
      }),
    ],
  }),
];
```

**Auto token refresh** — a Keycloak SDK automatikusan megújítja a tokent lejárat előtt.

### ✅ Authorizáció — szerepkör alapú

> **Mi ez?** Autentikáció = ki vagy (azonosítás). Authorizáció = mit csinálhatsz (jogosultság). A szerepkör alapú hozzáférés-vezérlés (RBAC) meghatározza, hogy az egyes szerepkörök (pl. `admin`, `user`) milyen műveleteket végezhetnek.

```typescript
// auth.selectors.ts
export const selectIsAdmin = createSelector(
  selectAuthState,
  (state) => state.user?.role === 'admin',
);
```

A dashboard csak admin felhasználóknak látható — a `canMatch` guard védi.

### ✅ Kettős autentikáció (dual auth)

**Fájl:** `src/app/shared/header/header.ts`

```typescript
jwtAuthenticated = this._store.selectSignal(AuthSelectors.selectIsAuthenticated);
keycloakAuthenticated = signal(false);

// Computed: bármelyik autentikáció elég
authenticated = computed(() =>
  this.jwtAuthenticated() || this.keycloakAuthenticated()
);

logout(): void {
  if (this.jwtAuthenticated()) {
    this._store.dispatch(AuthActions.logout());  // JWT logout
  }
  if (this.keycloak && this.keycloakAuthenticated()) {
    this.keycloak.logout({ redirectUri: window.location.href });  // Keycloak logout
  }
}
```

---

## 17. Tesztelés

### ✅ Unit tesztek — Jasmine + Karma

> **Mi ez?** **Unit teszt** = az alkalmazás legkisebb egységeinek (függvények, komponensek) izolált, automatizált tesztelése. **Jasmine** = JavaScript tesztelési keretrendszer (`describe`/`it`/`expect` szintaxissal). **Karma** = tesztfuttató, amely böngészőben futtatja a Jasmine teszteket és riportot generál.

Az összes komponenshez és service-hez `*.spec.ts` fájlok tartoznak.

**Futtatás:**

```bash
ng test --watch=false --browsers=ChromeHeadless --code-coverage
```

### ✅ Dependency Mockolás

> **Mi ez?** A tesztelt egység függőségeinek helyettesítése tesztelési célú "hamis" implementációval (mock/spy) — így a teszt csak az adott egységet vizsgálja, nem az egész rendszert. A Jasmine `createSpyObj` létrehoz egy olyan objektumot, amely rögzíti, mikor és mivel hívták meg.

**Fájl:** `src/app/shared/card/card.spec.ts`

```typescript
beforeEach(async () => {
  storeSpy = jasmine.createSpyObj('Store', ['dispatch']);
  routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  gtmSpy = jasmine.createSpyObj('GtmService', ['pushEvent']);

  await TestBed.configureTestingModule({
    imports: [Card],
    providers: [
      { provide: Store, useValue: storeSpy },
      { provide: Router, useValue: routerSpy },
      { provide: GtmService, useValue: gtmSpy },
    ],
  }).compileComponents();
});
```

### ✅ Store dispatch tesztelés

```typescript
it('should dispatch addToCart and push GTM event', () => {
  component.addToCart(mockProduct);

  expect(storeSpy.dispatch).toHaveBeenCalledWith(
    CartActions.addToCart({ item: { ...mockProduct, quantity: 1 } }),
  );

  expect(gtmSpy.pushEvent).toHaveBeenCalledWith('add_to_cart', {
    product_id: mockProduct.id,
    name: mockProduct.name,
    price: mockProduct.price,
  });
});
```

### ✅ Null / edge case tesztelés

**Fájl:** `src/app/features/products/product-detail/product-detail.spec.ts`

```typescript
it('should not dispatch addToCart if product is null', () => {
  (component as any).product = signal(null);
  component.addToCart();
  expect(storeSpy.dispatch).not.toHaveBeenCalledWith(
    jasmine.objectContaining({ item: jasmine.anything() }),
  );
});
```

### ✅ Template tesztelés

```typescript
it('should render product info correctly', () => {
  const el = fixture.nativeElement;
  const name = el.querySelector('h3')?.textContent;
  expect(name).toContain(mockProduct.name);

  const img = el.querySelector('img') as HTMLImageElement;
  expect(img.alt).toBe(mockProduct.name);
});
```

### ✅ SEO service tesztelés

```typescript
it('should call seoService.setMeta on init', () => {
  expect(seoSpy.setMeta).toHaveBeenCalledWith({
    title: mockProduct.name,
    description: mockProduct.description,
    image: mockProduct.image,
    siteName: 'My Angular Webshop',
    keywords: mockProduct.keywords.join(', '),
    themeColor: '#ffffff',
  });
});
```

### Tesztlefedettség — összesítés

| Komponens/Service | Tesztek | Főbb lefedett esetek                                          |
| ----------------- | ------- | ------------------------------------------------------------- |
| `Card`            | 7+      | GTM event, dispatch, navigáció, template, dashboard/store mód |
| `ProductDetail`   | 5       | Init, product signal, SEO, addToCart, null check              |
| `Dashboard`       | 10+     | Form validáció, dispatch, form reset, invalid form            |
| `Login`           | 7       | Keycloak integráció, form validáció                           |
| `Header`          | 5       | Auth, logout                                                  |

---

## 18. Tooling és DevOps

### ✅ NgRx DevTools

**Fájl:** `src/app/app.config.ts`

```typescript
StoreDevtoolsModule.instrument({ maxAge: 25 });
```

Redux DevTools böngészőbővítménnyel minden action és state változás vizsgálható.

### ✅ angular.json — Build konfiguráció módosítása

```json
"configurations": {
  "production": {
    "optimization": true,
    "outputHashing": "all",
    "sourceMap": false,
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.production.ts"
      }
    ]
  },
  "development": {
    "optimization": false,
    "sourceMap": true,
    "fileReplacements": [
      {
        "replace": "src/environments/environment.ts",
        "with": "src/environments/environment.development.ts"
      }
    ]
  }
}
```

### ✅ TypeScript strict konfiguráció

A `tsconfig.json` strict mode-ban van — ez kényszeríti a type safetyt.

### ⚠️ Storybook / Postman

Nem találhatók a projektben. Ezek külső tooling eszközök, amelyek egyszerűen hozzáadhatók.

### ⚠️ Bundle analízis (Webpack Bundle Analyzer)

Hozzáadható: `npm install --save-dev webpack-bundle-analyzer`

Majd az `angular.json`-ban:

```json
"statsJson": true
```

```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/webshop/browser/stats.json
```

---

## 19. OWASP, GDPR, Biztonság

### ✅ OWASP védelem — Injection és XSS

> **Mi ez?** **OWASP** (Open Web Application Security Project) = a leggyakoribb webes biztonsági sérülékenységek listája. **XSS** (Cross-Site Scripting) = rosszindulatú szkript futtatása az oldalon idegen forrásból. **CSRF** (Cross-Site Request Forgery) = a felhasználó nevében küldött jogosulatlan kérés.

- Angular template engine automatikusan sanitizálja az interpolált értékeket
- HTTP kérések csak `environment.apiUrl`-ra kapnak Bearer tokent (token leak védelem)
- A `isProduct` type guard validálja az ismeretlen forrásból érkező adatot

### ✅ Autentikáció és Session Management

- JWT token localStorage-ben (nem cookie — CSRF védelem)
- Keycloak auto token refresh és inaktivitás logout
- A `/dashboard` route authGuard-dal védett

### ✅ Security Headers — robots.txt

```
Disallow: /dashboard
Disallow: /cart
```

Az érzékeny oldalak nem indexelhetők.

### ⚠️ GDPR sütitájékoztató

> **Mi ez?** **GDPR** (General Data Protection Regulation) = európai adatvédelmi rendelet — előírja, hogy a felhasználókat tájékoztatni kell az adatkezelésről és hozzájárulásuk szükséges. A cookie consent banner ennek a kötelezettségnek a felületi megvalósítása.

Dedikált GDPR/cookie consent megoldás nincs implementálva. Ez általában egy külső library (pl. `ngx-cookieconsent`) vagy egyedi implementáció lenne.

---

## 20. Git és CI/CD

> **Mi ez?** **CI** (Continuous Integration) = minden kódváltozásnál automatikusan fut a build és a tesztek. **CD** (Continuous Delivery/Deployment) = sikeres CI után automatikusan kerül ki az alkalmazás a célkörnyezetbe. Megakadályozza, hogy hibás kód kerüljön production-be.

### ✅ Git projekt kezelés

A projekt git repositoryban van, a szokásos Angular projekt struktúrával. A `.gitignore` tartalmazza a `node_modules/`, `dist/`, `.angular/` mappákat.

### ✅ Export utility script

**Fájl:** `export.js`

```javascript
// Automatizált projekt snapshot generátor
// Kizárja: node_modules, dist, .git, bináris fájlok
// Generálja: project-export.txt (teljes kódbázis szöveges formában)
```

Ez hasznos dokumentációhoz, code reviewhoz, vagy AI assisted fejlesztéshez.

### ✅ npm scripts (CI-ban futtatható)

```bash
npm ci             # Clean install (CI-ban)
npm run build      # Production build
npm run test       # Headless tesztek code coverage-el
ng lint            # Kód minőség ellenőrzés
```

---

## Összefoglaló

| Kategória                                                                    | Státusz             |
| ---------------------------------------------------------------------------- | ------------------- |
| Clean Code (KISS/DRY/YAGNI/SOLID/early return)                               | ✅                  |
| OOP öröklés + Discriminated Union                                            | ✅                  |
| SSR + platform-aware kód                                                     | ✅                  |
| Szoftvertervezési minták (Redux, Observer, Strategy, Singleton)              | ✅                  |
| Teljes körű hibakezelés (API, UI, WebSocket)                                 | ✅                  |
| TypeScript (Utility types, Generics, Type guards, Narrowing, Dynamic import) | ✅                  |
| CSS (Tailwind flex/grid, responsive, animáció, pseudo-class)                 | ✅                  |
| Reactive Forms + validáció                                                   | ✅                  |
| BroadcastChannel + postMessage + localStorage sync                           | ✅                  |
| WebSocket (Socket.io) real-time                                              | ✅                  |
| NgRx state management (actions/effects/reducers/selectors)                   | ✅                  |
| Angular guards, interceptors, signals, zoneless, OnPush                      | ✅                  |
| Route lazy loading + code splitting + tree shaking                           | ✅                  |
| SEO (meta, OG, Twitter, canonical, JSON-LD, robots, sitemap)                 | ✅                  |
| GTM analytics + egyedi kosárba rakás esemény                                 | ✅                  |
| Accessibility (aria, semantic HTML, label, focus)                            | ✅                  |
| JWT + Keycloak SSO dual auth                                                 | ✅                  |
| Unit tesztek (Jasmine/Karma, mock, dispatch, template)                       | ✅                  |
| NgRx DevTools, angular.json konfig                                           | ✅                  |
| Mixin (TypeScript interface composition)                                     | ⚠️ Részleges        |
| Virtual Scroll                                                               | ⚠️ Nem implementált |
| i18n                                                                         | ⚠️ Nem implementált |
| GDPR cookie consent                                                          | ⚠️ Nem implementált |
| Storybook / Bundle analyzer                                                  | ⚠️ Nem implementált |

---

_Dokumentáció generálva: 2026-03-15_
