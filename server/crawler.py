#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Author:
# * Chun-Yuan Cheng <https://github.com/bryanyuan2/>
# * Ken Lin <https://github.com/blackcan>
# * Chi-En Wu <https://github.com/jason2506>
#

from json import loads
from math import sqrt, radians
from re import search
from urllib2 import urlopen

from lxml.html import HTMLParser, parse, fromstring

from LatLonToTWD97 import LatLonToTWD97

_IPEEN_BASE_URL = 'http://tw.ipeen.lifestyle.yahoo.net'
_YWEATHER_BASE_URL = 'http://weather.yahoo.com/forecast'

_GEO_TEMP_URL = 'http://maps.googleapis.com/maps/api/geocode/json?address={0}&&sensor=false'
_WOEID_TEMP_URL = 'http://where.yahooapis.com/geocode?location={0},{1}&flags=J&gflags=R&appid={2}'
_WEATHER_RSS_TEMP_URL = 'http://weather.yahooapis.com/forecastrss?w={0}&u=c'
_WEATHER_TEMP_URL = 'http://www.weather.com/weather/tenday/{0}'

_YAHOO_API_ID = '9AZ8FWjV34EVwK86ODdtBih4E01nLm4927JH88O_t2qirXMjus36eFqw6Y7ZYyMAiFXand2cOppgISU-'

_PARKING_LIST_FILENAME = 'parks.txt'
_THEATER_LIST_FILENAME = 'theater_list.txt'

def _remove_space(s):
    return s.replace(' ', '').replace('\t', '').replace('\n', '')

def _extract_links(links):
    result = []
    for link in links:
        result.append({
            'href': _IPEEN_BASE_URL + link.get('href'),
            'title': link.text
        })

    return result

def _get_lat_lon(address):
    url = _GEO_TEMP_URL.format(address)
    json = loads(urlopen(url).read())
    if (json['results']):
        location = json['results'][0]['geometry']['location']
        return location['lat'], location['lon']
    else:
        return None, None

def _get_woeid(lat, lon):
    url = _WOEID_TEMP_URL.format(lon, lat, _YAHOO_API_ID)
    json = loads(urlopen(url).read())
    return json['ResultSet']['Results'][0]['woeid']

def search_ipeen(query):
    query = query.decode('utf8', 'ignore')
    query = '%20'.join(query)
    query = query.encode('utf8', 'ignore')

    search_url = '{0}/search/?kw={1}&adkw='.format(_IPEEN_BASE_URL, query)
    html = urlopen(search_url).read()
    if html.find('to="c" code="4"') > -1:
        search_url = '{0}/search/?kw={1}&c=4'.format(_IPEEN_BASE_URL, query)
        html = urlopen(search_url).read() 

    root = fromstring(html)
    target_links = root.xpath('//div[@class="serData"]/h2/a')
    target_url = target_links[0].get('href')
    return target_url

def fetch_ipeen_info(url):
    root = parse(_IPEEN_BASE_URL + url).getroot()

    # get basic information
    info_rows = root.xpath('//table[@class="binfo"]/tr/td/div')
    basic_info_list = [_remove_space(row.text_content()) for row in info_rows]

    # get comments
    comment_links = root.xpath('//h2[@class="absTitle"]/a')
    comment_list = _extract_links(comment_links)

    # get more shops
    path = './/div[@class="name"]/a'
    shop_blocks = root.xpath('//div[@class="sblock rec"]')
    shop_list = {
        'rel': _extract_links(shop_blocks[0].iterfind(path)),
        'near': _extract_links(shop_blocks[1].iterfind(path))
    }

    # get photos
    url = url.replace('/shop/','/shop/photos/')
    root = parse(_IPEEN_BASE_URL + url).getroot()
    photo_imgs = root.xpath('//a[@rel="shop_photos_share"]/img')
    photo_list = ['http:' + img.get('src') for img in photo_imgs]

    # wrap infomation
    info = {
        'basic_info': basic_info_list,
        'comments': comment_list,
        'more_shop': shop_list,
        'photos': photo_list
    }

    return info

def fetch_parking_info(lat, lon):
    with open(_PARKING_LIST_FILENAME, 'r') as fin:
        park_list = loads(fin.read())

    latlon_transfer = LatLonToTWD97()
    latWGS = radians(float(lat))
    lonWGS = radians(float(lon))
    latTWD, lonTWD = latlon_transfer.convert(latWGS, lonWGS)

    f = lambda x: sqrt( \
        (latTWD - float(x['tw97x'])) ** 2.0 + \
        (lonTWD - float(x['tw97y'])) ** 2.0)
    park_list = filter(lambda x: f(x) < 3000.0, park_list)
    park_list.sort(key=f)

    if len(park_list) > 4:
        park_list = park_list[0:4]

    return park_list

def fetch_yahoo_movie_info(name):
    name = name.decode('utf8')
    with open(_THEATER_LIST_FILENAME, 'r') as fin:
        theater_list = loads(fin.read())

    for index, theater in enumerate(theater_list):
        theater_list[index].append(0)
        for ch in name:
            if ch in theater[0]:
                theater_list[index][-1] += 1

    theater_list.sort(key=lambda theater: theater[-1], reverse=True)

    url = theater_list[0][2]
    parser = HTMLParser(encoding='utf-8')
    root = parse(url, parser).getroot()

    path = '//div[@id="ymvttr"]//div[@class="item clearfix"]'
    movie_blocks = root.xpath(path)

    movie_list = []
    for block in movie_blocks:
        link = block.find('.//h4/a')
        img = block.find('.//img')
        times = block.iterfind('.//span[@class="tmt"]')
        movie_list.append({
            'name': link.text,
            'url': link.get('href'),
            'img': img.get('src'),
            'time': [time.text for time in times]
        })

    return movie_list

def fetch_yahoo_weather_info(lat, lon, address, date):
    if (lat is None or lon is None):
        lat, lon = _get_lat_lon(address)

    if (lat is None or lon is None):
        return None

    if date != '':
        date = date[0:3] + ' ' + date[date.find('/') + 1:]

    woeid = _get_woeid(lat, lon)
    url = _WEATHER_RSS_TEMP_URL.format(woeid)
    rss = urlopen(url).read()

    match = search('/forecast/([^/]+)_c.html', rss)
    location_id = match.group(1)

    url = _WEATHER_TEMP_URL.format(location_id)
    root = parse(url).getroot()
    daypart_blocks = root.xpath('//div[@class="wx-daypart"]')
    for block in daypart_blocks:
        if (date != '' and date != block.find('./h3/span').text):
            continue

        temp_high = block.find('./div/p[@class="wx-temp"]').text
        temp_high = int(round((float(temp_high) - 32.0) * 5 / 9)) 
        temp_low = block.find('./div/p[@class="wx-temp-alt"]').text
        temp_low = int(round((float(temp_low) - 32.0) * 5 / 9)) 

        info = {
            'img': block.find('./div/img').get('src'),
            'temp_high': temp_high,
            'temp_low': temp_low,
            'url': _YWEATHER_BASE_URL + '/' + location_id
        }
        return info

    return None

