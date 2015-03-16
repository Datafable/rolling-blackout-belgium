var main = function() {

    // Load language
    $.i18n.init({
        lngWhitelist: ["en", "nl", "fr"],
        fallbackLng: "en",
        resGetPath: "locale/translation-__lng__.json"
    },
    function(t) {
        translate(i18n.lng());
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
    $("#language-selection button").click(function() {
        $("#language-selection button").removeClass("active")
        $(this).addClass("active");
        $.i18n.setLng(this.id,function(t){
            translate($(this).attr("id"));    
        });
    });
};

function translate(currentLanguageID) {
    $("html").i18n(); // Set language for all elements with a data-i18n attribute
    var currentLanguageID = "#" + currentLanguageID
    $(currentLanguageID).addClass("active");
}

function drawMap() {
    var options = {
        center: [50.52, 4.5],
        description: false,
        infowindow: false,
        layer_selector: false,
        legends: true,
        loaderControl: false,
        scrollwheel: true,
        searchControl: true,
        shareable: false,
        title: false,
        zoom: 8
    }
    cartodb.createVis("map", "http://datafable.cartodb.com/api/v2/viz/605582b4-43d0-11e4-b721-0edbca4b5057/viz.json", options)
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
    var cartocss = "#rolling_blackout::shape { polygon-fill: #fffdea; polygon-opacity: 1; line-color: #000000; line-width: 0.5; line-opacity: 1; [" + section + " = 100] { polygon-fill: #2c323c; } [" + section + " < 100] { polygon-fill: #4f5359; } [" + section + " < 80] { polygon-fill: #727576; } [" + section + " < 60] { polygon-fill: #959793; } [" + section + " < 40] { polygon-fill: #b8b9b0; } [" + section + " < 20] { polygon-fill: #dbdbcd; } [" + section + " = 0] { polygon-fill: #fffdea; } } #rolling_blackout[zoom>=10]::labels { text-name: [municipality]; text-face-name: 'DejaVu Sans Book'; text-size: 11; text-fill: #000; text-halo-fill: #FFF; text-halo-radius: 1.5; text-wrap-width: 1; text-wrap-character: '/'; text-placement: interior; text-placement-type: simple; text-allow-overlap: false; }"
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
