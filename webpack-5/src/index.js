import {
  Viewer,
  Cartesian3,
  Math,
  Terrain,
  createOsmBuildingsAsync,
  Cesium3DTileset,
  Cesium3DTileStyle
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./css/main.css";

// CesiumJS has a default access token built in but it's not meant for active use.
// please set your own access token can be found at: https://cesium.com/ion/tokens.
// Ion.defaultAccessToken = "YOUR TOKEN HERE";

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
  terrain: Terrain.fromWorldTerrain(),
});

try {
  const tileset = await Cesium3DTileset.fromUrl(
    "http://localhost:8080/output_francheville_batie/tileset.json"
  );
  
  viewer.scene.primitives.add(tileset);

  // Appliquer un style basé sur USAGE1
  tileset.style = new Cesium3DTileStyle({
    color: {
      conditions: [
        ["${USAGE1} === 'Résidentiel'", "color('#3498db')"],  // Bleu
        ["${USAGE1} === 'Industriel'", "color('#e74c3c')"],   // Rouge
        ["${USAGE1} === 'Commercial'", "color('#f39c12')"],    // Orange
        ["${USAGE1} === 'Agricole'", "color('#27ae60')"],      // Vert
        ["${USAGE1} === 'Religieux'", "color('#9b59b6')"],     // Violet
        ["${USAGE1} === 'Sportif'", "color('#1abc9c')"],       // Turquoise
        ["${USAGE1} === 'uel'", "color('#e67e22')"],           // Orange foncé
        ["${USAGE1} === 'Annexe'", "color('#95a5a6')"],        // Gris
        ["${USAGE1} === null", "color('#bdc3c7')"],            // Gris clair pour valeurs nulles
        ["true", "color('#ff0000')"]                           // Gris foncé par défaut
      ]
    }
  });

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
