export const environment = {
  production: false,
  siteUrl: 'http://localhost:4200',
  apiUrl: 'http://localhost:3000',
  useKeycloak: true, // Ha Keycloak-ot is használni akarod
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'myRealm',
    clientId: 'angular-app',
  },
};
