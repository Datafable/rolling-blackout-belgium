# Procedure to create a csv file containing all rolling blackout data as released by the Belgian government

1. The federal government released the rolling blackout data as a pdf file per province. We found one file online where these pdfs were consolidated [here](https://docs.google.com/file/d/0B6xwmzsHL_Y-UWN1cDhVR29JSzQ/edit). 
2. We used an [online service to convert the pdf file to html](http://www.htmlpublish.com/convert-pdf-to-html/)
3. The script [convert_to_csv.py](https://github.com/Datafable/rolling-blackout-belgium/blob/master/scripts/convert_to_csv.py) converts the html file to csv. This step comprises:
        3.1 Cut the html tables from the file, and parse the data from it
        3.2 Clean up the data:
                3.2.1 Merge lines for municipalities with names that span 2 rows.
                3.2.2 Fill in the municipality for every district
                3.2.3 Map the municipality name with the names in the [geojson file](https://github.com/Datafable/rolling-blackout-belgium/blob/master/data/geospatial/municipalities_belgium.geojson) using [this mapping file](https://github.com/Datafable/rolling-blackout-belgium/blob/master/data/blackout/municipalities_to_map.csv).
                3.2.4 Fix a couple of lines that contain an additional leading or trailing cell.
                3.2.5 Remove empty lines
        3.3 Write the data to [data/blackout/rolling-blackout-data.csv](https://github.com/Datafable/rolling-blackout-belgium/blob/master/data/blackout/rolling-blackout-data.csv)
4. The script [aggregate_per_municipality.py](https://github.com/Datafable/rolling-blackout-belgium/blob/master/scripts/aggregate_per_municipality.py) aggregates the data by municipality and returns the sum of the cabins to be switched off in each section. **You'll need pandas if you want to run this script.**. See the [requirements file](https://github.com/Datafable/rolling-blackout-belgium/blob/master/requirements.txt), and install it with `pip install -r requirements.txt`.
