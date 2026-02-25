import {
  Viewer,
  Cartesian3,
  Math,
  Terrain,
  createOsmBuildingsAsync,
  Cesium3DTileset,
  Cesium3DTileStyle,
  GeoJsonDataSource,
  Color,
  PolylinePipeline,
  ArcType,
  PolylineGlowMaterialProperty
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

viewer.scene.globe.depthTestAgainstTerrain = true;

const baseUrl = new URL("/", window.location.href);
const tilesetUrl = new URL(
  "output_francheville_batie/tileset.json",
  baseUrl
).toString();
const routesUrl = new URL(
  "output_francheville_batie/routes_bdtopo_francheville2.geojson",
  baseUrl
).toString();

let routes;
const routeNatureColors = {
  "Chemin": "#27ae60",
  "Escalier": "#8e44ad",
  "Rond-point": "#e67e22",
  "Route empierrée": "#95a5a6",
  "Route à 1 chaussée": "#3498db",
  "Route à 2 chaussées": "#e74c3c",
  "Sentier": "#16a085"
};
const defaultRouteColor = "#f1c40f";

const getEntityValue = (entity, key) => {
  const value = entity?.properties?.[key]?.getValue?.(viewer.clock.currentTime);
  return typeof value === "string" ? value.trim() : value;
};

const applyRouteStyles = (dataSource, options) => {
  if (!dataSource) {
    return;
  }

  const { useNatureColors } = options;

  dataSource.entities.values.forEach((entity) => {
    if (!entity.polyline) {
      return;
    }

    const positions = entity.polyline.positions?.getValue(
      viewer.clock.currentTime
    );
    if (positions && positions.length > 1) {
      const densifiedPositions = PolylinePipeline.generateArc({
        positions,
        granularity: Math.toRadians(0.0005),
        arcType: ArcType.GEODESIC
      });
      entity.polyline.positions = Cartesian3.unpackArray(densifiedPositions);
    }

    const natureValue = getEntityValue(entity, "NATURE");
    const natureColor = routeNatureColors[natureValue] || defaultRouteColor;
    const selectedColor = useNatureColors ? natureColor : defaultRouteColor;
    const color = Color.fromCssColorString(selectedColor);

    entity.polyline.width = 2;
    entity.polyline.material = color;
    entity.polyline.clampToGround = true;
  });
};

try {
  const tileset = await Cesium3DTileset.fromUrl(tilesetUrl);
  
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

try {
  const routesResponse = await fetch(routesUrl);
  const routesGeojson = await routesResponse.json();
  routes = await GeoJsonDataSource.load(routesGeojson, {
    clampToGround: true
  });

  viewer.dataSources.add(routes);

  const routeStyleOptions = {
    useNatureColors: true
  };

  applyRouteStyles(routes, routeStyleOptions);

  const toggleRoutes = document.getElementById("toggleRoutes");
  const toggleRoutesNature = document.getElementById("toggleRoutesNature");
  if (toggleRoutes) {
    toggleRoutes.checked = true;
    toggleRoutes.addEventListener("change", (event) => {
      routes.show = event.target.checked;
    });
  }

  if (toggleRoutesNature) {
    toggleRoutesNature.checked = routeStyleOptions.useNatureColors;
    toggleRoutesNature.addEventListener("change", (event) => {
      routeStyleOptions.useNatureColors = event.target.checked;
      routes.show = event.target.checked;
    });
  }
} catch (error) {
  console.log(`Erreur lors du chargement des routes: ${error}`);
}
// // Fly the camera to San Francisco at the given longitude, latitude, and height.
// viewer.camera.flyTo({
//   destination: Cartesian3.fromDegrees(-122.4175, 37.655, 400),
//   orientation: {
//     heading: 0.0,
//     pitch: Math.toRadians(-15.0),
//   },
// });
