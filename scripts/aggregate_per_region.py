import pandas as pd

infile = 'data/data.csv'
rdata = pd.read_csv(infile)
result = rdata.groupby(['gemeente'], as_index=False).sum()
result.to_csv('data/agdata.csv', index=False)
