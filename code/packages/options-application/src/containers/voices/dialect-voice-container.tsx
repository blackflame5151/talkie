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
} from "@talkie/split-environment-interfaces/moved-here/ivoices";
import React from "react";
import {
	connect,
	MapDispatchToPropsFunction,
	MapStateToProps,
} from "react-redux";

import DialectVoice from "../../components/sections/voices/dialect-voice";
import selectors from "../../selectors";
import type {
	OptionsRootState,
} from "../../store";

interface DialectVoicesContainerProps {
	speakSampleTextForVoiceName: (voiceName: string) => void;
}

interface StateProps {
	hasSampleTextForLanguageGroup: boolean;
	voiceForSelectedVoiceName: Readonly<SafeVoiceObject> | null;
}

interface DispatchProps {}

interface InternalProps extends DialectVoicesContainerProps, StateProps, DispatchProps {}

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const mapStateToProps: MapStateToProps<StateProps, InternalProps, OptionsRootState> = (state) => ({
	hasSampleTextForLanguageGroup: selectors.voices.getHasSampleTextForLanguageGroup(state),
	voiceForSelectedVoiceName: selectors.voices.getVoiceForSelectedVoiceName(state),
});

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, InternalProps> = (_dispatch) => ({});

class DialectVoicesContainer<P extends InternalProps> extends React.PureComponent<P> {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(props: P) {
		super(props);
	}

	override render(): React.ReactNode {
		const {
			hasSampleTextForLanguageGroup,
			speakSampleTextForVoiceName,
			voiceForSelectedVoiceName,
		} = this.props as InternalProps;

		if (!voiceForSelectedVoiceName) {
			throw new TypeError("voiceForSelectedVoiceName");
		}

		return (
			<DialectVoice
				hasSampleTextForLanguageGroup={hasSampleTextForLanguageGroup}
				speakSampleTextForVoiceName={speakSampleTextForVoiceName}
				voice={voiceForSelectedVoiceName}
			/>
		);
	}
}

export default connect<StateProps, DispatchProps, InternalProps, OptionsRootState>(mapStateToProps, mapDispatchToProps)(
	DialectVoicesContainer,
) as unknown as React.ComponentType<DialectVoicesContainerProps>;
