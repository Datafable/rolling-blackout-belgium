# Procedure to combine municipalities with rolling blackout data

1. Follow the steps to create the [geospatial municipalities](../geospatial/README.md) and [rolling blackout data](../blackout/README.md).
2. Upload the [aggregated blackout data](../blackout/rolling-blackout-data-aggregated-by-municipality.csv) to CartoDB as `rolling_blackout`.
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

4. Add columns and rename one:

    ```SQL
    ALTER TABLE rolling_blackout
    ADD COLUMN all_sections numeric,
    ADD COLUMN section_1_pct numeric,
    ADD COLUMN section_2_pct numeric,
    ADD COLUMN section_3_pct numeric,
    ADD COLUMN section_4_pct numeric,
    ADD COLUMN section_5_pct numeric,
    ADD COLUMN section_6_pct numeric,
    ADD COLUMN all_sections_pct numeric,
    ADD COLUMN excluded_pct numeric,
    ADD COLUMN region text;
    
    ALTER TABLE rolling_blackout
    RENAME COLUMN municipality_geojson TO municipality
    ```

5. Populate `all_sections`:

    ```SQL
    UPDATE rolling_blackout
    SET all_sections =
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
        all_sections_pct = round(coalesce(all_sections,0)/total*100,2),
        section_1_pct = round(coalesce(section_1,0)/total*100,2),
        section_2_pct = round(coalesce(section_2,0)/total*100,2),
        section_3_pct = round(coalesce(section_3,0)/total*100,2),
        section_4_pct = round(coalesce(section_4,0)/total*100,2),
        section_5_pct = round(coalesce(section_5,0)/total*100,2),
        section_6_pct = round(coalesce(section_6,0)/total*100,2),
        excluded_pct = round(coalesce(excluded,0)/total*100,2)
    WHERE total != 0;

    UPDATE rolling_blackout
    SET
        all_sections_pct = 0,
        section_1_pct = 0,
        section_2_pct = 0,
        section_3_pct = 0,
        section_4_pct = 0,
        section_5_pct = 0,
        section_6_pct = 0,
        excluded_pct = 0
    WHERE total = 0;
    ```

7. Check if we have a full merge with the municipalities geojson data (stored as `municipalities_belgium` table). The query should return no results:

    ```SQL
    SELECT
        b.municipality
    FROM rolling_blackout b
    LEFT JOIN municipalities_belgium m
    ON b.municipality = m.name
    WHERE m.name IS NULL
    ```

    If not, the [mapping file](../blackout/municipalities-to-map.csv) should be updated.

8. Merge the two tables:

    ```SQL
    UPDATE rolling_blackout
    SET
        region = m.region,
        the_geom = m.the_geom,
        the_geom_webmercator = m.the_geom_webmercator
    FROM municipalities_belgium m
    WHERE
        municipality = m.name
    ```

9. Export as geojson and upload to GitHub as [rolling-blackout.geojson](rolling-blackout.geojson).
