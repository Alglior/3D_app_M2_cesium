# Application 3D de Visualisation du Bâti - Francheville

## Description du Projet

Cette application web interactive permet de visualiser en 3D le bâti de la commune de Francheville à l'aide de CesiumJS. Les données sont présentées sous forme de tuiles 3D (3D Tiles) au format Cesium avec une colorisation thématique basée sur l'usage des bâtiments.

## Objectifs

- Visualiser le bâti en 3D sur un globe virtuel
- Différencier visuellement les bâtiments selon leur usage
- Offrir une interface interactive pour explorer les données urbaines
- Fournir une légende claire pour faciliter la lecture de la carte

## Méthodologie de Traitement des Données

### Workflow FME - Traitement du Bâti

![Workflow FME](script_FME.png)

Le traitement des données du bâti s'effectue en plusieurs étapes via FME (Feature Manipulation Engine) :

#### 1. **Extraction des Surfaces**
- **RoofSurface** : Extraction des surfaces de toit (3255 features)
- **GroundSurface** : Extraction des surfaces au sol (1058 features)
- **WallSurface** : Extraction des murs (4 features)

Ces surfaces proviennent de modèles CityGML qui décrivent la géométrie 3D des bâtiments.

#### 2. **Reprojection**
Les données sont reprojetées dans le système de coordonnées approprié pour assurer la cohérence spatiale avec le globe Cesium.

#### 3. **Jointure Spatiale (SpatialFilter)**
Un filtre spatial permet d'associer les surfaces de bâtiments avec les données attributaires du bâti (6250 features en entrée, 6365 features après traitement). Cette étape permet de :
- Identifier les bâtiments présents dans la zone d'étude
- Filtrer les données selon des critères géographiques
- Séparer les features acceptées, rejetées et en attente

#### 4. **FeatureJoiner**
Cette étape cruciale joint les géométries 3D avec les attributs sémantiques des bâtiments provenants de la BD TOPO de l'IGN, notamment :
- **USAGE1** : Usage principal du bâtiment (Résidentiel, Commercial, Industriel, etc.)
- Autres attributs métier

Le script produit :
- **Joined** : Bâtiments avec attributs associés (69296 features)
- **Unjoined** : Entités non appariées (5365 features)

#### 5. **AppearanceRemover**
Suppression des apparences d'origine des modèles CityGML pour permettre une stylisation personnalisée basée sur les attributs.

#### 6. **Offsetter**
Ajustement de l'altitude des bâtiments pour garantir un positionnement correct sur le terrain.

#### 7. **Export en 3D Tiles**
Les données sont finalement exportées au format Cesium 3D Tiles (65661 features) pour une visualisation optimisée dans CesiumJS.

### Workflow QGIS - Traitement des Routes

La couche de routes provient de la BD TOPO.

Le traitement a ete realise dans QGIS avec les etapes suivantes :

1. **Selection de la couche routes** depuis la BD TOPO.
2. **Intersection** avec les limites communales de Francheville.
3. **Export** du resultat en **GeoJSON** en 4326 pour integration dans CesiumJS.

### Workflow QGIS - Traitement de la Végétation

La couche de végétation provient également de la BD TOPO.

Le traitement suit les mêmes étapes que pour les routes :

1. **Selection de la couche zones de végétation** depuis la BD TOPO.
2. **Intersection** avec les limites communales de Francheville.
3. **Export** du resultat en **GeoJSON** en 4326 pour integration dans CesiumJS.

### Traitement des Limites Communales

La couche des limites communales de Francheville provient de la BD TOPO (COMMUNE).

Le traitement réalisé :

1. **Sélection de la commune** de Francheville (INSEE: 69089) depuis la couche COMMUNE de la BD TOPO.
2. **Export** en **GeoJSON** en 4326 pour utilisation dans l'application.

Cette couche contient les informations administratives suivantes :
- **Code INSEE** : 69089
- **Population** : 15 664 habitants
- **Superficie cadastrale** : 820 hectares
- **Code postal** : 69340
- **SIREN** : 216900894


