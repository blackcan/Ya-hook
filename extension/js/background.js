/**********************************************************
 *  Author:
 *  -  Chun-Yuan Cheng <https://github.com/bryanyuan2/>
 *  -  Ken Lin <https://github.com/blackcan>
 *  -  Chi-En Wu <https://github.com/jason2506>
 *********************************************************/

var tabURL = {};
chrome.tabs.onUpdated.addListener(function (tabID, changeInfo, tab) {
    if (tab.url != tabURL[tabID]) {
        if (tab.url.indexOf('www.facebook.com/pages/') > -1 ||
            tab.url.indexOf('www.facebook.com/events/') > -1) {
		    chrome.tabs.reload(tab.id);
        }

        tabURL[tabID] = tab.url;
    }
});

