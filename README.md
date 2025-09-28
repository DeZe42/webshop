# Webshop

## Verzió

0.0.0

---

## Követelmények

- Node.js (ajánlott legfrissebb LTS)
- npm vagy yarn
- Angular CLI 20.x

---

## Telepítés

git clone <repository-url>
cd webshop
npm install

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
