import Feature from 'ol/Feature';
import Geolocation from 'ol/Geolocation';
import Map from 'ol/Map';
import Point from 'ol/geom/Point';
import View from 'ol/View';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import { fromLonLat } from 'ol/proj';
import { Circle } from 'ol/geom';
import { intersects } from 'ol/extent';

const view = new View({
  center: fromLonLat([-0.4587700, 46.3221100]),
  zoom: 19,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: view
});

const geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

function el(id) {
  return document.getElementById(id);
}

el('track').addEventListener('change', function () {
  geolocation.setTracking(this.checked);
});

// update the HTML page when the position changes.
geolocation.on('change', function () {
  el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
  el('altitude').innerText = geolocation.getAltitude() + ' [m]';
  el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
  el('heading').innerText = geolocation.getHeading() + ' [rad]';
  el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
});

// handle geolocation error.
geolocation.on('error', function (error) {
  const info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#ee0000',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);

const coordinates = fromLonLat([-0.458654, 46.322057]);
positionFeature.setGeometry(new Point(coordinates));

let points = []
let radius = 5

let urlposition = "http://192.168.103.88:8081/geoserver/geogo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geogo%3Aressource&maxFeatures=50&outputFormat=application%2Fjson"

let circles = []

fetch(urlposition).then((response) => response.json()).then((data) => {
  for(let feature in data.features){
    let point = new Feature()
    let coord = fromLonLat(data.features[feature].geometry.coordinates)
    point.setGeometry(new Point(coord))
    point.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      })
    )

    let circle = new Circle(coord, 10)
    let circleFeature = new Feature(circle)

    let circleToStore = {coord: coord, radius: radius, circle: circle, circleFeature: circleFeature, point: point}

    points.push(point)
    points.push(circleFeature)
    circles.push(circleToStore)
  }
  

  window.setInterval(function(){
    for(let circle in circles){
      circles[circle]["radius"] +=5
      circles[circle]["circleFeature"].setGeometry(new Circle(circles[circle]["coord"], circles[circle]["radius"]))

      let intersect = circles[circle]["circleFeature"].getGeometry().intersectsCoordinate(positionFeature.getGeometry().flatCoordinates);
      if (intersect){
        console.log("youpi")

        circles.filter(function(ele){ 
            return ele != circle;
        });
      }
    }
  }, 1000);
}).then(() => {
  let features = points.concat([positionFeature])
  
  new VectorLayer({
    map: map,
    source: new VectorSource({
      features: features,
    }),
  });
});
