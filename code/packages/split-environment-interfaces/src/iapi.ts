/*
This file is part of Talkie -- text-to-speech browser extension button.
<https://joelpurra.com/projects/talkie/>

Copyright (c) 2016, 2017, 2018, 2019, 2020, 2021 Joel Purra <https://joelpurra.com/>

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
	JsonValue,
	ReadonlyDeep,
} from "type-fest";
import {
	Tabs,
} from "webextension-polyfill";

import {
	TalkieLocale,
} from "./ilocale-provider";
import {
	EditionType,
	OsType,
	SystemType,
} from "./moved-here/imetadata-manager";
import {
	IVoiceNameAndRateAndPitch,
	SafeVoiceObject,
} from "./moved-here/ivoices";
import {
	KillSwitch,
} from "./moved-here/killswitch";
import {
	knownEventNames,
} from "./moved-here/known-events";
import {
	ListeningActionHandler,
} from "./moved-here/listening-action-handler";

export default interface IApi {
	debouncedSpeakTextInCustomVoice: (text: string, voice: ReadonlyDeep<IVoiceNameAndRateAndPitch>) => void;

	debouncedSpeakTextInVoiceWithOverrides: (text: string, voiceName: string) => void;

	debouncedSpeakTextInLanguageWithOverrides: (text: string, languageCode: string) => void;

	getConfigurationValueSync<T extends JsonValue>(systemType: SystemType, path: string): T;

	getConfigurationValue<T>(configurationPath: string): Promise<T>;

	iconClick(): Promise<void>;

	speakInCustomVoice(text: string, voice: ReadonlyDeep<IVoiceNameAndRateAndPitch>): Promise<void>;

	speakTextInVoiceWithOverrides(text: string, voiceName: string): Promise<void>;

	speakTextInLanguageWithOverrides(text: string, languageCode: string): Promise<void>;

	getVoices(): Promise<SafeVoiceObject[]>;

	getIsPremiumEditionOption(): Promise<boolean>;

	setIsPremiumEditionOption(isPremiumEdition: boolean): Promise<void>;

	getSpeakLongTextsOption(): Promise<boolean>;

	setSpeakLongTextsOption(speakLongTexts: boolean): Promise<void>;

	getSampleText(): Promise<string>;

	getEffectiveVoiceForLanguage(languageCode: string): Promise<string | null>;

	getEffectiveRateForVoice(voiceName: string): Promise<number>;

	setVoiceRateOverride(voiceName: string, rate: number): Promise<void>;

	getEffectivePitchForVoice(voiceName: string): Promise<number>;

	setVoicePitchOverride(voiceName: string, pitch: number): Promise<void>;

	toggleLanguageVoiceOverrideName(languageCode: string, voiceName: string): Promise<boolean>;

	getTranslatedLanguages(): Promise<TalkieLocale[]>;

	isPremiumEdition(): Promise<boolean>;

	getVersionName(): Promise<string | null>;

	getVersionNumber(): Promise<string | null>;

	getEditionType(): Promise<EditionType>;

	getSystemType(): Promise<SystemType>;

	getOperatingSystemType(): Promise<OsType>;

	openUrlInNewTab(url: string): Promise<Tabs.Tab>;

	openShortKeysConfiguration(): Promise<Tabs.Tab>;

	openOptionsPage(): Promise<void>;

	registerListeningAction<TEvent extends knownEventNames, TData, TReturn>(actionName: TEvent, listeningActionHandler: ListeningActionHandler<TEvent, TData, TReturn>): Promise<KillSwitch>;
}
