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

import Configuration from "@talkie/shared-application/configuration/configuration";
import configurationObject from "@talkie/shared-application/configuration/configuration-object";
import MetadataManager from "@talkie/shared-application/metadata-manager";
import SettingsManager from "@talkie/shared-application/settings-manager";
import StorageManager from "@talkie/shared-application/storage-manager";
import TalkieLocaleHelper from "@talkie/shared-locales/talkie-locale-helper";
import BroadcasterProvider from "@talkie/split-environment-node/broadcaster-provider";
import DynamicEnvironmentProvider from "@talkie/split-environment-node/dynamic-environment";
import LocaleProvider from "@talkie/split-environment-node/locale-provider";
import ManifestProvider from "@talkie/split-environment-node/manifest-provider";
import Api from "@talkie/split-environment-node/server-specific/api";
import StorageProvider from "@talkie/split-environment-node/storage-provider";
import StyletronProvider from "@talkie/split-environment-node/styletron-provider";
import TranslatorProvider from "@talkie/split-environment-node/translator-provider";

export type ServerSideDependencies = {
	api: Api;
	broadcasterProvider: BroadcasterProvider;
	configuration: Configuration;
	localeProvider: LocaleProvider;
	styletronProvider: StyletronProvider;
	translatorProvider: TranslatorProvider;
};

const getDependencies = async (): Promise<ServerSideDependencies> => {
	const storageProvider = new StorageProvider();
	const storageManager = new StorageManager(storageProvider);
	const broadcasterProvider = new BroadcasterProvider();
	const settingsManager = new SettingsManager(storageManager, broadcasterProvider);
	const manifestProvider = new ManifestProvider();
	const dynamicEnvironmentProvider = new DynamicEnvironmentProvider();
	const metadataManager = new MetadataManager(manifestProvider, dynamicEnvironmentProvider, settingsManager);
	const configuration = new Configuration(metadataManager, configurationObject);
	const localeProvider = new LocaleProvider();
	const translatorProvider = new TranslatorProvider(localeProvider);
	const talkieLocaleHelper = new TalkieLocaleHelper();
	const api = new Api(metadataManager, configuration, translatorProvider, broadcasterProvider, talkieLocaleHelper);
	const styletronProvider = new StyletronProvider();

	// NOTE: using poor man's dependency injection. Instances should only be created once, and reused across the execution.
	return {
		api,
		broadcasterProvider,
		configuration,
		localeProvider,
		styletronProvider,
		translatorProvider,
	};
};

export default getDependencies;
