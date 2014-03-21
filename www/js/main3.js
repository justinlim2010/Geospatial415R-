//global variables
//Defining Web service from Cloudmade and specifying API key
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

function setMap() {
  $.ajax({
    url: "http://datamall.mytransport.sg/ltaodataservice.svc/IncidentSet?callback=?",
    username: "69805977-2bfd-47c6-873e-88fadd92c06a",
    password: "JeS9FEbhVVVni7Mzu6HS4A==",
    jsonpCallback: 'jsonCallback',
    // contentType: 'text/xml; charset=\'utf-8\'',
    // async:false,
    dataType: 'jsonp',
    // jsonp:false,
    contentType: 'text/plain',
    crossDomain:true,
    success:function(response){
      console.log("response");
      console.log($(response));
    },
    error:function(xhr, ajaxOptions, thrownError){
      console.log("error status: " + xhr.status);
      console.log("error status text: " + xhr.statusText);
      console.log("error response text: " + thrownError);
      console.log("error ajaxOption : " + ajaxOptions);
    },
    // contentType: "text/javascript; charset=utf-8",
    // crossDomain : true,
    // type:'GET',
    // jsonpCallback: 'callback',
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Access-Control-Allow-Credentials", "true");
      xhr.setRequestHeader("Access-Control-Allow-Origin", "*/*");
      xhr.setRequestHeader("Access-Control-Allow-Headers", "Content-Type");
      xhr.setRequestHeader("Access-Control-Max-Age", "86400");
      // xhr.setRequestHeader("Access-Control-Allow-Origin", "http://datamall.mytransport.sg");
      xhr.setRequestHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      xhr.setRequestHeader("content-type","application/javascript");
      xhr.setRequestHeader("Accept","text/plain");
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");


    }
  })
// .done(function(response) {
//     console.log("response");
//     console.log(response);
//   }).fail(function(xhr, ajaxOptions, thrownError){

//     console.log("error status: " + xhr.status);
//     console.log("error status text: " + xhr.statusText);
//     console.log("error response text: " + thrownError);
//   console.log("error ajaxOption : " + ajaxOptions);
//     // console.log("responsefail");
//     // console.log(response);
//   });

  // var request = new XMLHttpRequest();
  // var path = "http://datamall.mytransport.sg/ltaodataservice.svc/IncidentSet";
  // request.onreadystatechange = state_change;

  // request.open("GET", path, true);
  // // request.setRequestHeader("Referer", "http://datamall.mytransport.sg");
  // //request.setRequestHeader("User-Agent", "Mozilla/5.0");
  // request.setRequestHeader("Access-Control-Allow-Origin", "*/*");
  // request.setRequestHeader("Accept", "text/plain");
  // request.setRequestHeader("Content-Type", "text/plain");
  // request.setRequestHeader("X-Requested-With", "XMLHttpRequest");

  // request.send(null);

  // function state_change() {
  //   if (request.readyState == 4) { // 4 = "loaded"
  //     if (request.status == 200) { // 200 = OK
  //       // ...our code here...
  //       alert('ok');
  //     } else {
  //       alert("Problem retrieving XML data");
  //     }
  //   }
  // }
}

//set basemap parameters
// function setMap() {
//   var baseMapLayer = L.tileLayer(baseMapLayerURL, {
//     key: '8bc33f0d529540bbbc631f1ae3705abd',
//     styleId: 998,
//     attribution: baseMapLayerAttribution
//   });

//   var midnight = L.tileLayer(baseMapLayerURL, {
//     key: '8bc33f0d529540bbbc631f1ae3705abd',
//     styleId: 999,
//     attribution: baseMapLayerAttribution
//   });

//   var chrono = L.tileLayer(baseMapLayerURL, {
//     key: '8bc33f0d529540bbbc631f1ae3705abd',
//     styleId: 22677,
//     attribution: baseMapLayerAttribution
//   });



