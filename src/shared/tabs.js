/*
This file is part of Talkie -- text-to-speech browser extension button.
<https://github.com/joelpurra/talkie>

Copyright (c) 2016, 2017 Joel Purra <https://joelpurra.com/>

Talkie is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Talkie is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Talkie.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
    log,
} from "../shared/log";

import {
    promiseTry,
} from "../shared/promise";

export const getBackgroundPage = () => new Promise(
    (resolve, reject) => {
        try {
            browser.runtime.getBackgroundPage((backgroundPage) => {
                // https://developer.browser.com/extensions/runtime.html#method-getBackgroundPage
                if (browser.runtime.lastError) {
                    return reject(browser.runtime.lastError);
                }

                if (backgroundPage) {
                    return resolve(backgroundPage);
                }

                return resolve(null);
            });
        } catch (error) {
            return reject(error);
        }
    }
);

export const getCurrentActiveTab = () => new Promise(
    (resolve, reject) => {
        try {
            const queryOptions = {
                "active": true,
                "currentWindow": true,
            };

            browser.tabs.query(queryOptions, (tabs) => {
                // https://developer.browser.com/extensions/tabs#method-query
                if (browser.runtime.lastError) {
                    return reject(browser.runtime.lastError);
                }

                const singleTabResult = tabs.length === 1;

                const tab = tabs[0] || null;

                log("getCurrentActiveTab", tabs, tab, singleTabResult);

                if (singleTabResult) {
                    return resolve(tab);
                }

                return resolve(null);
            });
        } catch (error) {
            return reject(error);
        }
    }
);

export const getCurrentActiveTabId = () => getCurrentActiveTab()
    .then((activeTab) => {
        if (activeTab) {
            return activeTab.id;
        }

        // NOTE: some tabs can't be retreived.
        return null;
    });

export const isCurrentPageInternalToTalkie = () => promiseTry(
    () => getCurrentActiveTab()
        .then((tab) => {
            if (tab) {
                const url = tab.url;

                if (typeof url === "string" && url.length > 0) {
                    if (url.startsWith("chrome-extension://") && url.endsWith("/src/popup.html")) {
                        return true;
                    }

                    return false;
                }

                return false;
            }

            // NOTE: no active tab probably means it's a very special page.
            return true;
        })
);

const getCurrentActiveNormalLoadedTab = () => new Promise(
    (resolve, reject) => {
        try {
            const queryOptions = {
                "active": true,
                "currentWindow": true,
                "windowType": "normal",
                "status": "complete",
            };

            browser.tabs.query(queryOptions, (tabs) => {
                // https://developer.browser.com/extensions/tabs#method-query
                if (browser.runtime.lastError) {
                    return reject(browser.runtime.lastError);
                }

                const singleTabResult = tabs.length === 1;

                const tab = tabs[0] || null;

                log("getCurrentActiveNormalLoadedTab", tabs, tab, singleTabResult);

                if (singleTabResult) {
                    return resolve(tab);
                }

                return resolve(null);
            });
        } catch (error) {
            return reject(error);
        }
    }
);

export const canTalkieRunInTab = () => promiseTry(
    () => getCurrentActiveNormalLoadedTab()
        .then((tab) => {
            if (tab) {
                const url = tab.url;

                if (typeof url === "string" && url.length > 0) {
                    if (url.startsWith("chrome://")) {
                        return false;
                    }

                    if (url.startsWith("vivaldi://")) {
                        return false;
                    }

                    if (url.startsWith("chrome-extension://")) {
                        return false;
                    }

                    if (url.startsWith("https://chrome.google.com/")) {
                        return false;
                    }

                    if (url.startsWith("about:")) {
                        return false;
                    }

                    return true;
                }

                return false;
            }

            return false;
        })
);
