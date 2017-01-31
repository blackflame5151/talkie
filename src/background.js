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

/* global chrome:false, window:false, console:false, Promise:false, extensionShortName:false, log:false, logError:false, SpeechSynthesisUtterance:false */

// https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#tts-section
// https://dvcs.w3.org/hg/speech-api/raw-file/tip/speechapi.html#examples-synthesis
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API#Speech_synthesis
log("Start", "Loading code");

log("Locale", chrome.i18n.getMessage("@@ui_locale"));

const MAX_UTTERANCE_TEXT_LENGTH = 100;

const shallowCopy = (...objs) => Object.assign({}, ...objs);

const last = (indexable) => indexable[indexable.length - 1];

const flatten = (deepArray) => {
    if (!Array.isArray(deepArray)) {
        return deepArray;
    }

    if (deepArray.length === 0) {
        return [];
    }

    if (deepArray.length === 1) {
        return [].concat(flatten(deepArray[0]));
    }

    return [].concat(flatten(deepArray[0])).concat(flatten(deepArray.slice(1)));
};

const isUndefinedOrNullOrEmptyOrWhitespace = (str) => !(str && typeof str === "string" && str.length > 0 && str.trim().length > 0);

const getRandomInt = (min, max) => {
    if (typeof min === "undefined") {
        min = Number.MIN_VALUE;
        max = Number.MAX_VALUE;
    }

    if (typeof max === "undefined") {
        max = min;
        min = 0;
    }

    if (max === min) {
        return min;
    }

    if (min > max) {
        const t = min;
        min = max;
        max = t;
    }

    return min + Math.floor(Math.random() * (max - min));
};

const promiseTry = (fn) => new Promise(
    (resolve, reject) => {
        try {
            const result = fn();

            resolve(result);
        } catch (error) {
            reject(error);
        }
    }
);

const promiseSeries = (promises, state) => promiseTry(
    () => {
        if (promises.length === 0) {
            return undefined;
        }

        const first = promises[0];

        if (promises.length === 1) {
            return Promise.resolve(first(state));
        }

        const rest = promises.slice(1);

        return Promise.resolve(first(state))
            .then((result) => promiseSeries(rest, result));
    }
);

const splitTextToParagraphs = (text) => {
    // NOTE: in effect discarding empty paragraphs.
    return text.split(/\n+/);
};

const splitTextToSentencesOfMaxLength = (text, maxPartLength) => {
    // NOTE: in effect merging multiple spaces in row to a single space.
    const spacedTextParts = text.split(/ +/);

    const naturalPauseRx = /(^--?$|[.,!?:;]$)/;

    const textParts = spacedTextParts.reduce((newParts, spacedTextPart) => {
        const appendToText = (ttt) => {
            if (last(newParts) === "") {
                newParts[newParts.length - 1] = ttt;
            } else {
                newParts[newParts.length - 1] += " " + ttt;
            }
        };

        const appendPart = (ttt) => {
            newParts[newParts.length] = ttt;
        };

        if (naturalPauseRx.test(spacedTextPart)) {
            appendToText(spacedTextPart);

            appendPart("");
        } else if ((last(newParts).length + 1 + spacedTextPart.length) < maxPartLength) {
            appendToText(spacedTextPart);
        } else {
            appendPart(spacedTextPart);
        }

        return newParts;
    }, [""]);

    // NOTE: cleaning empty strings "just in case".
    const cleanTextParts = textParts.filter((textPart) => textPart.trim().length > 0);

    return cleanTextParts;
};

const noTextSelectedMessage = {
    text: chrome.i18n.getMessage("noTextSelectedMessage"),
    effectiveLanguage: chrome.i18n.getMessage("@@ui_locale"),
};

const noVoiceForLanguageDetectedMessage = {
    text: chrome.i18n.getMessage("noVoiceForLanguageDetectedMessage"),
    effectiveLanguage: chrome.i18n.getMessage("noVoiceForLanguageDetectedMessageLanguage"),
};

