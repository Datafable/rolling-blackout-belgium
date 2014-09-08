var main = function() {
    // Draw map
    drawMap();

    // Select section with button
    $('.select-section').click(function() {
        $('.select-section').removeClass('active')
        $(this).addClass('active');
        window.selectedSection = this.value;
        changeSectionOnMap();
    });
};

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
    showBlackoutDataOnMap(window.map);
};

function showBlackoutDataOnMap(map) {
    var sql = "SELECT * FROM public.rolling_blackout_by_municipality";
    var section = 'section_all_pct'
    var cartocss = '#rolling_blackout_by_municipality { polygon-fill: #1a9850; polygon-opacity: 0.8; line-color: #333333; line-width: 0.5; line-opacity: 1; [' + section + ' = 100] { polygon-fill: #d73027; } [' + section + ' < 100] { polygon-fill: #f79272; } [' + section + ' < 80] { polygon-fill: #fed6b0; } [' + section + ' < 60] { polygon-fill: #fff2cc; } [' + section + ' < 40] { polygon-fill: #d2ecb4; } [' + section + ' < 20] { polygon-fill: #8cce8a; } [' + section + ' = 0] { polygon-fill: #1a9850; } }';
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
        var sublayer = layer.getSubLayer(0);
        sublayer.setInteraction(true);
        var selectedFields = [
            'municipality',
            'total',
            'section_1_pct',
            'section_2_pct',
            'section_3_pct',
            'section_4_pct',
            'section_5_pct',
            'section_6_pct'
        ];
        sublayer.set({'interactivity': selectedFields});
        sublayer.on('featureClick', function(event, latlng, pos, data, layerindex) {
            var sectionField = "section_" + window.selectedSection + "_pct";
            var sql = "select district, section_1_pct, section_2_pct, section_3_pct, section_4_pct, section_5_pct, section_6_pct, section_all_pct from rolling_blackout where municipality_geojson='" + data.municipality + "';";
            $("#sidebar").empty();
            $("#sidebar").append("<h1>" + data.municipality + "</h1>");
            $.get("http://datafable.cartodb.com/api/v2/sql?q=" + sql, function(data) {
                console.log(data);
                var tablerows = "";
                _.each(data.rows, function(i) {
                    tablerows = tablerows + "<tr><td>" + i.district + "</td><td>" + i.section_1_pct + "</td><td>" + i.section_2_pct + "</td><td>" + i.section_3_pct + "</td><td>" + i.section_4_pct + "</td><td>" + i.section_5_pct + "</td><td>" + i.section_6_pct + "</td><td>" + i.section_all_pct + "</td></tr>";
                });
                $("#sidebar").append("<table><tr><th>district</th><th>section 1</th><th>section 2</th><th>section 3</th><th>section 4</th><th>section 5</th><th>section 6</th><th>all sections</th></tr>" + tablerows + "</table>");
            });
        });
    });
};

function changeSectionOnMap() {
    var section = 'section_' + window.selectedSection + '_pct';
    var cartocss = '#rolling_blackout { polygon-fill: #1a9850; polygon-opacity: 0.8; line-color: #333333; line-width: 0.5; line-opacity: 1; [' + section + ' = 100] { polygon-fill: #d73027; } [' + section + ' < 100] { polygon-fill: #f79272; } [' + section + ' < 80] { polygon-fill: #fed6b0; } [' + section + ' < 60] { polygon-fill: #fff2cc; } [' + section + ' < 40] { polygon-fill: #d2ecb4; } [' + section + ' < 20] { polygon-fill: #8cce8a; } [' + section + ' = 0] { polygon-fill: #1a9850; } }';
    window.mapLayer.setCartoCSS(cartocss);
}

$(document).ready(main);
