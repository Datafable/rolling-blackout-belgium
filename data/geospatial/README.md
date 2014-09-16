# Procedure to create a geojson file with all Belgian municipalities

This document describes the procedure we followed to create a geojson with border polygons for all [589 Belgian municipalities](http://en.wikipedia.org/wiki/Municipalities_of_Belgium).

1. Find open data on municipality and district polygons. This was needlessly hard ([do a better job, government!](https://index.okfn.org/country/overview/Belgium/)). **District data could not be found**, but thanks to some [great help](https://github.com/Datafable/rolling-blackout-belgium/issues/1) via Twitter by the [Belgian Open Knowledge Foundation](http://okfn.be/), we got an open geojson file with all municipalities:
    * [Communes-Gemeenten.geojson](https://github.com/pduchesne/data/blob/master/geo/Communes-Gemeenten.geojson) by [Philippe Duschesne](https://twitter.com/pduschesne).

2. Upload the file to [CartoDB](http://cartodb.com) as `municipalities_belgium`.
3. Add a column for province and region, and populate based on the `shn` code:

    ```SQL
    ALTER TABLE municipalities_belgium
    ADD COLUMN region text,
    ADD COLUMN province text;

    UPDATE municipalities_belgium
    SET province = 
        CASE
            WHEN substring(shn,3,2) = '21' THEN 'BE-VAN'
            WHEN substring(shn,3,2) = '22' THEN 'BE-VBR'
            WHEN substring(shn,3,2) = '23' THEN 'BE-VWV'
            WHEN substring(shn,3,2) = '24' THEN 'BE-VOV'
            WHEN substring(shn,3,2) = '27' THEN 'BE-VLI'
            WHEN substring(shn,3,2) = '32' THEN 'BE-WBR'
            WHEN substring(shn,3,2) = '35' THEN 'BE-WHT'
            WHEN substring(shn,3,2) = '36' THEN 'BE-WLG'
            WHEN substring(shn,3,2) = '38' THEN 'BE-WLX'
            WHEN substring(shn,3,2) = '39' THEN 'BE-WNA'
            WHEN substring(shn,3,2) = '42' THEN NULL
        END,
        region =
        CASE
            WHEN substring(shn,3,2) = '21' THEN 'BE-VLG'
            WHEN substring(shn,3,2) = '22' THEN 'BE-VLG'
            WHEN substring(shn,3,2) = '23' THEN 'BE-VLG'
            WHEN substring(shn,3,2) = '24' THEN 'BE-VLG'
            WHEN substring(shn,3,2) = '27' THEN 'BE-VLG'
            WHEN substring(shn,3,2) = '32' THEN 'BE-WAL'
            WHEN substring(shn,3,2) = '35' THEN 'BE-WAL'
            WHEN substring(shn,3,2) = '36' THEN 'BE-WAL'
            WHEN substring(shn,3,2) = '38' THEN 'BE-WAL'
            WHEN substring(shn,3,2) = '39' THEN 'BE-WAL'
            WHEN substring(shn,3,2) = '42' THEN 'BE-BRU'
        END
    ```

4. Remove unnecessary columns

   ```SQL
   ALTER TABLE municipalities_belgium
   DROP COLUMN description,
   DROP COLUMN desn,
   DROP COLUMN icc,
   DROP COLUMN isn,
   DROP COLUMN name,
   DROP COLUMN shape_area,
   DROP COLUMN shape_leng;

   ALTER TABLE municipalities_belgium
   RENAME COLUMN namn TO name
   ```

5. Create a view for geojson export:

    ```SQL
    SELECT
        name,
        province,
        region,
        shn,
        the_geom
    FROM municipalities_belgium
    ORDER BY
        region,
        province,
        name
   ```

6. Export as geojson and upload to GitHub as [municipalities-belgium.geojson](municipalities-belgium.geojson).
