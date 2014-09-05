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
    ADD COLUMN all_sectoins_pct numeric,
    ADD COLUMN excluded_pct numeric
    ```

