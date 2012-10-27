/**********************************************************
 *  Author:
 *  -  Chun-Yuan Cheng <https://github.com/bryanyuan2/>
 *  -  Ken Lin <https://github.com/blackcan>
 *  -  Chi-En Wu <https://github.com/jason2506>
 *********************************************************/

(function() {

/****************************
 *  Constance(s)
 ***************************/

const SERVER_BASE_URL = 'http://127.0.0.1:8080/';
const IPEEN_BASE_URL = 'http://tw.ipeen.lifestyle.yahoo.net';
const TITLES = {
    'source': '資料來源',
    'life_plus': 'Yahoo! 生活+',

    'basic_info': '基本資料',
    'comments': '網友評論',
    'photos': '相關照片',
    'theater': '今日電影時刻表',
    'rel_shop': '同類型商家',
    'near_shop': '附近商家',
    'parking': '停車資訊',

    'weather': '活動當天氣象預測'
};

const IDS = {
    'source': 'yahook_source',

    'basic_info': 'yahook_basic_info_section',
    'comments': 'yahook_comments_section',
    'photos': 'yahook_photos_section',
    'theater': 'yahook_theater_section',
    'rel_shop': 'yahook_ref_shop_section',
    'near_shop': 'yahook_near_shop_section',
    'parking': 'yahook_parking_section',

    'weather': 'yahook_weather_section'
};

const THEATER_KEYWORDS = [
    '影城',
    '電影院',
    '威秀',
    '戲院',
    '喜滿客'
];

/****************************
 *  Helper Function(s)
 ***************************/

var addSection = function(name, anchor) {
    var header = $('<div class="uiHeader uiHeaderTopAndBottomBorder infoSectionHeader uiHeaderSection">')
        .append($('<h4 class="uiHeaderTitle yahook_section_title">')
            .text(TITLES[name]));

    var body = $('<div class="phs yahook_content">')
        .append($('<div class="yahook_loading">')
            .hide().fadeIn());

    var section = $('<div>')
        .attr('id', IDS[name])
        .append(header)
        .append(body);

    anchor.before(section);
};

var addSideSection = function(name, anchor) {
    var header = $('<div class="uiHeader uiHeaderTopBorder mbs pbs uiSideHeader">')
        .append($('<h6 class="uiHeaderTitle yahook_section_title">')
            .text(TITLES[name]));

    var body = $('<div class="phs yahook_content">')
        .append($('<div class="yahook_loading">')
            .hide().fadeIn());

    var section = $('<div>')
        .attr('id', IDS[name])
        .append(header)
        .append(body);

    anchor.before(section);
};

var appendSource = function(url) {
    var span = $('<span class="fsm fwn fcg">')
        .attr('id', IDS['source'])
        .append(' · ' + TITLES['source'] + ': ')
        .append($('<a>')
            .attr('href', IPEEN_BASE_URL + url)
            .text(TITLES['life_plus'] + ' (' + $('.profileName').text() + ')'));
    $('.fbProfileByline').append(span);
};

var appendLinks = function(obj, name) {
    var container = $('#' + IDS[name] + ' .yahook_content');
    var ul = $('<ul class="yahook_link_list">').appendTo(container);
    for (var index in obj) {
        var title = obj[index]['title'];
        var href = obj[index]['href'];
        ul.append($('<li>')
            .append($('<a>')
                .attr('href', href)
                .text(title))
            .hide().fadeIn());
    }
};

var appendBasicInfo = function(obj) {
    var container = $('#' + IDS['basic_info'] + ' .yahook_content');
    var table = $('<table class="uiInfoTable mts profileInfoTable pageInfoTable uiInfoTableFixed noBorder">').appendTo(container);
    for (var index in obj) {
        var tokens = obj[index].split('：');
        var label = tokens[0].replace(/\s*/g, '');
        var value = tokens[1].replace(/\(\d{1,3}\)/g,', ');
        table.append($('<tr>')
            .append($('<th class="label">')
                .text(label))
            .append($('<td class="value">')
                .text(value))
            .hide().fadeIn());
    }
};

var appendComments = function(obj) {
    appendLinks(obj, 'comments');
};

var appendPhotos = function(obj) {
    var container = $('#' + IDS['photos'] + ' .yahook_content');
    var photo_block = $('<div class="fbProfilePhotoBar">')
        .appendTo(container);

    var name = $('.profileName').text();
    for (var index in obj) {
        photo_block.append($('<a>')
            .attr('href', obj[index].replace('200x200', '450x450'))
            .attr('rel', 'shadowbox')
            .attr('title', name)
            .append($('<img class="yahook_image">')
                .attr('src', obj[index])));
    }

    Shadowbox.init({'overlayOpacity':'0.8'});
};

var appendTheater = function(obj) {
    var container = $('#' + IDS['theater'] + ' .yahook_content');
    var table = $('<table id="yahook_theater_table">').appendTo(container);
    for (var index in obj) {
        name = obj[index]['name'];
        url = obj[index]['url'];
        img = obj[index]['img'];
        time = obj[index]['time'].join(' | ');

        table.append($('<tr>')
            .append($('<td>')
                .append($('<a>')
                    .attr('href', url)
                    .append($('<img>')
                        .attr('src', img))))
            .append($('<td class="yahook_movie_info">')
                .append($('<a>')
                    .attr('href', url)
                    .text(name))
                .append(time))
            .hide().fadeIn());
    }
};

var appendMoreShops = function(obj) {
    appendLinks(obj['rel'], 'rel_shop');
    appendLinks(obj['near'], 'near_shop');
};

var appendParking = function(obj) {
    var container = $('#' + IDS['parking'] + ' .yahook_content');
    for (var index in obj) {
        var address = obj[index]['address']
        var name = obj[index]['name'];
        var totalBike = obj[index]['totalBike'];
        var totalCar = obj[index]['totalCar'];
        var totalMotor = obj[index]['totalMotor'];

        container.append($('<ul class="yahook_parking_info">')
            .append($('<li class="yahook_label">')
                .text(name))
            .append($('<li>')
                .append($('<a>')
                    .attr('href', 'http://tw.maps.yahoo.com/?addr='
                        + encodeURI(address) + '&ei=utf8')
                    .text(address)))
            .append($('<li>')
                .text('總汽車位: ' + totalCar))
            .append($('<li>')
                .text('總摩托車位: ' + totalMotor))
            .append($('<li>')
                .text('總腳踏車位: ' + totalBike)));
    }
};

var appendWeather = function(obj) {
    var temp_low = obj['temp_low'];
    var temp_high = obj['temp_high'];
    var temp_img = obj['img'];
    var temp_url = obj['url'];
    if (temp_img.length <= 3) return;

    var container = $('#' + IDS['weather'] + ' .yahook_content');
    container.append($('<a class="uiHeaderActions yahook_weather_link">')
        .attr('href', temp_url)
        .append($('<div class="ego_unit">')
            .append($('<div class="_4u8">')
                .append($('<img class="yahook_weather_image">')
                    .attr('src', temp_img))
                .append($('<div class="yahook_weather_widget">')
                    .append($('<span class="yahook_weather_high_temp">')
                        .text(temp_high + '°C'))
                    .append($('<span class="yahook_weather_low_temp">')
                        .text(temp_low + '°C'))))));
};

var getGeoInfo = function() {
    var url = $('.mtm').find('a').attr('href');
    var match = url.match(/(\d{1,3}\.\d{1,20})_(\d{1,3}\.\d{1,20})/);
    return {lat: match[1], lon:match[2]};
};

var query = function(url, data, handler) {
    return $.get(SERVER_BASE_URL + url, data, handler);
};

/****************************
 *  Page Handler(s)
 ***************************/

var handleCheckinPage = function() {
    var sectionAnchor = $('#pagelet_info');
    var sideSectionAnchor = $('#tips_main_box');

    addSection('basic_info', sectionAnchor);
    addSection('comments', sectionAnchor);
    addSection('photos', sectionAnchor);
    addSideSection('near_shop', sideSectionAnchor);
    addSideSection('rel_shop', sideSectionAnchor);
    addSideSection('parking', sideSectionAnchor);

    var name = $('.profileName').text();
    query('search', {query: name}, function(target_url) {
        appendSource(target_url);

        var geoInfo = getGeoInfo();
        query_data = {
            url: target_url,
            lat: geoInfo['lat'],
            lon: geoInfo['lon']
        };

        query('info', query_data, function(data) {
            var isTheater = THEATER_KEYWORDS.some(
                function(kw) { return name.search(kw) != -1 });
            if (isTheater) {
                addSection('theater', sectionAnchor);
                query('theater', {name: name}, function(data) {
                    var obj = jQuery.parseJSON(data);
                    appendTheater(obj['movies']);
                });
            }

            var obj = jQuery.parseJSON(data);
            appendBasicInfo(obj['basic_info']);
            appendComments(obj['comments']);
            appendPhotos(obj['photos']);
            appendMoreShops(obj['more_shop']);
            appendParking(obj['parking']);
        }).error(function() {
            var msg = '<div class="yahook_noinfo">查無相關資訊</div>';
            $('.yahook_loading').after(msg);
        }).complete(function() {
            $('.yahook_loading').fadeOut(500);
        });
    });
};

var handleEventsPage = function() {
    var anchor = $('.ego_section');
    addSideSection('weather', anchor);

    var map_url = $('a[href^="http://bing.com/maps/"]').attr('href');
    var match = map_url.match(/(\d{1,3}\.\d{1,20})_(\d{1,3}\.\d{1,20})/);
    if (!match) return;

    var date_url = $('#pagelet_event_details a').attr('href');
    var date = date_url.match(/[A-Z]\w{3,20}\/\d{1,2}/)[0];
    var address = $('.fbEventLocationInfo').text();

    var query_data = {
        address: address,
        date: date,
        lat: match[1],
        lon: match[2]
    };

    query('weather', query_data, function(data){
        var obj = jQuery.parseJSON(data);
        appendWeather(obj);
    }).complete(function() {
        $('.yahook_loading').fadeOut(500);
    });
};

/****************************
 *  Entry Point
 ***************************/

$(document).ready(function() {
    var target = window.location.pathname.match(/\/(\w+)\//)[1];
    switch (target) {
        case 'pages': handleCheckinPage(); break;
        case 'events': handleEventsPage(); break;
    }
});

})();