//   //Setting map with default baseMapLayer and it's coordinate
//   map = L.map('map', {
//     center: new L.LatLng(37.7833, -122.41942),
//     zoom: 12,
//     layers: [baseMapLayer]
//   });

//   map.spin(true);

//   var geoJsonLayer;
//   var densityLayer;
//   var markerList = [];

//   //Custom Control for Info panel

//   info.onAdd = function(map) {
//     this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
//     this.update();
//     return this._div;
//   };

//   // method that we will use to update the control based on feature properties passed
//   info.update = function(props) {
//     this._div.innerHTML = '<h4>SAN FRANSICO Population</h4>' + (props ?
//       '<b>' + props + ' peoples</b>' : 'Hover over a city');
//   };
//   info.addTo(map);
//   //End of Custom Control

//   //Marker Cluster Grouping for Bulk loading of points
//   incidentsMarkers = L.markerClusterGroup({
//     chunkedLoading: true
//     // ,    chunkProgress: updateProgressBar
//   });

//   zoneMarkers = L.markerClusterGroup({
//     chunkedLoading: true
//     // ,    chunkProgress: updateProgressBar
//   });

//   densityMarkers = L.markerClusterGroup({
//     chunkedLoading: true
//     // ,    chunkProgress: updateProgressBar
//   });

//   // Using jQUERY to load geojson file￼
//   $.getJSON("data/crimeIncidents.geojson", function(data) {
//     geoJsonLayer = L.geoJson(data, {

//       onEachFeature: function(feature, layer) {

//         layer.bindPopup("<b>" + feature.properties.Category + "</b><br> " + "<b>Date:</b> " + feature.properties.Date + "<br><b>Address:</b> " + feature.properties.Address);
//       }
//     });

//     //Disable loading spinner
//     map.spin(false);

//     $.getJSON("data/planning_zone.geojson", function(data) {
//       polygonZoning = L.geoJson(data, {
//         style: function(feature) {
//           return {
//             color: '#888888',
//           };
//         },
//         onEachFeature: function(feature, layer) {
//           layer.on('click', function(e) {
//             e.target.bindPopup(feature.properties.name, {
//               'offset': L.point(0, 0)
//             }).openPopup();
//           });

//           layer.off('mouseout'),
//           function(e) {
//             console.log(e);
//             e.target.bindPopup(feature.properties.name).closePopup();
//           }
//         }
//       });

//       $.getJSON("data/density.geojson", function(data) {

//         choropleth = L.geoJson(data, {
//           style: style,

//           onEachFeature: function(feature, layer) {
//             layer.on({
//               mouseover: highlightFeature,
//               mouseout: resetHighlight
//               // click: zoomToFeature
//             });
//             // console.log(feature.properties.Pop2010)
//           }
//         });//.addTo(map);

//         //Layergroup control for basemap 
//         baseMaps = {
//           "Basemap": baseMapLayer,
//           "Chronomap": chrono,
//           "Night View": midnight
//         };

//         //Layergroup control for additional layer (incidents points)
//         overlayMaps = {
//           "Incidents": incidentsMarkers,
//           "Zone": polygonZoning,
//           "Choropleth": choropleth
//           // "Population Density": densityLayer
//         };

//         createLegend();

//         //Append ILayer to include updated datapoints
//         zoneMarkers.addLayer(polygonZoning);
//         incidentsMarkers.addLayer(geoJsonLayer);

//         map.addLayer(polygonZoning);
//         map.fitBounds(polygonZoning.getBounds());

//         map.addLayer(incidentsMarkers);
//         map.fitBounds(incidentsMarkers.getBounds());

//         map.addLayer(choropleth);
//         map.fitBounds(choropleth.getBounds());

//         L.control.layers(baseMaps, overlayMaps).addTo(map);
//       }); //End of .getJSON
//     }); //End of .getJSON
//   }); // End of getJSON

//   map.on('baselayerchange', function(e) {
//     if (e.name == "Chrono") {
//       // choropleth();
//     };
//   });
// }; //End of setup()

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