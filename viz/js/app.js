var main = function() {

    // Load language
    $.i18n.init({ lng: 'nl', lngWhitelist: ['en', 'nl', 'fr'], fallbackLng: 'nl' }, function(t) {
        $("html").i18n(); // Set language for all elements with a data-i18n attribute
    });

    // Set default section
    window.selectedSection = "all";

    // Draw map
    drawMap();

    // Select section with button
    $(".select-section").click(function() {
        $(".select-section").removeClass("active")
        $(this).addClass("active");
        window.selectedSection = this.value;
        changeSectionOnMap();
    });
};

function drawMap() {
    window.map = L.map('map', {
        center: [50.52, 4.5],
        zoom: 8
    });
    var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "thanks",
        maxZoom: 18
    }).addTo(map);
    showBlackoutDataOnMap(window.map);
};

// show the detailed info of a municipality in the sidebar
function showMunicipalityInfo(data) {
    var sectionField = "section_" + selectedSection + "_pct";
    var sql = "SELECT district, section_1_pct, section_2_pct, section_3_pct, section_4_pct, section_5_pct, section_6_pct, section_all_pct FROM rolling_blackout WHERE municipality_geojson='" + data.municipality + "';";
    $("#municipality-name").text(data.municipality);
    var municipalityData = data.section_all + ' of the ' + data.total + ' power distribution cabinets (' + data.section_all_pct + '%) are included in the rolling blackout plan.';
    $("#municipality-data").text(municipalityData);
    $("#district-data").show();
    $("#district-data tbody").empty();
    $.get("http://datafable.cartodb.com/api/v2/sql?q=" + sql, function(data) {
        var tablerows = "";
        _.each(data.rows, function(i) {
            var rowValues = [i.district, i.section_1_pct, i.section_2_pct, i.section_3_pct, i.section_4_pct, i.section_5_pct, i.section_6_pct, i.section_all_pct];
            var tableRow = ["<tr>"];
            _.each(rowValues, function(value, index) {
                if (index == 0) {
                    var openTag = "<td>";
                    var closeTag = "</td>";
                } else if (index == 7) {
                    if (value == "0") {
                        value = "-";
                    } else {
                        value = value + "%";
                    }
                    var openTag = "<th class=\"section-all\">";
                    var closeTag = "</th>";
                } else {
                    if (value == "0") {
                        value = "-";
                    } else {
                        value = value + "%";
                    }
                    var openTag = "<th class=\"section-all\">";
                    var openTag = "<td class=\"section-" + index + "\">";
                    var closeTag = "</td>";
                }
                tableRow.push(openTag + value + closeTag);
            });
            tableRow.push("</tr>");
            tablerows = tablerows + tableRow.join("");
        });
        $("#district-data tbody").append(tablerows);
        highlightSectionInTable();
    });
}

function showBlackoutDataOnMap(map) {
    var sql = "WITH rolling_blackout_by_municipality AS (SELECT municipality, municipality_geojson, sum(coalesce(section_all,0)) AS section_all, sum(total) AS total, CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_1,0))/sum(total)*100,2) ELSE 0 END AS section_1_pct, CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_2,0))/sum(total)*100,2) ELSE 0 END AS section_2_pct, CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_3,0))/sum(total)*100,2) ELSE 0 END AS section_3_pct, CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_4,0))/sum(total)*100,2) ELSE 0 END AS section_4_pct, CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_5,0))/sum(total)*100,2) ELSE 0 END AS section_5_pct, CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_6,0))/sum(total)*100,2) ELSE 0 END AS section_6_pct, CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_all,0))/sum(total)*100,2) ELSE 0 END AS section_all_pct FROM rolling_blackout GROUP BY municipality, municipality_geojson ) SELECT m.cartodb_id, m.the_geom, m.the_geom_webmercator, m.region, b.* FROM rolling_blackout_by_municipality b LEFT JOIN municipalities_belgium m ON b.municipality_geojson = m.name ORDER BY b.municipality";
    var section = "section_all_pct"
    var cartocss = "#rolling_blackout { polygon-fill: #1a9850; polygon-opacity: 0.8; line-color: #333333; line-width: 0.5; line-opacity: 1; } #rolling_blackout[" + section + " = 100] { polygon-fill: #d73027; } #rolling_blackout[" + section + " < 100] { polygon-fill: #f79272; } #rolling_blackout[" + section + " < 80] { polygon-fill: #fed6b0; } #rolling_blackout[" + section + " < 60] { polygon-fill: #fff2cc; } #rolling_blackout[" + section + " < 40] { polygon-fill: #d2ecb4; } #rolling_blackout[" + section + " < 20] { polygon-fill: #8cce8a; } #rolling_blackout[" + section + " = 0] { polygon-fill: #1a9850; }";
    cartodb.createLayer(map, {
        user_name: "datafable",
        type: "cartodb",
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
            "municipality",
            "section_all",
            "total",
            "section_all_pct"
        ];
        sublayer.set({"interactivity": selectedFields});
        sublayer.on("featureClick", function(event, latlng, pos, data, layerindex) {
            showMunicipalityInfo(data);
        });
    });
};

function changeSectionOnMap() {
    var section = "section_" + window.selectedSection + "_pct";
    var cartocss = "#rolling_blackout { polygon-fill: #1a9850; polygon-opacity: 0.8; line-color: #333333; line-width: 0.5; line-opacity: 1; } #rolling_blackout[" + section + " = 100] { polygon-fill: #d73027; } #rolling_blackout[" + section + " < 100] { polygon-fill: #f79272; } #rolling_blackout[" + section + " < 80] { polygon-fill: #fed6b0; } #rolling_blackout[" + section + " < 60] { polygon-fill: #fff2cc; } #rolling_blackout[" + section + " < 40] { polygon-fill: #d2ecb4; } #rolling_blackout[" + section + " < 20] { polygon-fill: #8cce8a; } #rolling_blackout[" + section + " = 0] { polygon-fill: #1a9850; }";
    window.mapLayer.setCartoCSS(cartocss);
    highlightSectionInTable();
}

function highlightSectionInTable() {
    var section = ".section-" + window.selectedSection;
    $("#district-data th").removeClass("info");
    $("#district-data td").removeClass("info");
    $(section).addClass("info");
}

$(document).ready(main);
