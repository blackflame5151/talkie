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

import React from "react";
import {
	connect,
	MapDispatchToPropsFunction,
	MapStateToProps,
} from "react-redux";
import {
	bindActionCreators,
} from "redux";
import {
	ReadonlyDeep,
} from "type-fest";

import Text from "../components/sections/text";
import {
	actions,
} from "../slices/index";
import {
	OptionsRootState,
} from "../store";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextContainerProps {}

interface StateProps {
	speakLongTexts: boolean;
}

interface DispatchProps {
	loadSpeakLongTexts: typeof actions.voices.loadSpeakLongTexts;
	storeSpeakLongTexts: typeof actions.voices.storeSpeakLongTexts;
}

const mapStateToProps: MapStateToProps<StateProps, TextContainerProps, OptionsRootState> = (state: ReadonlyDeep<OptionsRootState>) => ({
	speakLongTexts: state.voices.speakLongTexts,
});

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, TextContainerProps> = (dispatch) => ({
	loadSpeakLongTexts: bindActionCreators(actions.voices.loadSpeakLongTexts, dispatch),
	storeSpeakLongTexts: bindActionCreators(actions.voices.storeSpeakLongTexts, dispatch),
});

class TextContainer<P extends TextContainerProps & StateProps & DispatchProps> extends React.PureComponent<P> {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(props: P) {
		super(props);
	}

	override componentDidMount(): void {
		this.props.loadSpeakLongTexts();
	}

	override render(): React.ReactNode {
		const {
			storeSpeakLongTexts,
			speakLongTexts,
		} = this.props;

		return (
			<Text
				speakLongTexts={speakLongTexts}
				storeSpeakLongTexts={storeSpeakLongTexts}
			/>
		);
	}
}

export default connect<StateProps, DispatchProps, TextContainerProps, OptionsRootState>(mapStateToProps, mapDispatchToProps)(
	TextContainer,
);
