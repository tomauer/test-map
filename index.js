import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {register} from 'ol/proj/proj4';
import proj4 from 'proj4';
import {get as getProjection} from 'ol/proj';
import {getCenter} from 'ol/extent';
import MVT from 'ol/format/MVT';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import {Fill, Icon, Stroke, Style, Text} from 'ol/style';
import {applyStyle} from 'ol-mapbox-style';
import stylefunction from 'ol-mapbox-style/dist/stylefunction';

proj4.defs('EPSG:199999', '+proj=laea +lon_0=-80.86 +lat_0=14.88 +datum=WGS84 +units=m +no_defs');
proj4.defs('ESRI:54009', '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' +
    '+units=m +no_defs');
//proj4.defs('ESRI:54012', '+proj=eck4 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs')
register(proj4);

var proj54009 = getProjection('ESRI:54009');
proj54009.setExtent([-18e6, -9e6, 18e6, 9e6]);

var proj102001 = getProjection('EPSG:199999');
proj102001.setExtent([-9303637, -8338295, 7694955, 7838189]);


var key = 'pk.eyJ1IjoidGhlc2t1YSIsImEiOiJjaXpvdWtoZ3UwMDVmMzJueDl2cWp6NHdnIn0.3T9kAApG2hnV6NCVWxVDbA';

var countStyle = new Style({
  fill: new Fill({
    color: '#666',
    opacity: 0.4
  })
});

var style = 'https://api.mapbox.com/styles/v1/theskua/ckb9o174m07p61is0tjzhvtsc.html?fresh=true&title=view&access_token=' + key


const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })  
  ],
  view: new View({
    projection: 'ESRI:54009', 
    center: [-8277374.267578123, 3555690.7653808603],
    zoom: 4
  })
});

var layer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    attributions: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
      '© <a href="https://www.openstreetmap.org/copyright">' +
      'OpenStreetMap contributors</a>',
    format: new MVT(),
    url: 'https://{a-d}.tiles.mapbox.com/v4/theskua.c5v8960k/' +
        '{z}/{x}/{y}.vector.pbf?access_token=' + key
  }),
  style: countStyle,
  opacity: 0.7
})

map.addLayer(layer)

let styleUrl = require('./data/style.json');
let style2Url = require('./data/style2.json');

stylefunction(layer, styleUrl, "erd202004-27km-poly-moll-fixed");


var baseLayerSelect = document.getElementById('base-layer');

baseLayerSelect.onchange = function() {

  if (baseLayerSelect.value == "style") {
    stylefunction(layer, styleUrl, "erd202004-27km-poly-moll-fixed");
  } else {
    stylefunction(layer, style2Url, "erd202004-27km-poly-moll-fixed");
  }
};

var info = $('#info');
info.tooltip({
  animation: false,
  trigger: 'manual'
});

var displayFeatureInfo = function(pixel) {
  info.css({
    left: pixel[0] + 'px',
    top: (pixel[1] - 15) + 'px'
  });
  var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
    return feature;
  });

  if (feature) {
    info.tooltip('hide')
      .attr('data-original-title', 'Count: ' + feature.get('count') + " " + 'Change: ' + feature.get('diff').toFixed(2))
      .tooltip('fixTitle')
      .tooltip('show');
  } else {
    info.tooltip('hide');
  }
};

map.on('pointermove', function(evt) {
  //console.log(evt)

  if (evt.dragging) {
    info.tooltip('hide');
    return;
  }
  displayFeatureInfo(map.getEventPixel(evt.originalEvent));
});
