#!/usr/bin/env python
# Name:
# Student number:
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup
import re

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    movie_code = dom.find_all("div", class_="lister-item mode-advanced")

    movies = []
    for entry in movie_code:
        #initializing empty list to store information about one movie
        movie = []
        #title
        title = entry.h3.a.text
        movie.append(title)
        #rating
        rating = float(entry.strong.text)
        movie.append(rating)
        #release_year
        release_year = entry.h3.find('span', class_ = 'lister-item-year text-muted unbold')
        release_year = release_year.text
        release_year = re.search('(\d+)', release_year).group()
        movie.append(release_year)
        #actors
        movie_actors = entry.find_all('p', class_ = "")
        actors = movie_actors[1].text
        actors = actors.strip()
        actors = actors.split('Stars:')
        try:
            actors = actors[1].strip()
        except IndexError:
            actors = 'None'
        #actors = actors.split('\n')
        #actors_list = []
        #for actor in actors:
            #actors_list.append(actor.replace(', ', ''))
        #movie.append(actors_list)
        #actors = actors.rstrip()
        actors = actors.replace('\n', '')
        movie.append(actors)
        #runtime
        runtime = entry.p.find('span', class_ = "runtime")
        runtime = runtime.text
        runtime = runtime.replace(' min', '')
        runtime = int(runtime)
        movie.append(runtime)
        movies.append(movie)


    return movies


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])
    for movie in movies:
        writer.writerow(movie)
    outfile.close()


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')
    #print(dom.find_all('div class="lister list detail sub-list"'))


    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
