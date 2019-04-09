#!/usr/bin/env python
# Name:
# Student number:
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

with open(INPUT_CSV, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
       data_dict[row['Year']].append(row['Rating'])

data_dict_averaged = {}
for key, value in data_dict.items():
    sum_value = 0
    for s in value:
        sum_value += float(s)
    data_dict_averaged[int(key)] = sum_value/len(value)

x = data_dict_averaged.keys()
y = data_dict_averaged.values()

plt.plot(x, y)
plt.show()

#if __name__ == "__main__":
    #print(data_dict)
