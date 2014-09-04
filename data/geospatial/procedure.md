# Procedure to create a geojson with all Belgian municipalities

This document describes the procedure we followed to create a geojson with border polygons for all [589 Belgian municipalities](http://en.wikipedia.org/wiki/Municipalities_of_Belgium).

1. Find open data on municipalities ("gemeentes") and districts ("deelgemeentes") polygons. This was needlessly hard ([do a better job, government!](https://index.okfn.org/country/overview/Belgium/)). District data could not be found, but thanks some [great help](https://github.com/Datafable/power-shutdown-belgium/issues/1) via Twitter by the [Belgian Open Knowledge Foundation](http://okfn.be/), we found 2 useful files for the municipalities:
    * [Voorlopig referentiebestand gemeentegrenzen](http://www.geopunt.be/download?container=referentiebestand-gemeenten&title=Voorlopig%20referentiebestand%20gemeentegrenzen): shapefile by [AGIV](https://www.agiv.be/) with municipalities in **Flanders**, released under an [Gratis Open Data Licentie](http://www4wvg.vlaanderen.be/wvg/data/Documents/Gratis_Open_Data_Licentie.pdf).
    * [communes wallonie-bruxelles.kml](https://www.google.com/fusiontables/data?docid=1Kg6KwV_QzMBSd3ZKl6id6Bsosewwex-Ubrd75Sg#map:id=3): kml with municipalities of **Wallonia and Brussels**, released under an unknown license, but download allowed.

2. Use `Refgem.shp` of Flemish data and change datum to `WGS84` with [QGIS](http://www.qgis.org/).
3. Rename files:
    * `municipalities_fla`: data for Flanders.
    * `municipalities_wal_bru`: data for Wallonia/Brussels.
4. Upload both files to [CartoDB](http://cartodb.com).
5. Join tables and only keep limited columns, including one for the region:

   ```SQL
   SELECT
        the_geom,
        the_geom_webmercator,
        naam AS name,
        'Flanders' AS region
    FROM municipalities_fla

    UNION

    SELECT
        the_geom,
        the_geom_webmercator,
        nom AS name,
        CASE 
            WHEN nom='Anderlecht' THEN 'Brussels'
            WHEN nom='Auderghem' THEN 'Brussels'
            WHEN nom='Berchem-Sainte-Agathe' THEN 'Brussels'
            WHEN nom='Bruxelles' THEN 'Brussels'
            WHEN nom='Etterbeek' THEN 'Brussels'
            WHEN nom='Evere' THEN 'Brussels'
            WHEN nom='Forest' THEN 'Brussels'
            WHEN nom='Ganshoren' THEN 'Brussels'
            WHEN nom='Ixelles' THEN 'Brussels'
            WHEN nom='Jette' THEN 'Brussels'
            WHEN nom='Koekelberg' THEN 'Brussels'
            WHEN nom='Molenbeek-Saint-Jean' THEN 'Brussels'
            WHEN nom='Saint-Gilles' THEN 'Brussels'
            WHEN nom='Saint-Josse-ten-Noode' THEN 'Brussels'
            WHEN nom='Schaerbeek' THEN 'Brussels'
            WHEN nom='Uccle' THEN 'Brussels'
            WHEN nom='Watermael-Boitsfort' THEN 'Brussels'
            WHEN nom='Woluwe-Saint-Lambert' THEN 'Brussels'
            WHEN nom='Woluwe-Saint-Pierre' THEN 'Brussels'
            ELSE 'Wallonia'
        END AS region
    FROM municipalities_wal_bru
    ```

6. Save result as new table `municipalities_belgium`.
7. Create a view for geojson export:

    ```SQL
    SELECT
        name,
        region,
        the_geom
    FROM municipalities_belgium
    ORDER BY
        region,
        name
   ```

8. Export as geojson and upload to GitHub as [municipalities_belgium.geojson](municipalities_belgium.geojson).
