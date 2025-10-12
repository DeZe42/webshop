# Webshop

## Verzió

0.0.0

## Telepítés

npm install

---

## Tesztelés

npm run test

---

## Lint

npm run lint

---

## Ptrettier

npm run pretty-quick

---

## Használat local környezetben (keycloak OFF)

npm run build-dev
npm run serve:ssr:webshop

---

## Használat production környezetben (keycloak ON)

npm run build
npm run serve:ssr:webshop

---

## Docker keycloak run

docker run -d --name keycloak \
-p 8080:8080 \
-e KEYCLOAK_ADMIN=admin \
-e KEYCLOAK_ADMIN_PASSWORD=admin \
-v keycloak_data:/opt/keycloak/data \
quay.io/keycloak/keycloak:latest start-dev

docker start keycloak

docker stop keycloak

## 🧩 Design Decisions

### 1. Change Detection Strategy: OnPush

Az **OnPush** stratégiát minden komponensnél alapértelmezettként alkalmaztam, hogy csökkentsem a fölösleges DOM újrarendereléseket és optimalizáljam a teljesítményt.

- Az Angular alapértelmezett „Default” stratégiája minden esemény után futtatja a change detection ciklust az egész komponensfán.
- Az **OnPush** ezzel szemben csak akkor renderel, ha a bemenet (`@Input`), `signal`, vagy `Observable` új referenciát ad vissza.
- Ezzel az architektúra determinisztikusabb, a komponensek „pure”-ként viselkednek, így jobban tesztelhetők és memoizálhatók.

**Cél:** reaktív adatfolyamokra épülő, stabil UI, amely nagyobb lista- vagy állapotváltozások mellett is gyors marad.

---

### 2. Signals az Input bindinghoz

Az Angular **signals** API-ját használtam a klasszikus `@Input()` helyett ott, ahol a komponens állapota és az üzleti logika szorosan összefügg.

**Indoklás:**

- A `signal` típusú értékek automatikusan reaktívak, és **nem igényelnek async pipe-ot vagy subscription-t**.
- Könnyebb követni a **data flow-t**, mert minden függőség explicit.
- `computed()` és `effect()` segítségével a komponens deklaratívan reagál az állapotváltozásokra.
- Az `@Input()` alapú kommunikáció sok esetben referenciaváltozásra épül — a signals ehelyett **reaktív értékként** működik, ami pontosabb frissítéseket biztosít.

**Cél:** a komponensek közötti adatátadás egyszerűsítése és a boilerplate kód csökkentése (pl. `ngOnChanges`, `async` pipe elhagyható).

---

### 3. BroadcastChannel a tab-szintű szinkronizációhoz

A **Broadcast Channel API-t** választottam a `LocalStorageEvent` helyett a kosár (cart) és az auth state több böngészőfül közötti szinkronizálásához.

**Indoklás:**

- A `BroadcastChannel` natív böngésző API, amely lehetővé teszi az **azonos origin-en belüli aszinkron üzenetküldést** több tab között.
- A `localStorage` event csak `setItem`-re triggel, és nem továbbít komplex objektumokat (csak stringeket).
- A `BroadcastChannel` közvetlenül JSON objektumokat továbbít, és `message` eseményen keresztül hallgatható.
- Az API jól illeszkedik a **reaktív programozási modellhez** – a `CartSyncService` figyeli az üzeneteket és `signal`-lel frissíti az állapotot.

**Cél:** megbízható, valós idejű szinkronizáció a tabok között extra könyvtárak nélkül, tisztán böngésző API-val.

---

### 4. Összegzés

A fenti döntések együttesen támogatják a projekt fő célját:  
**reaktív, teljesítményorientált és jól tesztelhető Angular architektúra**, ami SSR-kompatibilis és hosszú távon karbantartható.
