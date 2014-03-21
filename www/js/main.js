//global variables
//Defining Web service from Cloudmade and specifying API key
var qqq;
var baseMapLayerURL = 'http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png';
var baseMapLayerAttribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
var baseMaps;
var overlayMaps;
var polygonZoning;
var choropleth;
var incidentsMarkers;
var zoneMarkers;
var densityMarkers;
var config;
var info = L.control();
//begin script when window loads
window.onload = initialize(); //->

var map; //map object


//the first function called once the html is loaded
function initialize() {
  setMap();
};

function style(feature) {
  return {
    fillColor: getColor(feature.properties.Pop2010),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.5
  };
}


function getColor(d) {
  return d > 8000 ? '#800026' :
    d > 5000 ? '#BD0026' :
    d > 1000 ? '#E31A1C' :
    d > 400 ? '#FC4E2A' :
    d > 300 ? '#FD8D3C' :
    d > 200 ? '#FEB24C' :
    d > 100 ? '#FED976' :
    '#FFEDA0';
}

function highlightFeature(e) {

  var layer = e.target;
  info.update(layer.feature.properties.Pop2010);

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  choropleth.resetStyle(e.target);
  info.update();
}


function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

//set basemap parameters
function setMap() {
  var baseMapLayer = L.tileLayer(baseMapLayerURL, {
    key: '8bc33f0d529540bbbc631f1ae3705abd',
    styleId: 998,
    attribution: baseMapLayerAttribution
  });

  var midnight = L.tileLayer(baseMapLayerURL, {
    key: '8bc33f0d529540bbbc631f1ae3705abd',
    styleId: 999,
    attribution: baseMapLayerAttribution
  });

  var chrono = L.tileLayer(baseMapLayerURL, {
    key: '8bc33f0d529540bbbc631f1ae3705abd',
    styleId: 22677,
    attribution: baseMapLayerAttribution
  });



  //Setting map with default baseMapLayer and it's coordinate
  map = L.map('map', {
    center: new L.LatLng(1.355312,103.827068),
    zoom: 11,
    layers: [baseMapLayer]
  });

  map.spin(true);

  var geoJsonLayer;
  var densityLayer;
  var markerList = [];

  //Custom Control for Info panel

  info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function(props) {
    this._div.innerHTML = '<h4>Traffic Congestion</h4>' + (props ?
      '<b>' + props + '</b><br />' + props + ' people ' : 'Hover over a state');
  };
  info.addTo(map);

  $.ajax({
    url:"http://localhost:8080/LTA/TrafficIncidents",
      type:'GET',
      crossDomain : true,
        dataType:'json'
  }).done(function(jsonArray){
	  var features = [];
    $.each(jsonArray,function(index,element){
      $.each(element,function(index,element){
        qqq=element;
        
        // Create coordinate data
        var coordinate = [element.long, element.lat];
        
        // Create the geometry data
        var geometry = {"type":"Point", "coordinates":coordinate};
        
        // Create the properties data
        var properties = {"incidentId":element.incidentId,
        		"incidentType":element.type,
        		"description":element.description};
        
        // Create the jsonObject
        var jsonObj = {"type":"Feature",
        		"geometry":geometry,
        		"properties":properties};
        
        // Push to JSONList
        features.push(jsonObj);
      });
    });
    
    // Create GeoJSON Object
    var geoJson = {"type":"FeatureCollection",
    	"features":features};
    
    console.log(geoJson);
    
    // Map geoJson
    var incidentLayer = L.geoJson(geoJson, {
    	onEachFeature: function(feature, layer) {
        layer.on('mouseover', function(e) {
            e.target.bindPopup(feature.properties.description).openPopup();
          });
        }
    });
    
    // Marker Cluster
    var incidentLayerCluster = new L.MarkerClusterGroup();
    incidentLayerCluster.addLayer(incidentLayer);
    map.addLayer(incidentLayerCluster);
    
    // Added road section
    var roadSectionLine = L.geoJson(null, {
    	style: function (feature) {
    		return {
    			color: "#000", weight: 2, opacity: 1
    		};
    	}
    });
    // Add road shapefile
    $.getJSON("data/RoadSectionLine.geojson", function (data) {
    	roadSectionLine.addData(data);
    	roadSectionLine.addTo(map);
    	console.log(data);
    });
    
    //Layergroup control for basemap 
    baseMaps = {
      "Basemap": baseMapLayer,
      "Chronomap": chrono,
      "Night View": midnight
    };

    //Layergroup control for additional layer (incidents points)
    overlayMaps = {
      "Incidents": incidentLayerCluster,
      "Road Section": roadSectionLine
      // "Population Density": densityLayer
    };
    
    L.control.layers(baseMaps, overlayMaps).addTo(map);
    
    map.spin(false);
  }).fail(function(data){
    console.log(data);
    map.spin(false);
  });

}; //End of setup()

function createLegend() {
  var legend = L.control({
    position: 'bottomright'
  });

  legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
      incidents = [0, 100, 200, 300, 400, 1000, 5000, 8000],
      labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < incidents.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(incidents[i] + 1) + '"></i> ' +
        incidents[i] + (incidents[i + 1] ? '&ndash;' + incidents[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(map);
}

function choropleth() {
  var choroplethLayer;
  $.getJSON("data/population_density.geojson", function(data) {
    polygonZoning = L.geoJson(data, {
      style: function(feature) {
        return {
          color: '#888888',
        };
      },
      onEachFeature: function(feature, layer) {
        layer.on('mouseover', function(e) {
          e.target.bindPopup(feature.properties.name).openPopup();
        });
      }
    }).addTo(map);

  });

   map.on('mouseover', function(e) {
     console.log(e)
   });
   console.log(polygonZoning);
   var temp = overlayMaps;
   overlayMaps = {
     "Incidents": temp.Incidents,
     "Zone": polygonZoning
   }
   console.log(overlayMaps);
}

function infoPanel() {
  //Custom Control for Info panel
  var info = L.control();
  info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function(props) {
    this._div.innerHTML = '<h4>SAN FRANSICO Crime</h4>' + (props ?
      '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>' : 'Hover over a state');
  };

  info.addTo(map);
  //End of Custom Control
}

//Mouseclick Event
// map.on('click', function(e) {
//   console.log(e.target);
//   // alert(e.latlng); // e is an event object (MouseEvent in this case)
//   //   popup
//   // .setLatLng(e.latlng)
//   // .setContent(popup.setContent("as"))
//   // .openOn(map);
// });

// function setupStyle() {

//   // var myLines;
//   var myLines = [{
//     "type": "LineString",
//     "coordinates": [
//       [-104.99404, 40],
//       [-105, 45],
//       [-110, 55]
//     ]
//   }, {
//     "type": "LineString",
//     "coordinates": [
//       [-105, 40],
//       [-110, 45],
//       [-115, 55]
//     ]
//   }];

//   var myStyle = {
//     "color": "#ff7800",
//     "weight": 5,
//     "opacity": 0.65
//   };

//   L.geoJson(myLines, {
//     style: myStyle
//   }).addTo(map);
// };

// var popup = L.popup();

// function onMapClick(e) {
//   popup
//     .setLatLng(e.latlng)
//     .setContent(popup.setContent("as"))
//     .openOn(map);
// }

// map.on('click', onMapClick);