const notAbleToSpeakTextFromThisSpecialTab = {
    text: chrome.i18n.getMessage("notAbleToSpeakTextFromThisSpecialTab"),
    effectiveLanguage: chrome.i18n.getMessage("@@ui_locale"),
};

const setup = () => promiseTry(
    () => {
        log("Start", "Pre-requisites check");

        if (!("speechSynthesis" in window) || typeof window.speechSynthesis.getVoices !== "function" || typeof window.speechSynthesis.speak !== "function") {
            throw new Error("The browser does not support speechSynthesis.");
        }

        if (!("SpeechSynthesisUtterance" in window)) {
            throw new Error("The browser does not support SpeechSynthesisUtterance.");
        }

        log("Done", "Pre-requisites check");
    })
    .then(() => new Promise(
        (resolve, reject) => {
            try {
                log("Start", "Speech synthesizer check");

                // NOTE: the speech synthesizer can only be used after the voices have been loaded.
                const synthesizer = window.speechSynthesis;

                const handleVoicesChanged = () => {
                    delete synthesizer.onerror;
                    delete synthesizer.onvoiceschanged;

                    log("Variable", "synthesizer", synthesizer);

                    log("Done", "Speech synthesizer check");

                    return resolve(synthesizer);
                };

                const handleError = (event) => {
                    delete synthesizer.onerror;
                    delete synthesizer.onvoiceschanged;

                    logError("Error", "Speech synthesizer check", event);

                    return reject(null);
                };

                synthesizer.onerror = handleError;
                synthesizer.onvoiceschanged = handleVoicesChanged;
            } catch (error) {
                return reject(error);
            }
        }
    ))
    .then((synthesizer) => {
        log("Start", "Voices check");

        const voices = synthesizer.getVoices();

        if (!voices || voices.length === 0) {
            throw new Error("The browser does not have any voices installed.");
        }

        log("Variable", "voices[]", voices.length, voices.map(voice => {
            return {
                name: voice.name,
                lang: voice.lang,
            };
        }));

        log("Done", "Voices check");

        return synthesizer;
    })
    .then((synthesizer) => {
        const unload = () => {
            log("Start", "Unloading");

            return executeGetTalkieIsSpeakingId()
                .then((talkieIsSpeakingId) => {
                    // Clear all text if Talkie was speaking.
                    if (typeof talkieIsSpeakingId === "number") {
                        return executeSetTalkieIsNotSpeaking()
                            .then(() => {
                                synthesizer.cancel();

                                return undefined;
                            });
                    }

                    return undefined;
                })
                .then(() => {
                    // Reset the system to resume playback, just to be nice to the world.
                    synthesizer.resume();

                    log("Done", "Unloading");

                    return undefined;
                });
        };

        chrome.runtime.onSuspend.addListener(unload);

        return synthesizer;
    }
);

const speakPartOfText = (synthesizer, textPart, language) => new Promise(
    (resolve, reject) => {
        try {
            log("Start", `Speak text part (length ${textPart.length}): "${textPart}"`);

            // executeLogToPage(`Speaking text part: ${textPart}`);

            const utterance = new SpeechSynthesisUtterance(textPart);

            // NOTE: while there might be more than one voice for the particular lanugage, let the browser pick which one.
            utterance.lang = language;

            // TODO: options for per-language voice , pitch, rate?
            // utterance.pitch = [0,2];
            // utterance.rate = [0.1,10];
            // utterance.voice = synthesizer.getVoices()[4];

            log("Variable", "utterance", utterance);

            const handleEnd = (event) => {
                delete utterance.onend;
                delete utterance.onerror;

                log("End", `Speak text part (length ${textPart.length}) spoken in ${event.elapsedTime} milliseconds.`);

                return resolve();
            };

            const handleError = (event) => {
                delete utterance.onend;
                delete utterance.onerror;

                logError("Error", `Speak text part (length ${textPart.length})`, event);

                return reject();
            };

            utterance.onend = handleEnd;
            utterance.onerror = handleError;

            // The actual act of speaking the text.
            synthesizer.speak(utterance);

            if (synthesizer.paused) {
                synthesizer.resume();
            }

            log("Variable", "synthesizer", synthesizer);

            log("Done", `Speak text part (length ${textPart.length})`);
        } catch (error) {
            return reject(error);
        }
    }
);

