var main = function() {
    window.selectedSection = "all";

    // Draw map
    drawMap();

    // Select section with button
    $(".select-section").click(function() {
        $(".select-section").removeClass("active")
        $(this).addClass("active");
        selectedSection = this.value;
        changeSectionOnMap();
    });
};

function drawMap() {
    cartodb.createVis("map", "http://datafable.cartodb.com/api/v2/viz/6ea981ca-38fa-11e4-b1f2-0e230854a1cb/viz.json")
        .done(function(vis, layers) {
            window.vis = vis;
            window.layers = layers;
            var sublayer = layers[1].getSubLayer(0);
            sublayer.set({"interactivity": ["municipality", "section_all", "total", "section_all_pct"]});
            sublayer.setInteraction(true);
            sublayer.on('featureClick' ,function(event, latlng, pos, data, layerindex)  {
                showMunicipalityInfo(data);
            });
        });;
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

function changeSectionOnMap() {
    var section = "section_" + window.selectedSection + "_pct";
    var cartocss = "#rolling_blackout { polygon-fill: #1a9850; polygon-opacity: 0.8; line-color: #333333; line-width: 0.5; line-opacity: 1; } #rolling_blackout[" + section + " = 100] { polygon-fill: #d73027; } #rolling_blackout[" + section + " < 100] { polygon-fill: #f79272; } #rolling_blackout[" + section + " < 80] { polygon-fill: #fed6b0; } #rolling_blackout[" + section + " < 60] { polygon-fill: #fff2cc; } #rolling_blackout[" + section + " < 40] { polygon-fill: #d2ecb4; } #rolling_blackout[" + section + " < 20] { polygon-fill: #8cce8a; } #rolling_blackout[" + section + " = 0] { polygon-fill: #1a9850; }";
    window.layers[1].setCartoCSS(cartocss);
    highlightSectionInTable();
}

function highlightSectionInTable() {
    var section = ".section-" + window.selectedSection;
    $("#district-data th").removeClass("info");
    $("#district-data td").removeClass("info");
    $(section).addClass("info");
}

$(document).ready(main);
