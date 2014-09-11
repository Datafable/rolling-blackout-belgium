# Procedure to create a csv file containing all rolling blackout data as released by the Belgian government

1. The federal government released the rolling blackout data as [one pdf file per province](http://economie.fgov.be/nl/consument/Energie/Energiebevoorradingszekerheid/Crisisbeleid/elektriciteit/afschakeling/afschakelplan/kaart/)[^1].  We found [a file](https://docs.google.com/file/d/0B6xwmzsHL_Y-UWN1cDhVR29JSzQ/edit) where all these pdfs are consolidated.
2. We used an [online service to convert the pdf file to html](http://www.htmlpublish.com/convert-pdf-to-html/).
3. [This script](../../scripts/convert_to_csv.py) converts the html file to csv. This step comprises:
    * Cut the html tables from the file and parse the data from it.
    * Merge lines for municipalities with names that span 2 rows.
    * Fill in the municipality for every district.
    * Map the municipality names with those in the [geojson file](../geospatial/municipalities-belgium.geojson) using a manually created [mapping file](municipalities-to-map.csv) to handle name variations.
    * Fix a couple of lines that contain an additional leading or trailing cell.
    * Remove empty lines.
    * Write the data to [rolling-blackout-data.csv](rolling-blackout-data.csv)

[^1]: They have since also released the data as an [Excel file](http://economie.fgov.be/nl/binaries/delestage_par_province_afschakeling_per_provincie_tcm325-254823.xls).