const fallbackSpeak = speakPartOfText;

const speak = (synthesizer, text, language) => executeAddOnBeforeUnloadHandlers()
    .then(() => promiseTry(
        () => {
            const talkieIsSpeakingId = getRandomInt(10000, 99999);

            return executeSetTalkieIsSpeakingId(talkieIsSpeakingId)
                .then(() => promiseTry(
                    () => {
                        log("Start", `Speak text (length ${text.length}): "${text}"`);

                        executeLogToPage(`Speaking text: ${text}`);

                        const paragraphs = splitTextToParagraphs(text);
                        const cleanTextParts = paragraphs.map((paragraph) => splitTextToSentencesOfMaxLength(paragraph, MAX_UTTERANCE_TEXT_LENGTH));
                        const textParts = flatten(cleanTextParts);

                        const textPartsPromises = textParts.map((textPart) => () => {
                            return executeGetTalkieIsSpeakingId()
                                .then((currentSpeakingId) => {
                                    if (currentSpeakingId === talkieIsSpeakingId) {
                                        return speakPartOfText(synthesizer, textPart, language);
                                    }

                                    return undefined;
                                });
                        });

                        return promiseSeries(textPartsPromises);
                    }
        ));
        }
    ))
    .then(() => log("Done", `Speak text (length ${text.length})`))
    .then(() => executeSetTalkieIsNotSpeaking())
    .then(() => executePlugOnce()
);

const executeScriptInTopFrame = (code) => new Promise(
    (resolve, reject) => {
        try {
            log("About to execute code in page context", code);

            chrome.tabs.executeScript(
                {
                    allFrames: false,
                    matchAboutBlank: false,
                    code: code,
                },
                (result) => {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }

                    return resolve(result);
                }
            );
        } catch (error) {
            return reject(error);
        }
    }
);

const executeScriptInAllFrames = (code) => new Promise(
    (resolve, reject) => {
        try {
            log("About to execute code in page context", code);

            chrome.tabs.executeScript(
                {
                    allFrames: true,
                    matchAboutBlank: true,
                    code: code,
                },
                (result) => {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }

                    return resolve(result);
                }
            );
        } catch (error) {
            return reject(error);
        }
    }
);

const executeGetTalkieIsSpeakingIdCode = "window.talkieIsSpeaking;";
const executeGetTalkieIsSpeakingId = () => executeScriptInTopFrame(executeGetTalkieIsSpeakingIdCode)
    .then((talkieIsSpeaking) => {
        const num = parseInt(talkieIsSpeaking, 10);

        if (!isNaN(num)) {
            return num;
        }

        return talkieIsSpeaking;
    });

const executeSetTalkieIsSpeakingIdCode = "window.talkieIsSpeaking = %i;";
const executeSetTalkieIsSpeakingId = (id) => executeScriptInTopFrame(executeSetTalkieIsSpeakingIdCode.replace("%i", id));

const executeSetTalkieIsNotSpeakingCode = "window.talkieIsSpeaking = null;";
const executeSetTalkieIsNotSpeaking = () => executeScriptInTopFrame(executeSetTalkieIsNotSpeakingCode);

const executeAddOnBeforeUnloadHandlersCode = "window.talkieIsSpeaking === undefined && window.addEventListener(\"beforeunload\", function () { typeof window.talkieIsSpeaking === \"number\" && window.speechSynthesis.cancel(); });";
const executeAddOnBeforeUnloadHandlers = () => executeScriptInTopFrame(executeAddOnBeforeUnloadHandlersCode);