## Représentation du Bâti sur la Carte

### Choix de Colorisation

Nous avons choisi de représenter les bâtiments avec une **colorisation thématique basée sur l'attribut USAGE1**. Ce choix offre plusieurs avantages :

#### Pourquoi cette représentation ?

1. **Lisibilité Urbaine** : Les différentes couleurs permettent d'identifier instantanément la fonction d'un quartier (résidentiel, commercial, industriel).

2. **Analyse Spatiale** : Cette visualisation facilite l'analyse de la répartition des usages sur le territoire :
   - Identification des zones monofonctionnelles
   - Détection des zones mixtes
   - Compréhension de l'organisation urbaine

3. **Communication** : La carte devient un outil de communication efficace pour :
   - Les urbanistes et aménageurs
   - Les élus municipaux
   - Le grand public

4. **Différenciation Visuelle** : Chaque usage dispose d'une couleur distinctive :
   - **Résidentiel** (#3498db) - Bleu : zones d'habitation
   - **Industriel** (#e74c3c) - Rouge : sites de production
   - **Commercial** (#f39c12) - Orange : commerces et services
   - **Agricole** (#27ae60) - Vert : bâtiments agricoles
   - **Religieux** (#9b59b6) - Violet : édifices religieux
   - **Sportif** (#1abc9c) - Turquoise : équipements sportifs
   - **Annexe** (#95a5a6) - Gris : dépendances
   - **Non défini** (#bdc3c7) - Gris clair : usage inconnu

### Code de Stylisation (Cesium3DTileStyle)

```javascript
tileset.style = new Cesium3DTileStyle({
  color: {
    conditions: [
      ["${USAGE1} === 'Résidentiel'", "color('#3498db')"],
      ["${USAGE1} === 'Industriel'", "color('#e74c3c')"],
      ["${USAGE1} === 'Commercial'", "color('#f39c12')"],
      ["${USAGE1} === 'Agricole'", "color('#27ae60')"],
      ["${USAGE1} === 'Religieux'", "color('#9b59b6')"],
      ["${USAGE1} === 'Sportif'", "color('#1abc9c')"],
      ["${USAGE1} === 'Annexe'", "color('#95a5a6')"],
      ["${USAGE1} === null", "color('#bdc3c7')"],
      ["true", "color('#ff0000')"]
    ]
  }
});
```

Cette approche par conditions permet une grande flexibilité et peut être facilement adaptée pour d'autres critères de visualisation (hauteur, année de construction, état du bâti, etc.).

## Représentation des Routes sur la Carte

### Choix de Colorisation

Les routes sont représentées avec une **colorisation thématique basée sur l'attribut NATURE** de la BD TOPO. Cette visualisation permet de distinguer les différents types de voies.

#### Pourquoi cette représentation ?

1. **Hiérarchie des Voies** : Les couleurs différenciées permettent d'identifier rapidement la hiérarchie du réseau routier.

2. **Navigation** : Facilite la compréhension de l'accessibilité et de la structure du réseau viaire.

3. **Différenciation Visuelle** : Chaque type de route dispose d'une couleur distinctive :
   - **Chemin** (#27ae60) - Vert : chemins non revêtus
   - **Escalier** (#8e44ad) - Violet : escaliers publics
   - **Rond-point** (#e67e22) - Orange : giratoires
   - **Route empierrée** (#95a5a6) - Gris : routes empierrées
   - **Route à 1 chaussée** (#3498db) - Bleu : routes simples
   - **Route à 2 chaussées** (#e74c3c) - Rouge : routes à chaussées séparées
   - **Sentier** (#16a085) - Turquoise : sentiers piétons

### Caractéristiques Techniques

- **Largeur** : 2 pixels
- **clampToGround** : Les routes s'adaptent au relief du terrain
- **Densification** : Les polylignes sont densifiées pour mieux épouser le terrain (granularité 0.0005 radians)

## Représentation de la Végétation sur la Carte

### Choix de Colorisation

Les zones de végétation sont représentées avec une **colorisation thématique basée sur l'attribut NATURE** de la BD TOPO. Les polygones sont semi-transparents pour ne pas masquer le bâti.

#### Pourquoi cette représentation ?

1. **Patrimoine Naturel** : Visualisation des espaces verts et boisés de la commune.

2. **Analyse Environnementale** : Identification des différents types de couverture végétale.

3. **Différenciation Visuelle** : Chaque type de végétation dispose d'une couleur distinctive :
   - **Bois** (#27ae60) - Vert : boisements
   - **Haie** (#16a085) - Turquoise : haies
   - **Forêt fermée de feuillus** (#1e8449) - Vert foncé : forêts denses
   - **Lande ligneuse** (#82e0aa) - Vert clair : landes arbustives

### Caractéristiques Techniques

- **Transparence** : 40% (alpha 0.4) pour ne pas masquer le bâti
- **Contour** : Oui, avec la même couleur mais plus opaque (alpha 0.8)
- **clampToGround** : Les polygones s'adaptent au relief du terrain

## Représentation des Limites Communales

La limite communale de Francheville peut être utilisée comme couche de référence géographique pour :

1. **Délimitation du Territoire** : Visualisation claire de l'emprise communale
2. **Contexte Géographique** : Référence pour situer les différentes couches de données
3. **Zone d'Étude** : Utilisée pour l'intersection spatiale lors du traitement des données SIG

### Informations de la Commune

- **Nom** : Francheville
- **Code INSEE** : 69089
- **Population** : 15 664 habitants (recensement INSEE)
- **Superficie** : 820 hectares
- **Code postal** : 69340
- **Département** : Rhône (69)
- **Région** : Auvergne-Rhône-Alpes (84)

## Installation

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation des dépendances

```bash
cd webpack-5
npm install
```

## Lancement de l'Application

### Démarrer le serveur de développement

```bash
npm start
```

L'application sera accessible à l'adresse : `http://localhost:8080`

## Structure du Projet

```
webpack-5/
├── public/
│   ├── francheville_comm.geojson          # Limites communales
│   └── output_francheville_batie/         # Tuiles 3D du bâti
│       ├── tileset.json                   # Index des tuiles
│       ├── routes_bdtopo_francheville2.geojson  # Routes (BD TOPO, QGIS -> GeoJSON)
│       ├── bdtopo_zonevegetation2.geojson       # Végétation (BD TOPO, QGIS -> GeoJSON)
│       └── data/                          # Fichiers .b3dm
├── src/
│   ├── index.html                         # Page HTML principale
│   ├── index.js                           # Code JavaScript Cesium
│   └── css/
│       └── main.css                       # Styles CSS
├── package.json                           # Dépendances npm
└── webpack.config.js                      # Configuration Webpack
```

## Fonctionnalités Interactives

### Légende Interactive

L'application propose une légende interactive permettant de contrôler l'affichage des différentes couches :

- **Toggle Bâti 3D** : Afficher/masquer le modèle 3D des bâtiments
- **Toggle Routes** : Afficher/masquer la couche des routes
- **Toggle Nature Routes** : Masque également les routes lorsque désactivé
- **Toggle Végétation** : Afficher/masquer les zones de végétation

La légende est positionnée à gauche de l'écran avec un défilement vertical pour s'adapter à toutes les tailles d'écran.

## Technologies Utilisées

- **CesiumJS** : Bibliothèque de visualisation 3D géospatiale
- **Webpack** : Bundler de modules JavaScript
- **FME** : Outil de transformation de données géospatiales
- **3D Tiles** : Format de tuiles 3D pour la visualisation performante

## Données Source

- Format d'origine : CityGML
- Système de coordonnées : 4326
- Couverture : Commune de Francheville
- Attributs : USAGE1, géométries 3D (toits, murs, sols)

## Auteurs

VALENTIN Paul ; 
HERMAN Nicolas ; 
THIBAUDON Arthur