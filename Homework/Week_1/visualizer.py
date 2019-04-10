#!/usr/bin/env python
# Name: Charlotte
# Student number: 10506942
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

# Global dictionary for the manipulated data
data_dict_averaged = {}

def add_data(INPUT_CSV):
    """
    Reads in data from csvfile line by line and
    adds to dictionary.
    """
    with open(INPUT_CSV, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            data_dict[row['Year']].append(row['Rating'])

    return data_dict


def average(data_dict):
    """
    Returns a dictionairy where, for every key, the values are averaged.
    """
    for key, value in data_dict.items():
        sum_value = 0
        for s in value:
            sum_value += float(s)
            data_dict_averaged[int(key)] = sum_value/len(value)

    return data_dict_averaged


def plot(data_dict_averaged):
    """
    Plots the keys and values from dictionary.
    """
    x = data_dict_averaged.keys()
    y = data_dict_averaged.values()

    plt.plot(x, y)
    plt.axis([2008, 2017, 8, 9.0])
    plt.title("Average IMDB ratings per year between 2008-2017")
    plt.xlabel("Year")
    plt.ylabel("Rating")
    plt.show()


if __name__ == "__main__":
    add_data(INPUT_CSV)
    average(data_dict)
    plot(data_dict_averaged)
