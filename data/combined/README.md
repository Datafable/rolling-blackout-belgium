# Procedure to combine municipalities with rolling blackout data

1. Follow the steps to create the [geospatial municipalities](../geospatial/README.md) and [rolling blackout data](../blackout/README.md).
2. Upload the [rolling blackout data](../blackout/rolling-blackout-data.csv) to CartoDB as `rolling_blackout`.
3. Change data types:

    ```SQL
    ALTER TABLE rolling_blackout
    ALTER COLUMN section_1 SET data type numeric USING NULLIF(section_1,'')::numeric;
    ALTER TABLE rolling_blackout
    ALTER COLUMN section_2 SET data type numeric USING NULLIF(section_2,'')::numeric;
    ALTER TABLE rolling_blackout
    ALTER COLUMN section_3 SET data type numeric USING NULLIF(section_3,'')::numeric;
    ALTER TABLE rolling_blackout
    ALTER COLUMN section_4 SET data type numeric USING NULLIF(section_4,'')::numeric;
    ALTER TABLE rolling_blackout
    ALTER COLUMN section_5 SET data type numeric USING NULLIF(section_5,'')::numeric;
    ALTER TABLE rolling_blackout
    ALTER COLUMN section_6 SET data type numeric USING NULLIF(section_6,'')::numeric;
    ALTER TABLE rolling_blackout
    ALTER COLUMN excluded SET data type numeric USING NULLIF(excluded,'')::numeric;
    ALTER TABLE rolling_blackout
    ALTER COLUMN total SET data type numeric USING NULLIF(total,'')::numeric;
    ```

4. Add columns:

    ```SQL
    ALTER TABLE rolling_blackout
    ADD COLUMN section_all numeric,
    ADD COLUMN section_1_pct numeric,
    ADD COLUMN section_2_pct numeric,
    ADD COLUMN section_3_pct numeric,
    ADD COLUMN section_4_pct numeric,
    ADD COLUMN section_5_pct numeric,
    ADD COLUMN section_6_pct numeric,
    ADD COLUMN section_all_pct numeric,
    ADD COLUMN excluded_pct numeric,
    ```

5. Populate `section_all`:

    ```SQL
    UPDATE rolling_blackout
    SET section_all =
       coalesce(section_1, 0) + 
       coalesce(section_2, 0) + 
       coalesce(section_3, 0) + 
       coalesce(section_4, 0) + 
       coalesce(section_5, 0) + 
       coalesce(section_6, 0)
    ```

6. Calculate percentages for all categories (including setting 0 for `null` and when total is `0`):

    ```SQL
    UPDATE rolling_blackout
    SET
        section_all_pct = round(coalesce(section_all,0)/total*100,0),
        section_1_pct = round(coalesce(section_1,0)/total*100,0),
        section_2_pct = round(coalesce(section_2,0)/total*100,0),
        section_3_pct = round(coalesce(section_3,0)/total*100,0),
        section_4_pct = round(coalesce(section_4,0)/total*100,0),
        section_5_pct = round(coalesce(section_5,0)/total*100,0),
        section_6_pct = round(coalesce(section_6,0)/total*100,0),
        excluded_pct = round(coalesce(excluded,0)/total*100,0)
    WHERE total != 0;

    UPDATE rolling_blackout
    SET
        section_all_pct = 0,
        section_1_pct = 0,
        section_2_pct = 0,
        section_3_pct = 0,
        section_4_pct = 0,
        section_5_pct = 0,
        section_6_pct = 0,
        excluded_pct = 0
    WHERE total = 0;
    ```

7. Check if we have a full merge with the municipalities geospatial data (stored as `municipalities_belgium` table). The query should return no results:

    ```SQL
    SELECT
        b.municipality_geojson
    FROM rolling_blackout b
    LEFT JOIN municipalities_belgium m
    ON b.municipality_geojson = m.name
    WHERE m.name IS NULL
    ```

    If not, the [mapping file](../blackout/municipalities-to-map.csv) should be updated.

8. For showing the results on the map, we aggregate by municipality, calculate each section and merge with the geospatial data:

    ```SQL
    WITH rolling_blackout_by_municipality AS (
        SELECT
            municipality,
            municipality_geojson,
            sum(coalesce(section_all,0)) AS section_all,
            sum(total) AS total,
            CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_1,0))/sum(total)*100,2) ELSE 0 END AS section_1_pct,
            CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_2,0))/sum(total)*100,2) ELSE 0 END AS section_2_pct,
            CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_3,0))/sum(total)*100,2) ELSE 0 END AS section_3_pct,
            CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_4,0))/sum(total)*100,2) ELSE 0 END AS section_4_pct,
            CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_5,0))/sum(total)*100,2) ELSE 0 END AS section_5_pct,
            CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_6,0))/sum(total)*100,2) ELSE 0 END AS section_6_pct,
            CASE WHEN sum(total) != 0 THEN round(sum(coalesce(section_all,0))/sum(total)*100,2) ELSE 0 END AS section_all_pct
        FROM rolling_blackout
        GROUP BY
            municipality,
            municipality_geojson
    )

    SELECT
        m.cartodb_id,
        m.the_geom,
        m.the_geom_webmercator,
        m.region,
        b.*
    FROM rolling_blackout_by_municipality b
        LEFT JOIN municipalities_belgium m
        ON b.municipality_geojson = m.name
    ORDER BY
        b.municipality
    ```
