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

import Discretional from "@talkie/shared-application/components/discretional.js";
import Icon from "@talkie/shared-application/components/icon/icon.js";
import Markdown from "@talkie/shared-application/components/markdown.js";
import InformationSection from "@talkie/shared-application/components/section/information-section.js";
import translateAttribute, {
	TranslateProps,
} from "@talkie/shared-application/hocs/translate.js";
import * as buttonBase from "@talkie/shared-application/styled/button/button-base.js";
import * as textBase from "@talkie/shared-application/styled/text/text-base.js";
import {
	SafeVoiceObject,
} from "@talkie/split-environment-interfaces/moved-here/ivoices.mjs";
import React from "react";

import DialectVoiceOptionsContainer from "../../../containers/voices/dialect-voice-options-container.js";

interface DialectVoiceProps extends TranslateProps {
	voice: SafeVoiceObject;
	speakSampleTextForVoiceName: (voiceName: string) => void;
	hasSampleTextForLanguageGroup: boolean;
}

class DialectVoice<P extends DialectVoiceProps> extends React.PureComponent<P> {
	constructor(props: P) {
		super(props);

		this.handleSpeakVoiceNameClick = this.handleSpeakVoiceNameClick.bind(this);
	}

	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	handleSpeakVoiceNameClick(event: React.MouseEvent): false {
		event.preventDefault();
		event.stopPropagation();

		this.props.speakSampleTextForVoiceName(this.props.voice.name);

		return false;
	}

	override render(): React.ReactNode {
		const {
			voice,
			hasSampleTextForLanguageGroup,
		} = this.props as DialectVoiceProps;

		// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
		const SpeakSampleButton: React.FC = ({
			children,
		}) => hasSampleTextForLanguageGroup
			? (
				<textBase.p>
					<buttonBase.transparentButton
						onClick={this.handleSpeakVoiceNameClick}
					>
						<Icon
							className="icon-voices"
							mode="inline"
						/>

						{children}
					</buttonBase.transparentButton>
				</textBase.p>
			)
			: null;

		return (
			<>
				<Discretional
					enabled={!voice.localService}
				>
					<InformationSection
						informationType="information"
					>
						<textBase.p>
							<Markdown>
								{`**${voice.name}** is an online voice. Usage may require an active internet connection to access third-party services.`}
							</Markdown>
						</textBase.p>
					</InformationSection>
				</Discretional>

				<SpeakSampleButton>
					{/* TODO: translate. */}
					<Markdown>
						{`Listen to a voice sample of **${voice.name}**.`}
					</Markdown>
				</SpeakSampleButton>

				<DialectVoiceOptionsContainer/>
			</>
		);
	}
}

export default translateAttribute<DialectVoiceProps>()(
	DialectVoice,
);
