/* ---------------
 * Create map with baselayer
 * ---------------
 */

function drawMap() {
    window.map;
    var MAPTYPE_ID = 'custom_style';
    var mapStyle = [
	{ "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 17 } ] },
	{ "featureType": "landscape", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 20 } ] },
	{ "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" }, { "lightness": 17 } ] },
	{ "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#000000" }, { "lightness": 29 }, { "weight": 0.2 } ] },
	{ "featureType": "road.arterial", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 18 } ] },
	{ "featureType": "road.local", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 16 } ] },
	{ "featureType": "poi", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 21 } ] },
	{ "elementType": "labels.text.stroke", "stylers": [ { "visibility": "on" }, { "color": "#000000" }, { "lightness": 16 } ] },
	{ "mapType": "Map", "elementType": "labels.text.fill", "stylers": [ { "saturation": 36 }, { "color": "#000000" }, { "lightness": 40 } ] },
	{ "elementType": "labels.icon", "stylers": [ { "visibility": "off" } ] },
	{ "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#000000" }, { "lightness": 19 } ] },
	{ "featureType": "administrative", "elementType": "geometry.fill", "stylers": [ { "color": "#000000" }, { "lightness": 20 } ] },
	{ "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [ { "color": "#000000" }, { "lightness": 17 }, { "weight": 1.2 } ] }
    ];
    var featureOpts = mapStyle;
    var mapOptions = {
	zoom: 7,
	center: new google.maps.LatLng(50.4, 4),
	mapTypeControlOptions: {
	    mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, MAPTYPE_ID]
	},
	mapTypeId: MAPTYPE_ID
    };

    window.map = new google.maps.Map(document.getElementById('map'),  mapOptions);
    var styledMapOptions = {
	name: 'Custom Style'
    };
    var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);
    window.map.mapTypes.set(MAPTYPE_ID, customMapType);
    showBlackoutData(window.map);
};


/* ---------------
 * Add layer with blackout data
 * ---------------
 */
function showBlackoutData(map) {
    var sql = "SELECT * FROM public.municipalities_blackout_pct";
    cartodb.createLayer(map, {
	user_name: 'datafable',
	type: 'cartodb',
	sublayers: [{
	    sql: sql,
	    cartocss: '#municipalities_blackout_pct {polygon-fill: #F0F0F0;}'
	}]
    })
    .addTo(map)
    .done(function(layer) {
        console.log(layer)
        window.mapLayer = layer;
        var sublayer = layer.getSubLayer(0);
        sublayer.setInteraction(true);
        sublayer.set({'interactivity': ['municipality', 'total', 'section_1']});
        sublayer.on('featureClick', function(event, latlng, pos, data, layerindex) {
            console.log(data);
            $("#sidebar").append("<h1>" + data.municipality + "</h1>");
            $("#sidebar").append("<p>Total number of cabins:" + data.total + "</p>");
        });
    });
};

// Update cartocss based on selected section
function showBySection(sectionnr) {
    var section = 'section_' + sectionnr;
    var cartocss = vsprintf('#municipalities_blackout_pct { [ %s_pct < 90] {polygon-fill: #FF0000; } [ %s_pct < 80] { polygon-fill: #00FF00} }', [section, section]);
    window.mapLayer.setCartoCSS(cartocss);
}


// jQuery bindings to controls
function bindControls() {
    $("input:radio[name=section]").change(function() {
        showBySection(this.value);
    });
}

// Add the base map to the page
bindControls();
window.onload = drawMap;