const executeGetFramesSelectionTextAndLanguageCode = "function talkieGetParentElementLanguages(element) { return [].concat(element && element.getAttribute(\"lang\")).concat(element.parentElement && talkieGetParentElementLanguages(element.parentElement)); }; var talkieSelectionData = { text: document.getSelection().toString(), htmlTagLanguage: document.getElementsByTagName(\"html\")[0].getAttribute(\"lang\"), parentElementsLanguages: talkieGetParentElementLanguages(document.getSelection().rangeCount > 0 && document.getSelection().getRangeAt(0).startContainer.parentElement) }; talkieSelectionData";
const executeGetFramesSelectionTextAndLanguage = () => executeScriptInAllFrames(executeGetFramesSelectionTextAndLanguageCode).then((framesSelectionTextAndLanguage) => {
    log("Variable", "framesSelectionTextAndLanguage", framesSelectionTextAndLanguage);

    return framesSelectionTextAndLanguage;
});

const variableToSafeString = (v) => {
    if (v === undefined) {
        return "undefined";
    }

    if (v === null) {
        return "null";
    }

    return v.toString();
};

const executeLogToPageCode = "console.log(%a);";

const executeLogToPage = (...args) => promiseTry(
    () => {
        const now = new Date().toISOString();

        const logValues = [
            now,
            extensionShortName,
            ...args.map((arg) => variableToSafeString(arg)),
        ]
            .map((arg) => arg.replace(/\\/g, "\\\\"))
            .map((arg) => arg.replace(/"/g, "\\\""))
            .map((arg) => arg.replace(/\n/g, "\\\\n"))
            .map((arg) => `"${arg}"`)
            .join(", ");

        const code = executeLogToPageCode.replace("%a", logValues);

        return executeScriptInTopFrame(code);
    }
);
const executeLogToPageWithColorCode = "console.log(%a);";

const executeLogToPageWithColor = (...args) => promiseTry(
    () => {
        const now = new Date().toISOString();

        const logValues = "\"" + [
            now,
            extensionShortName,
            "%c",
            ...args,
            " ",
        ]
            .map((arg) => variableToSafeString(arg))
            .map((arg) => arg.replace(/\\/g, "\\\\"))
            .map((arg) => arg.replace(/"/g, "\\\""))
            .map((arg) => arg.replace(/\n/g, "\\\\n"))
            .map((arg) => `${arg}`)
            .join(" ") + "\", \"background: #007F41; color: #FFFFFF; padding: 0.3em;\"";

        const code = executeLogToPageWithColorCode.replace("%a", logValues);

        return executeScriptInTopFrame(code);
    }
);

const executePlug = () => promiseTry(
    () => {
        return Promise.resolve()
            .then(() => executeLogToPageWithColor("Thank you for using Talkie!"))
            .then(() => executeLogToPageWithColor("https://chrome.google.com/webstore/detail/talkie/enfbcfmmdpdminapkflljhbfeejjhjjk"))
            .then(() => executeLogToPageWithColor("Created by Joel Purra. Released under GNU General Public License version 3.0 (GPL-3.0)"))
            .then(() => executeLogToPageWithColor("https://joelpurra.com/"))
            .then(() => executeLogToPageWithColor("If you like Talkie, send a link to your friends -- and consider donating to support further open source development."))
            .then(() => executeLogToPageWithColor("https://joelpurra.com/donate/"));
    }
);

const executeGetTalkieWasPluggedCode = "window.talkieWasPlugged;";
const executeGetTalkieWasPlugged = () => executeScriptInTopFrame(executeGetTalkieWasPluggedCode);

const executeSetTalkieWasPluggedCode = "window.talkieWasPlugged = true;";
const executeSetTalkieWasPlugged = () => executeScriptInTopFrame(executeSetTalkieWasPluggedCode);

const executePlugOnce = () => {
    return executeGetTalkieWasPlugged()
        .then((talkieWasPlugged) => {
            if (talkieWasPlugged && talkieWasPlugged.toString() !== "true") {
                return executePlug()
                    .then(() => executeSetTalkieWasPlugged());
            }

            return true;
        });
};

