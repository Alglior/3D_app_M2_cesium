# Application 3D de Visualisation du Bâti - Francheville

## Description du Projet

Cette application web interactive permet de visualiser en 3D le bâti de la commune de Francheville à l'aide de CesiumJS. Les données sont présentées sous forme de tuiles 3D (3D Tiles) au format Cesium avec une colorisation thématique basée sur l'usage des bâtiments.

## Objectifs

Avec cette application, nous souhaitons visualiser l'utilisation du sol sur la commune de Francheville. Elle permet aux habitants, élus et chercheurs d'analyser les typologies de bâtiments en fonction de leur quartier, la disparité ou alors la concentration de bâtiments ayant la même fonction (résidence, commerciale...).
L'exploration de ces données en 3D, sur un globe virtuel, permet aux utilisateurs de reconnaître leur territoire, son relief et les problématiques qui y sont liés, ce qui facilite la lecture de la carte.

## Méthodologie de Traitement des Données

### Workflow FME - Traitement du Bâti

![Workflow FME](script_FME.png)

Le traitement des données du bâti s'effectue en plusieurs étapes. Pour les réaliser nous avons créé un script à partir d'un ETL, du logiciel FME (Feature Manipulation Engine) :

#### 1. **Extraction des Surfaces 3D des bâtiments**
Ces surfaces proviennent de modèles CityGML qui décrivent la géométrie 3D des bâtiments. Nous les avons téléchargées sur le site DataGrandLyon au lien suivant : https://data.grandlyon.com/portail/fr/jeux-de-donnees/maquettes-3d-texturees-2018-communes-metropole-lyon/donnees.

#### 2. **Reprojection**
Les données sont reprojetées en epsg 4326, nécessaire pour leur représentation sur notre site internet avec Césium.

#### 3. **Jointure Spatiale (SpatialFilter)**
Un filtre spatial permet d'associer les surfaces de bâtiments avec les données attributaires du bâti en 2D provenant de la BD TOPO de l'IGN. Accompagné de l'algorythme "FeatureJoiner", elle permet de récupérer les attributs provenants de cette base de donnée 2D, notamment l'usage des bâtiments (résidentiel, commercial, industriel...)

#### 4. **AppearanceRemover**
Nous avons choisi de supprimer les apparences d'origine des modèles CityGML. Cela nous permet de proposer une visualisation interactive plus légère tout en nous permettant de personnaliser le style des bâtiments à partir des attributs liés à l'usage des bâtiments.

#### 5. **Offsetter**
Ajustement de l'altitude des bâtiments pour garantir un positionnement correct sur le terrain.

#### 6. **Export en 3D Tiles**
Les données sont finalement réexportées au format Cesium 3D Tiles. En effet, une conversion préalable en 2D avait été nécessaire pour effectuer notre jointure attributaire.

### Workflow QGIS - Traitement des Routes

La couche de routes provient de la BD TOPO. Le traitement a ete realise dans QGIS avec les etapes suivantes :

1. **Selection de la couche routes** depuis la BD TOPO.
2. **Intersection** avec les limites communales de Francheville.
3. **Export** du resultat en **GeoJSON** en 4326 pour l'integration dans CesiumJS.

### Workflow QGIS - Traitement de la Végétation

La couche de végétation provient également de la BD TOPO. Le traitement suit les mêmes étapes que pour les routes :

1. **Selection de la couche zones de végétation** depuis la BD TOPO.
2. **Intersection** avec les limites communales de Francheville.
3. **Export** du resultat en **GeoJSON** en 4326 pour integration dans CesiumJS.

### Traitement des Limites Communales

La couche des limites communales de Francheville provient de la BD TOPO (COMMUNE). Le traitement réalisé :

1. **Sélection de la commune** de Francheville (INSEE: 69089) depuis la couche COMMUNE de la BD TOPO.
2. **Export** en **GeoJSON** en 4326 pour utilisation dans l'application.

## Représentation du Bâti sur la Carte

### Choix de Colorisation

Nous avons choisi de représenter les bâtiments avec une **colorisation thématique basée sur l'attribut USAGE1** qui correspond à l'usage principal pour chacun de ces bâtiments. Ce choix offre plusieurs avantages :

1. **Lisibilité Urbaine** : Les différentes couleurs permettent d'identifier instantanément la fonction d'un quartier (résidentiel, commercial, industriel).

2. **Analyse Spatiale** : Cette visualisation facilite l'analyse de la répartition des usages sur le territoire :
   - Identification des zones monofonctionnelles
   - Détection des zones mixtes
   - Compréhension de l'organisation urbaine

3. **Communication** : La carte devient un outil de communication efficace pour :
   - Les urbanistes et aménageurs
   - Les élus municipaux
   - Le grand public

## Représentation des Routes sur la Carte

### Choix de Colorisation

Les routes sont représentées avec une **colorisation thématique basée sur l'attribut NATURE** de la BD TOPO. Cette visualisation permet de distinguer les différents types de voies. L'affichage des routes permet de :

1. **Hiérarchiser les Voies** : Les couleurs différenciées permettent d'identifier rapidement la hiérarchie du réseau routier.

2. **Navigation** : Facilite la compréhension de l'accessibilité et de la structure du réseau viaire.

## Représentation de la Végétation sur la Carte

### Choix de Colorisation

Les zones de végétation sont représentées avec une **colorisation thématique basée sur l'attribut NATURE** de la BD TOPO, il correspond aux différents types de végétations possibles (forêt, haies...). Les polygones sont semi-transparents pour ne pas masquer le bâti et permettre à l'utilisateur de visualiser les détails présents sur la carte satellites présente dessous (même si celui-ci peut sélectionner ou déselectionner la couche). 

## Représentation des Limites Communales

Enfin, nous avons choisi d'ajouter les limites de la commune de Francheville pour ajouter de la clarter pour les utilisateurs et bien définir la zone d'intérêt de notre application.

## Mise en place de notre application

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

## Auteurs

VALENTIN Paul ; 
HERMAN Nicolas ; 
THIBAUDON Arthur