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

import translateAttribute, {
	TranslateProps,
} from "@talkie/shared-application/hocs/translate";
import * as textBase from "@talkie/shared-application/styled/text/text-base";
import React from "react";

import InstallVoicesContainer from "../../../containers/install-voices-container";

interface IntroProps extends TranslateProps {}

class Intro<P extends IntroProps> extends React.PureComponent<P> {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(props: P) {
		super(props);
	}

	override render(): React.ReactNode {
		const {
			translateSync,
		} = this.props as IntroProps;

		return (
			<>
				<section>
					<textBase.p>
						{translateSync("frontend_voicesDescription")}
					</textBase.p>
				</section>

				<InstallVoicesContainer/>
			</>
		);
	}
}

export default translateAttribute<IntroProps>()(
	Intro,
);