const detectPageLanguage = () => new Promise(
    (resolve, reject) => {
        try {
            chrome.tabs.detectLanguage((language) => {
                // https://developer.chrome.com/extensions/tabs#method-detectLanguage
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }

                log("detectPageLanguage", "Browser detected primary page language", language);

                // The language fallback value is "und", so treat it as no language.
                if (!language || typeof language !== "string" || language === "und") {
                    return resolve(null);
                }

                return resolve(language);
            });
        } catch (error) {
            return reject(error);
        }
    }
);

const getCurrentActiveTab = () => new Promise(
    (resolve, reject) => {
        try {
            const queryOptions = {
                "active": true,
                "currentWindow": true,
                "windowType": "normal",
                "status": "complete",
            };

            chrome.tabs.query(queryOptions, (tabs) => {
                // https://developer.chrome.com/extensions/tabs#method-query
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
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

const canTalkieRunInTab = () => promiseTry(
    () => getCurrentActiveTab()
        .then((tab) => {
            if (tab) {
                const url = tab.url;

                if (typeof url === "string" && url.length > 0) {
                    if (url.startsWith("chrome://")) {
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

const detectTextLanguage = (text) => new Promise(
    (resolve, reject) => {
        try {
            if (!("detectLanguage" in chrome.i18n)) {
                // NOTE: text-based language detection is only used as a fallback.
                log("detectTextLanguage", "Browser does not support detecting text language");

                return resolve(null);
            }

            chrome.i18n.detectLanguage(text, (result) => {
                // https://developer.chrome.com/extensions/i18n#method-detectLanguage
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }

                // The language fallback value is "und", so treat it as no language.
                if (
                    !result.isReliable
                    || !result.languages
                    || !(result.languages.length > 0)
                    || typeof result.languages[0].language !== "string"
                    || !(result.languages[0].language.trim().length > 0)
                    || result.languages[0].language === "und"
                ) {
                    // NOTE: text-based language detection is only used as a fallback.
                    log("detectTextLanguage", "Browser did not detect reliable text language", result);

                    return resolve(null);
                }

                const primaryDetectedTextLanguage = result.languages[0].language;

                log("detectTextLanguage", "Browser detected reliable text language", result, primaryDetectedTextLanguage);

                return resolve(primaryDetectedTextLanguage);
            });
        } catch (error) {
            return reject(error);
        }
    }
);

const cleanupSelections = (allVoices, detectedPageLanguage, selections) => promiseTry(
    () => {
        const isNonNullObject = (selection) => !!selection && typeof selection === "object";

        const hasValidText = (selection) => !isUndefinedOrNullOrEmptyOrWhitespace(selection.text);

        const trimText = (selection) => {
            const copy = shallowCopy(selection);

            copy.text = copy.text.trim();

            return copy;
        };

        const selectionsWithValidText = selections
        .filter(isNonNullObject)
        .filter(hasValidText)
        .map(trimText)
        .filter(hasValidText);

        return selectionsWithValidText;
    })
    .then((selectionsWithValidText) => Promise.all(
        selectionsWithValidText.map(
            (selection) => {
                const copy = shallowCopy(selection);

                return detectTextLanguage(copy.text)
                    .then((detectedTextLanguage) => {
                        copy.detectedTextLanguage = detectedTextLanguage;

                        return copy;
                    });
            })
        )
    )
    .then((selectionsWithValidTextAndDetectedLanguage) => {
        const isKnownVoiceLanguage = (elementLanguage) => allVoices.some((voice) => voice.lang.startsWith(elementLanguage));

        // https://www.iso.org/obp/ui/#iso:std:iso:639:-1:ed-1:v1:en
        // https://en.wikipedia.org/wiki/ISO_639-1
        // https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
        // http://xml.coverpages.org/iso639a.html
        // NOTE: discovered because Twitter seems to still use "iw".
        const iso639Dash1Aliases1988To2002 = {
            "in": "id",
            "iw": "he",
            "ji": "yi",
        };

        const mapIso639Aliases = (language) => {
            return iso639Dash1Aliases1988To2002[language] || language;
        };

        const isValidString = (str) => !isUndefinedOrNullOrEmptyOrWhitespace(str);

        const cleanupLanguagesArray = (languages) => {
            const copy = (languages || [])
            .filter(isValidString)
            .map(mapIso639Aliases)
            .filter(isKnownVoiceLanguage);

            return copy;
        };

        const cleanupParentElementsLanguages = (selection) => {
            const copy = shallowCopy(selection);

            copy.parentElementsLanguages = cleanupLanguagesArray(copy.parentElementsLanguages);

            return copy;
        };

        const getMoreSpecificLanguagesWithPrefix = (prefix) => {
            return (language) => language.startsWith(prefix) && language.length > prefix.length;
        };

        const setEffectiveLanguage = (selection) => {
            const copy = shallowCopy(selection);

            const detectedLanguages = [
                copy.detectedTextLanguage,
                copy.parentElementsLanguages[0] || null,
                copy.htmlTagLanguage,
                detectedPageLanguage,
            ];

            log("setEffectiveLanguage", "detectedLanguages", detectedLanguages);

            const cleanedLanguages = cleanupLanguagesArray(detectedLanguages);

            log("setEffectiveLanguage", "cleanedLanguages", cleanedLanguages);

            const primaryLanguagePrefix = cleanedLanguages[0] || null;

            log("setEffectiveLanguage", "primaryLanguagePrefix", primaryLanguagePrefix);

            // NOTE: if there is a more specific language with the same prefix among the detected languages, prefer it.
            const cleanedLanguagesWithPrimaryPrefix = cleanedLanguages.filter(getMoreSpecificLanguagesWithPrefix(primaryLanguagePrefix));

            log("setEffectiveLanguage", "cleanedLanguagesWithPrimaryPrefix", cleanedLanguagesWithPrimaryPrefix);

            const effectiveLanguage = cleanedLanguagesWithPrimaryPrefix[0] || cleanedLanguages[0] || null;

            log("setEffectiveLanguage", "effectiveLanguage", effectiveLanguage);

            copy.effectiveLanguage = effectiveLanguage;

            executeLogToPage("Language", "Selected text language:", copy.detectedTextLanguage);
            executeLogToPage("Language", "Selected text element language:", copy.parentElementsLanguages[0] || null);
            executeLogToPage("Language", "HTML tag language:", copy.htmlTagLanguage);
            executeLogToPage("Language", "Detected page language:", detectedPageLanguage);
            executeLogToPage("Language", "Effective language:", copy.effectiveLanguage);

            return copy;
        };

        const mapResults = (selection) => {
            return {
                text: selection.text,
                effectiveLanguage: selection.effectiveLanguage,
            };
        };

        const fallbackMessageForNoLanguageDetected = (selection) => {
            if (selection.effectiveLanguage === null) {
                return noVoiceForLanguageDetectedMessage;
            }

            return selection;
        };

        const selectionsWithValidTextAndDetectedLanguageAndEffectiveLanguage = selectionsWithValidTextAndDetectedLanguage.map(cleanupParentElementsLanguages)
        .map(setEffectiveLanguage)
        .map(fallbackMessageForNoLanguageDetected)
        .map(mapResults);

        if (selectionsWithValidTextAndDetectedLanguageAndEffectiveLanguage.length === 0) {
            log("Empty filtered selections");

            selectionsWithValidTextAndDetectedLanguageAndEffectiveLanguage.push(noTextSelectedMessage);
        }

        return selectionsWithValidTextAndDetectedLanguageAndEffectiveLanguage;
    }
);

const speakAllSelections = (synthesizer, selections, detectedPageLanguage) => promiseTry(() => {
    log("Start", "Speaking all selections");

    log("Variable", `selections (length ${selections && selections.length || 0})`, selections);

    return promiseTry(() => synthesizer.getVoices())
        .then((allVoices) => cleanupSelections(allVoices, detectedPageLanguage, selections))
        .then((cleanedupSelections) => {
            log("Variable", `cleanedupSelections (length ${cleanedupSelections && cleanedupSelections.length || 0})`, cleanedupSelections);

            const speakPromises = cleanedupSelections.map((selection) => {
                log("Text", `Speaking selection (length ${selection.text.length}, effectiveLanguage ${selection.effectiveLanguage})`, selection);

                return speak(synthesizer, selection.text, selection.effectiveLanguage);
            });

            log("Done", "Speaking all selections");

            return Promise.all(speakPromises);
        });
});

const speakUserSelection = (synthesizer) => promiseTry(() => {
    log("Start", "Speaking selection");

    return Promise.all(
        [
            executeGetFramesSelectionTextAndLanguage(),
            detectPageLanguage(),
        ]
    )
        .then(([framesSelectionTextAndLanguage, detectedPageLanguage]) => {
            return speakAllSelections(synthesizer, framesSelectionTextAndLanguage, detectedPageLanguage);
        })
        .then(() => log("Done", "Speaking selection"));
});

const getIconModePaths = (name) => {
    return {
        "16": `resources/icon/icon-${name}/icon-16x16.png`,
        "32": `resources/icon/icon-${name}/icon-32x32.png`,
        "48": `resources/icon/icon-${name}/icon-48x48.png`,
        "64": `resources/icon/icon-${name}/icon-64x64.png`,
        "128": `resources/icon/icon-${name}/icon-128x128.png`,
        "256": `resources/icon/icon-${name}/icon-256x256.png`,
        "512": `resources/icon/icon-${name}/icon-512x512.png`,
        "1024": `resources/icon/icon-${name}/icon-1024x1024.png`,
    };
};

const setIconMode = (name) => new Promise(
    (resolve, reject) => {
        try {
            log("Start", "Changing icon to", name);

            const paths = getIconModePaths(name);
            const details = {
                path: paths,
            };

            chrome.browserAction.setIcon(
                details,
                () => {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }

                    log("Done", "Changing icon to", name);

                    resolve();
                }
            );
        } catch (error) {
            return reject(error);
        }
    }
);

const setIconModePlaying = () => setIconMode("stop");
const setIconModeStopped = () => setIconMode("play");

(function main() {
    // NOTE: using a chainer to be able to add click-driven speech events one after another.
    let rootChain = Promise.resolve();

    const rootChainCatcher = (error) => {
        logError(error);
    };

    const chain = (promise) => {
        rootChain = rootChain
        .then(promise)
        .catch(rootChainCatcher);
    };

    // NOTE: while not strictly necessary, keep and pass a reference to the global (initialized) synthesizer.
    let synthesizer = null;

    chain(
        () => setup()
            .then((result) => {
                synthesizer = result;

                return undefined;
            })
    );

    const handleIconClick = () => {
        const wasSpeaking = synthesizer.speaking;

        return Promise.resolve()
            .then(() => canTalkieRunInTab())
            .then((canRun) => {
                // NOTE: can't perform (most) actions if it's not a "normal" tab.
                if (!canRun) {
                    log("speakAction", "Did not detect a normal tab, skipping.");

                    return fallbackSpeak(synthesizer, notAbleToSpeakTextFromThisSpecialTab.text, notAbleToSpeakTextFromThisSpecialTab.effectiveLanguage);
                }

                // Clear all old text.
                return executeSetTalkieIsNotSpeaking()
                    .then(() => {
                        synthesizer.cancel();

                        if (!wasSpeaking) {
                            return chain(() => Promise.all(
                                [
                                    setIconModePlaying(),
                                    speakUserSelection(synthesizer),
                                ]
                    )
                                .then(() => setIconModeStopped())
                                .catch((error) => {
                                    return setIconModeStopped()
                                        .then(() => {
                                            throw error;
                                        });
                                }));
                        }

                        return chain(() => setIconModeStopped());
                    });
            });
    };

    chrome.browserAction.onClicked.addListener(handleIconClick);
}());

log("Done", "Loading code");
