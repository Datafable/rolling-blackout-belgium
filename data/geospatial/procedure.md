# Procedure to create a geojson with all Belgian municipalities

This document describes the procedure we followed to create a geojson with border polygons for all [589 Belgian municipalities](http://en.wikipedia.org/wiki/Municipalities_of_Belgium).

1. Find open data on municipalities ("gemeentes") and districts ("deelgemeentes"). Suprisingly hard, district data could not be found, but thanks some [great help](https://github.com/Datafable/power-shutdown-belgium/issues/1) via Twitter by the [Belgian Open Knowledge Foundation](http://okfn.be/), we found 2 useful files for the municipalities:

    * [Voorlopig referentiebestand gemeentegrenzen](http://www.geopunt.be/download?container=referentiebestand-gemeenten&title=Voorlopig%20referentiebestand%20gemeentegrenzen): shapefile by [AGIV](https://www.agiv.be/) with municipalities in **Flanders**, released under an [Gratis Open Data Licentie](http://www4wvg.vlaanderen.be/wvg/data/Documents/Gratis_Open_Data_Licentie.pdf).
    * [communes wallonie-bruxelles.kml](https://www.google.com/fusiontables/data?docid=1Kg6KwV_QzMBSd3ZKl6id6Bsosewwex-Ubrd75Sg#map:id=3): kml with municipalities of **Wallonia and Brussels**, released under an unknown license, but download allowed.
