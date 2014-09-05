# Procedure to combine municipalities with rolling blackout data

1. Follow the steps to create the [geospatial municipalities](../geospatial/README.md) and [rolling blackout data](../blackout/README.md).
2. Upload the [aggregated blackout data](../blackout/rolling-blackout-data-aggregated-by-municipality.csv) to CartoDB as `rolling_blackout`.
3. Set field types:

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
    ADD COLUMN all_sections numeric,
    ADD COLUMN section_1_pct numeric,
    ADD COLUMN section_2_pct numeric,
    ADD COLUMN section_3_pct numeric,
    ADD COLUMN section_4_pct numeric,
    ADD COLUMN section_5_pct numeric,
    ADD COLUMN section_6_pct numeric,
    ADD COLUMN all_sections_pct numeric,
    ADD COLUMN excluded_pct numeric
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

6. Calculate percentages for all categories:

    ```SQL
    UPDATE rolling_blackout
    SET
        all_sections_pct = round(all_sections/total*100,2),
        section_1_pct = round(section_1/total*100,2),
        section_2_pct = round(section_2/total*100,2),
        section_3_pct = round(section_3/total*100,2),
        section_4_pct = round(section_4/total*100,2),
        section_5_pct = round(section_5/total*100,2),
        section_6_pct = round(section_6/total*100,2),
        excluded_pct = round(excluded/total*100,2)
    WHERE total != 0;
    ```
