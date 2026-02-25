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
  PolylineGlowMaterialProperty,
  HeightReference
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
const vegetationUrl = new URL(
  "output_francheville_batie/bdtopo_zonevegetation2.geojson",
  baseUrl
).toString();
const communeUrl = new URL(
  "output_francheville_batie/francheville.geojson",
  baseUrl
).toString();

let routes;
let vegetation;
let tileset;
let commune;
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

const vegetationNatureColors = {
  "Bois": "#27ae60",
  "Haie": "#16a085",
  "Forêt fermée de feuillus": "#1e8449",
  "Lande ligneuse": "#82e0aa"
};
const defaultVegetationColor = "#27ae60";

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
  tileset = await Cesium3DTileset.fromUrl(tilesetUrl);
  
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

  const toggleBati = document.getElementById("toggleBati");
  const legendBati = document.getElementById("legend-bati");
  if (toggleBati) {
    toggleBati.checked = true;
    toggleBati.addEventListener("change", (event) => {
      tileset.show = event.target.checked;
      // Afficher/masquer la section de légende correspondante
      if (legendBati) {
        legendBati.classList.toggle("hidden", !event.target.checked);
      }
    });
  }

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
  const legendRoutes = document.getElementById("legend-routes");
  if (toggleRoutes) {
    toggleRoutes.checked = true;
    toggleRoutes.addEventListener("change", (event) => {
      routes.show = event.target.checked;
      // Afficher/masquer la section de légende correspondante
      if (legendRoutes) {
        legendRoutes.classList.toggle("hidden", !event.target.checked);
      }
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

try {
  const vegetationResponse = await fetch(vegetationUrl);
  const vegetationGeojson = await vegetationResponse.json();
  vegetation = await GeoJsonDataSource.load(vegetationGeojson, {
    clampToGround: true
  });

  viewer.dataSources.add(vegetation);

  vegetation.entities.values.forEach((entity) => {
    if (entity.polygon) {
      const natureValue = getEntityValue(entity, "NATURE");
      const vegetationColor = vegetationNatureColors[natureValue] || defaultVegetationColor;
      const color = Color.fromCssColorString(vegetationColor);
      
      entity.polygon.material = color.withAlpha(0.4);
      entity.polygon.outline = true;
      entity.polygon.outlineColor = color.withAlpha(0.8);
      entity.polygon.outlineWidth = 1;
    }
  });

  const toggleVegetation = document.getElementById("toggleVegetation");
  const legendVegetation = document.getElementById("legend-vegetation");
  if (toggleVegetation) {
    toggleVegetation.checked = true;
    toggleVegetation.addEventListener("change", (event) => {
      vegetation.show = event.target.checked;
      // Afficher/masquer la section de légende correspondante
      if (legendVegetation) {
        legendVegetation.classList.toggle("hidden", !event.target.checked);
      }
    });
  }
} catch (error) {
  console.log(`Erreur lors du chargement de la végétation: ${error}`);
}

try {
  const communeResponse = await fetch(communeUrl);
  const communeGeojson = await communeResponse.json();
  commune = await GeoJsonDataSource.load(communeGeojson, {
    clampToGround: true
  });

  viewer.dataSources.add(commune);

  commune.entities.values.forEach((entity) => {
    if (entity.polygon) {
      // Masquer le polygone et son contour
      entity.polygon.show = false;
      
      // Créer des polylines pour les contours qui suivent le relief
      const hierarchy = entity.polygon.hierarchy.getValue();
      if (hierarchy && hierarchy.positions) {
        const positions = hierarchy.positions;
        
        // Créer une polyline pour le contour externe
        commune.entities.add({
          polyline: {
            positions: [...positions, positions[0]], // Fermer le contour
            width: 3,
            material: Color.BLACK,
            clampToGround: true
          }
        });
      }
    }
  });

  const toggleCommune = document.getElementById("toggleCommune");
  if (toggleCommune) {
    toggleCommune.checked = true;
    toggleCommune.addEventListener("change", (event) => {
      commune.show = event.target.checked;
    });
  }
} catch (error) {
  console.log(`Erreur lors du chargement de la commune: ${error}`);
}

// Gestion du bouton de collapse du panel de contrôle
const toggleLayerPanelBtn = document.getElementById("toggleLayerPanel");
const layerControlPanel = document.getElementById("layerControl");

if (toggleLayerPanelBtn && layerControlPanel) {
  toggleLayerPanelBtn.addEventListener("click", () => {
    layerControlPanel.classList.toggle("collapsed");
    toggleLayerPanelBtn.textContent = layerControlPanel.classList.contains("collapsed") ? "+" : "−";
  });
}
