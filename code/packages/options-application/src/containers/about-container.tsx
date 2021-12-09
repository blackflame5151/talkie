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
	SafeVoiceObject,
} from "@talkie/split-environment-interfaces/moved-here/ivoices.mjs";
import React from "react";
import {
	connect,
	MapDispatchToPropsFunction,
	MapStateToProps,
} from "react-redux";
import toolkit from "@reduxjs/toolkit";
const {
	bindActionCreators,
} = toolkit;

import About, {
	AboutStateProps,
} from "../components/sections/about.js";
import selectors from "../selectors/index.mjs";
import {
	actions,
} from "../slices/index.mjs";
import type {
	OptionsRootState,
} from "../store/index.mjs";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AboutContainerProps {}

interface StateProps extends AboutStateProps {
	voices: readonly SafeVoiceObject[];
}

interface DispatchProps {
	loadNavigatorLanguage: typeof actions.shared.languages.loadNavigatorLanguage;
	loadNavigatorLanguages: typeof actions.shared.languages.loadNavigatorLanguages;
	speakTextInVoiceWithOverrides: typeof actions.shared.speaking.speakTextInVoiceWithOverrides;
}

interface InternalAboutContainerProps extends StateProps, DispatchProps {}

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const mapStateToProps: MapStateToProps<StateProps, InternalAboutContainerProps, OptionsRootState> = (state: Readonly<OptionsRootState>) => ({
	isPremiumEdition: state.shared.metadata.isPremiumEdition,
	navigatorLanguage: state.shared.languages.navigatorLanguage,
	osType: state.shared.metadata.osType,
	sortedLanguageGroups: selectors.shared.voices.getSortedLanguageGroups(state),
	sortedLanguages: selectors.shared.voices.getSortedLanguages(state),
	sortedNavigatorLanguages: selectors.shared.languages.getSortedNavigatorLanguages(state),
	sortedTranslatedLanguages: selectors.shared.languages.getSortedTranslatedLanguages(state),
	systemType: state.shared.metadata.systemType,
	versionName: state.shared.metadata.versionName,
	voices: selectors.shared.voices.getVoices(state),
});

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, InternalAboutContainerProps> = (dispatch) => ({
	loadNavigatorLanguage: bindActionCreators(actions.shared.languages.loadNavigatorLanguage, dispatch),
	loadNavigatorLanguages: bindActionCreators(actions.shared.languages.loadNavigatorLanguages, dispatch),
	speakTextInVoiceWithOverrides: bindActionCreators(actions.shared.speaking.speakTextInVoiceWithOverrides, dispatch),
});

class AboutContainer<P extends InternalAboutContainerProps> extends React.PureComponent<P> {
	static defaultProps = {
		navigatorLanguage: null,
		osType: null,
	};

	constructor(props: P) {
		super(props);

		this.handleLegaleseClick = this.handleLegaleseClick.bind(this);
	}

	override componentDidMount(): void {
		// TODO: is this the best place to load data?
		this.props.loadNavigatorLanguage();
		this.props.loadNavigatorLanguages();
	}

	handleLegaleseClick(text: string): void {
		const legaleseText = text;

		// TODO: allow defining a specific voice, with a specified text language as fallback.
		// lang: "en-US",
		const legaleseVoiceName = "Zarvox";

		this.props.speakTextInVoiceWithOverrides({
			text: legaleseText,
			voiceName: legaleseVoiceName,
		});
	}

	override render(): React.ReactNode {
		const {
			isPremiumEdition,
			navigatorLanguage,
			osType,
			sortedLanguageGroups,
			sortedLanguages,
			sortedNavigatorLanguages,
			sortedTranslatedLanguages,
			systemType,
			versionName,
			voices,
		} = this.props;

		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		const sortedVoiceNames = voices.map((voice) => `${voice.name} (${voice.lang})`).sort((a, b) => a.localeCompare(b));

		return (
			<About
				isPremiumEdition={isPremiumEdition}
				navigatorLanguage={navigatorLanguage}
				osType={osType}
				sortedLanguageGroups={sortedLanguageGroups}
				sortedLanguages={sortedLanguages}
				sortedNavigatorLanguages={sortedNavigatorLanguages}
				sortedTranslatedLanguages={sortedTranslatedLanguages}
				systemType={systemType}
				versionName={versionName}
				voiceNames={sortedVoiceNames}
				onLicenseClick={this.handleLegaleseClick}
			/>
		);
	}
}

export default connect<StateProps, DispatchProps, InternalAboutContainerProps, OptionsRootState>(mapStateToProps, mapDispatchToProps)(
	AboutContainer,
) as unknown as React.ComponentType<AboutContainerProps>;
