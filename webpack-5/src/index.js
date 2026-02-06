import {
  Viewer,
  Cartesian3,
  Math,
  Terrain,
  createOsmBuildingsAsync,
  Cesium3DTileset
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./css/main.css";

// CesiumJS has a default access token built in but it's not meant for active use.
// please set your own access token can be found at: https://cesium.com/ion/tokens.
// Ion.defaultAccessToken = "YOUR TOKEN HERE";

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
  terrain: undefined,//Terrain.fromWorldTerrain(),
});

try {
  const tileset = await Cesium3DTileset.fromUrl(
    "http://localhost:8080/output_francheville_batie/tileset.json"
  );
  
  viewer.scene.primitives.add(tileset);

  // Pour zoomer automatiquement sur ton modèle une fois chargé
  viewer.zoomTo(tileset);
} catch (error) {
  console.log(`Erreur lors du chargement du tileset: ${error}`);
}
// // Fly the camera to San Francisco at the given longitude, latitude, and height.
// viewer.camera.flyTo({
//   destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
//   orientation: {
//     heading: 0.0,
//     pitch: Math.toRadians(-15.0),
//   },
// });
