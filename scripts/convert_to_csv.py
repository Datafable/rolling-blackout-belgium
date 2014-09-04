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
    current_gemeente = ''
    current_deelgem_first_part = ''
    current_gemeente_first_part = ''
    for row in indata:
        append_row = True
        row_content_ok = True
        if len(row) == 10:
            gemeente, deelgem, schijf1, schijf2, schijf3, schijf4, schijf5, schijf6, noschijf, total = row
        elif len(row) == 11:
            unknown, gemeente, deelgem, schijf1, schijf2, schijf3, schijf4, schijf5, schijf6, noschijf, total = row
        elif len(row) == 12 and row[-1] == '' and row[-2] != '':
            unknown, gemeente, deelgem, schijf1, schijf2, schijf3, schijf4, schijf5, schijf6, noschijf, total, unknown = row
        else:
            print 'don\'t know what to do with this line: \n{0}'.format(row)
            row_content_ok = False
        if row_content_ok:
            if gemeente != '':
                if total == '':
                    current_gemeente_first_part = gemeente
                elif current_gemeente_first_part != '':
                    current_gemeente = current_gemeente_first_part + gemeente 
                    current_gemeente_first_part = ''
                else:
                    current_gemeente = gemeente
                append_row = False
            else:
                if deelgem == '':
                    """ this is an empty line so it should not be appended to the outrows """
                    append_row = False
                else:
                    """ deelgem is filled in, but gemeente was not """
                    if total == '':
                        """ this line should be merged with the next. The name was too long """
                        current_deelgem_first_part = deelgem
                        append_row = False
                    else:
                        """ this is a normal data line """
                        if current_deelgem_first_part != '':
                            deelgem = current_deelgem_first_part + deelgem
                            current_deelgem_first_part = ''
            if append_row:
                outrows.append([current_gemeente, deelgem, schijf1, schijf2, schijf3, schijf4, schijf5, schijf6, noschijf, total])
    return outrows

def write_data(data):
    with open('data/data.csv', 'w+') as f:
        r = csv.writer(f, delimiter=',')
        r.writerow(['gemeente', 'deelgemeente', 'schijf1', 'schijf2', 'schijf3', 'schijf4', 'schijf5', 'schijf6', 'buiten afschakelplan', 'totaal'])
        for row in data:
            r.writerow(row)

def main():
    data = convert_data(sys.argv[1])
    cleaned_data = clean_data(data)
    write_data(cleaned_data)

main()
