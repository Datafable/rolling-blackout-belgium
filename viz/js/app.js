var main = function() {

    // Load language
    $.i18n.init({
        lngWhitelist: ["en", "nl", "fr"],
        fallbackLng: "en",
        resGetPath: "locale/translation-__lng__.json"
    },
    function(t) {
        translate();
    });

    // Set default section
    window.selectedSection = "all";

    // Draw map
    drawMap();

    // Select section with button
    $("#section-selection button").click(function() {
        $("#section-selection button").removeClass("active")
        $(this).addClass("active");
        window.selectedSection = this.value;
        changeSectionOnMap();
    });

    // Select language
    $("#language-selection li").click(function() {
        $("#language-selection li").removeClass("active")
        $(this).addClass("active");
        $.i18n.setLng(this.id,function(t){
            translate();    
        });
    });
};

function translate() {
    $("html").i18n(); // Set language for all elements with a data-i18n attribute
}

function drawMap() {
    var options = {
        center: [50.52, 4.5],
        zoom: 8,
        loaderControl: false,
        shareable: false
    }
    cartodb.createVis("map", "http://datafable.cartodb.com/api/v2/viz/6ea981ca-38fa-11e4-b1f2-0e230854a1cb/viz.json", options)
        .done(function(vis, layers) {
            window.layers = layers;
            var sublayer = layers[1].getSubLayer(0);
            sublayer.setInteraction(true);
            sublayer.set({"interactivity": ["municipality", "section_all", "total", "section_all_pct"]});
            sublayer.on("featureClick" ,function(event, latlng, pos, data, layerindex)  {
                showMunicipalityInfo(data);
            });
        });
};

function showMunicipalityInfo(data) {
    var sectionField = "section_" + selectedSection + "_pct";
    var sql = "SELECT district, section_1_pct, section_2_pct, section_3_pct, section_4_pct, section_5_pct, section_6_pct, section_all_pct FROM rolling_blackout WHERE municipality='" + data.municipality + "';";
    $("#info-panel .default").hide()
    $("#info-panel .selected").show();

    $("#municipality-name").text(data.municipality);
    $("#part").text(data.section_all);
    $("#total").text(data.total);
    $("#percentage").text(data.section_all_pct);

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
