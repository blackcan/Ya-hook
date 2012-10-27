#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Author:
# * Chun-Yuan Cheng <https://github.com/bryanyuan2/>
# * Ken Lin <https://github.com/blackcan>
# * Chi-En Wu <https://github.com/jason2506>
#

from json import dumps
from urllib import unquote

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app

from crawler import *

def _encode(s):
    return unquote(s).encode('utf8')

class SearchRequestHandler(webapp.RequestHandler):
    def get(self):
        query = _encode(self.request.get('query'))
        target_url = search_ipeen(query)
        self.response.write(target_url)

class InfoRequestHandler(webapp.RequestHandler):
    def get(self):
        url = _encode(self.request.get('url'))
        lat = _encode(self.request.get('lat'))
        lon = _encode(self.request.get('lon'))
        info = fetch_ipeen_info(url)
        info['parking'] = fetch_parking_info(lat, lon)
        self.response.write(dumps(info))

class WeatherRequestHandler(webapp.RequestHandler):
    def get(self):
        address = _encode(self.request.get('address'))
        date = _encode(self.request.get('date'))
        lat = _encode(self.request.get('lat'))
        lon = _encode(self.request.get('lon'))
        info = fetch_yahoo_weather_info(lat, lon, address, date)
        self.response.write(dumps(info))

class TheaterRequestHandler(webapp.RequestHandler):
    def get(self):
        theater = _encode(self.request.get('name'))
        movie_list = fetch_yahoo_movie_info(theater)
        self.response.write(dumps({'movies': movie_list}))

application = webapp.WSGIApplication(
    [('/search', SearchRequestHandler),
     ('/info', InfoRequestHandler),
     ('/weather', WeatherRequestHandler),
     ('/theater', TheaterRequestHandler)])

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()

