import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8089",
  realm: "voxflow-realm",
  clientId: "voxflow-ui",
});

export default keycloak;