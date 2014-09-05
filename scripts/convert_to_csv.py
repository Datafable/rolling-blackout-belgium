import sys
import re
import csv

def convert_string_to_data(instr):
    data = []
    for row in re.findall('<TR>.*?</TR>', instr, flags=re.DOTALL):
        data_row = []
        for cell in re.findall('<TD.*?</TD', row):
            match = re.search('<P.*?>(.*)</P', cell)
            value = match.group(1)
            value = value.replace('<NOBR>', '')
            value = value.replace('</NOBR>', '')
            if value == '&nbsp;':
                value = ''
            data_row.append(value)
        data.append(data_row)
    return data

def convert_data(infile):
    content = open(infile).read()
    #subtables = re.findall('<TABLE.*?<TABLE.*?Gegevens.*?</TABLE', content, flags=re.DOTALL)
    subtables = re.findall('IMG.*?Donn', content, flags=re.DOTALL)
    print 'nr of tables found: {0}'.format(len(subtables))
    all_rows = []
    for tab in subtables:
        match = re.search('<TABLE.*?</TABLE', tab, flags=re.DOTALL)
        if match == None:
            datatable = re.findall('<TABLE.*</TR>', tab, flags=re.DOTALL)[0]
        else:
            datatable = match.group(0)
        try:
            match = re.search('.*Schijf', datatable, flags=re.DOTALL)
        except:
            print datatable
        tmp = datatable[match.end():]
        datastring = re.findall('<TR>.*</TR>', tmp, flags=re.DOTALL)[0]
        data = convert_string_to_data(datastring)
        [all_rows.append(x) for x in data]
    return all_rows

def clean_data(indata):
    outrows = []
    current_municipality = ''
    current_district_first_part = ''
    current_municipality_first_part = ''
    for row in indata:
        append_row = True
        row_content_ok = True
        if len(row) == 10:
            municipality, district, section1, section2, section3, section4, section5, section6, excluded, total = row
        elif len(row) == 11:
            unknown, municipality, district, section1, section2, section3, section4, section5, section6, excluded, total = row
        elif len(row) == 12 and row[-1] == '' and row[-2] != '':
            unknown, municipality, district, section1, section2, section3, section4, section5, section6, excluded, total, unknown = row
        else:
            print 'don\'t know what to do with this line: \n{0}'.format(row)
            row_content_ok = False
        if row_content_ok:
            if municipality != '':
                if total == '':
                    current_municipality_first_part = municipality
                elif current_municipality_first_part != '':
                    current_municipality = current_municipality_first_part + municipality
                    current_municipality_first_part = ''
                else:
                    current_municipality = municipality
                append_row = False
            else:
                if district == '':
                    """ this is an empty line so it should not be appended to the outrows """
                    append_row = False
                else:
                    """ district is filled in, but municipality was not """
                    if total == '':
                        """ this line should be merged with the next. The name was too long """
                        current_district_first_part = district
                        append_row = False
                    else:
                        """ this is a normal data line """
                        if current_district_first_part != '':
                            district = current_district_first_part + district
                            current_district_first_part = ''
            if append_row:
                outrows.append([current_municipality, district, section1, section2, section3, section4, section5, section6, excluded, total])
    return outrows

def read_municipalities_to_map():
    mapping_file = 'data/blackout/municipalities-to-map.csv'
    outdict = {}
    with open(mapping_file) as f:
        r = csv.reader(f)
        header = r.next()
        for row in r:
            outdict[row[0]] = row[1]
    return outdict

def map_municipalities(indata):
    municip_dict = read_municipalities_to_map()
    outrows = []
    for row in indata:
        municip = row[0]
        if municip in municip_dict.keys():
            geojson_municip_name = municip_dict[municip]
        else:
            geojson_municip_name = municip
        row.insert(1, geojson_municip_name)
        outrows.append(row)
    return outrows

def write_data(data):
    with open('data/blackout/rolling-blackout-data.csv', 'w+') as f:
        r = csv.writer(f, delimiter=',')
        r.writerow(['municipality', 'municipality_geojson', 'district', 'section_1', 'section_2', 'section_3', 'section_4', 'section_5', 'section_6', 'excluded', 'total'])
        for row in data:
            r.writerow(row)

def main():
    data = convert_data(sys.argv[1])
    cleaned_data = clean_data(data)
    mapped_data = map_municipalities(cleaned_data)
    write_data(mapped_data)

main()
