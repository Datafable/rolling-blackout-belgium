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
	zoom: 8,
	center: new google.maps.LatLng(50.52,4.5),
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
    var sql = "SELECT * FROM public.rolling_blackout";
    var section = 'all_sections_pct'
    var cartocss = '#rolling_blackout { polygon-fill: #1a9850; polygon-opacity: 0.8; line-color: #333333; line-width: 0.5; line-opacity: 1; [' + section + ' = 100] { polygon-fill: #d73027; } [' + section + ' < 100] { polygon-fill: #f79272; } [' + section + ' < 80] { polygon-fill: #fed6b0; } [' + section + ' < 60] { polygon-fill: #fff2cc; } [' + section + ' < 40] { polygon-fill: #d2ecb4; } [' + section + ' < 20] { polygon-fill: #8cce8a; } [' + section + ' = 0] { polygon-fill: #1a9850; } }';
    cartodb.createLayer(map, {
	user_name: 'datafable',
	type: 'cartodb',
	sublayers: [{
	    sql: sql,
	    cartocss: cartocss
	}]
    })
    .addTo(map)
    .done(function(layer) {
        window.mapLayer = layer;
    });
};

// Update cartocss based on selected section
function showBySection(sectionnr) {
    var section = 'section_' + sectionnr + '_pct';
    var cartocss = '#rolling_blackout { polygon-fill: #1a9850; polygon-opacity: 0.8; line-color: #333333; line-width: 0.5; line-opacity: 1; [' + section + ' = 100] { polygon-fill: #d73027; } [' + section + ' < 100] { polygon-fill: #f79272; } [' + section + ' < 80] { polygon-fill: #fed6b0; } [' + section + ' < 60] { polygon-fill: #fff2cc; } [' + section + ' < 40] { polygon-fill: #d2ecb4; } [' + section + ' < 20] { polygon-fill: #8cce8a; } [' + section + ' = 0] { polygon-fill: #1a9850; } }';
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
