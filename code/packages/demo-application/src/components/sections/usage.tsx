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

import Discretional from "@talkie/shared-application/components/discretional";
import Icon from "@talkie/shared-application/components/icon/icon";
import TalkieEditionIcon from "@talkie/shared-application/components/icon/talkie-edition-icon";
import TalkiePremiumIcon from "@talkie/shared-application/components/icon/talkie-premium-icon";
import PremiumSection from "@talkie/shared-application/components/section/premium-section";
import configureAttribute, {
	ConfigureProps,
} from "@talkie/shared-application/hocs/configure";
import translateAttribute, {
	TranslateProps,
} from "@talkie/shared-application/hocs/translate";
import * as listBase from "@talkie/shared-application/styled/list/list-base";
import * as tableBase from "@talkie/shared-application/styled/table/table-base";
import * as lighter from "@talkie/shared-application/styled/text/lighter";
import * as textBase from "@talkie/shared-application/styled/text/text-base";
import {
	OnOpenShortcutKeysClickProp,
} from "@talkie/shared-application/types";
import {
	OsType,
	SystemType,
} from "@talkie/split-environment-interfaces/moved-here/imetadata-manager";
import React, {
	ComponentProps,
} from "react";
import {
	StyletronComponent,
	withStyleDeep,
} from "styletron-react";

export interface UsageProps {
	isPremiumEdition: boolean;
	osType?: OsType | null;
	systemType: SystemType | null;
	onOpenShortKeysConfigurationClick: OnOpenShortcutKeysClickProp;
}

class Usage<P extends UsageProps & ConfigureProps & TranslateProps> extends React.PureComponent<P> {
	static defaultProps = {
		osType: null,
	};

	private readonly styled: {
		shortcutKeysTable: StyletronComponent<ComponentProps<typeof tableBase.table>>;
		shortcutKeysTd: StyletronComponent<ComponentProps<typeof tableBase.td>>;
	};

	constructor(props: P) {
		super(props);

		this.handleOpenShortKeysConfigurationClick = this.handleOpenShortKeysConfigurationClick.bind(this);

		this.styled = {
			shortcutKeysTable: withStyleDeep(
				tableBase.table,
				{
					borderSpacing: 0,
				},
			),

			shortcutKeysTd: withStyleDeep(
				tableBase.td,
				{
					whiteSpace: "nowrap",
				},
			),
		};
	}

	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	handleOpenShortKeysConfigurationClick(event: Readonly<React.MouseEvent>): false {
		return this.props.onOpenShortKeysConfigurationClick(event);
	}

	override render(): React.ReactNode {
		const {
			isPremiumEdition,
			systemType,
			osType,
			configure,
			translateSync,
		} = this.props;

		return (
			<section>
				<listBase.ul>
					<listBase.li>
						{translateSync("frontend_usageStep01")}
					</listBase.li>
					<listBase.li>
						{translateSync("frontend_usageStep02")}
						<TalkieEditionIcon
							isPremiumEdition={isPremiumEdition}
							mode="inline"
						/>
					</listBase.li>
				</listBase.ul>
				<p>
					{translateSync("frontend_usageSelectionContextMenuDescription")}
				</p>

				{/* NOTE: read from clipboard feature not available in Firefox */}
				<Discretional
					enabled={systemType === "chrome"}
				>
					<PremiumSection
						mode="p"
					>
						<p>
							{translateSync("frontend_usageReadclipboard")}
						</p>
					</PremiumSection>
				</Discretional>

				<textBase.h2>
					{translateSync("frontend_usageShortcutHeading")}
				</textBase.h2>

				<p>
					{translateSync("frontend_usageShortcutKeyDescription")}
				</p>

				<this.styled.shortcutKeysTable>
					<colgroup>
						<col width="100%"/>
						<col width="0*"/>
					</colgroup>
					<tableBase.tbody>
						<tableBase.tr>
							<tableBase.td>
								<Icon
									className="icon-small-play"
									mode="inline"/>
								<lighter.span>
									/
								</lighter.span>
								<Icon
									className="icon-small-stop"
									mode="inline"/>

								{translateSync("frontend_usageShortcutKeyDescriptionStartStopWithMenu")}
							</tableBase.td>
							<this.styled.shortcutKeysTd>
								<Discretional
									enabled={osType === "mac"}
								>
									<textBase.kbd>
										⌥
									</textBase.kbd>
								</Discretional>

								<Discretional
									enabled={osType !== "mac"}
								>
									<textBase.kbd>
										Alt
									</textBase.kbd>
								</Discretional>

								+
								<textBase.kbd>
									Shift
								</textBase.kbd>
								+
								<textBase.kbd>
									A
								</textBase.kbd>
							</this.styled.shortcutKeysTd>
						</tableBase.tr>

						{/* NOTE: Shortcut key already in use in Firefox */}
						<Discretional
							enabled={systemType === "chrome"}
						>
							<tableBase.tr>
								<tableBase.td>
									<Icon
										className="icon-small-play"
										mode="inline"/>
									<lighter.span>
										/
									</lighter.span>
									<Icon
										className="icon-small-stop"
										mode="inline"/>

									{translateSync("frontend_usageShortcutKeyDescriptionStartStopWithoutMenu")}
								</tableBase.td>
								<this.styled.shortcutKeysTd>
									<Discretional
										enabled={osType === "mac"}
									>
										<textBase.kbd>
											⌘
										</textBase.kbd>
									</Discretional>

									<Discretional
										enabled={osType !== "mac"}
									>
										<textBase.kbd>
											Ctrl
										</textBase.kbd>
									</Discretional>

									+
									<textBase.kbd>
										Shift
									</textBase.kbd>
									+
									<textBase.kbd>
										A
									</textBase.kbd>
								</this.styled.shortcutKeysTd>
							</tableBase.tr>
						</Discretional>

						{/* NOTE: read from clipboard feature not available in Firefox */}
						<Discretional
							enabled={systemType === "chrome"}
						>
							<tableBase.tr className="premium-section">
								<tableBase.td colSpan={2}>
									<textBase.a
										href={configure("urls.options-upgrade-from-demo")}
										lang="en"
									>
										<TalkiePremiumIcon
											mode="inline"
										/>
										{translateSync("extensionShortName_Premium")}
									</textBase.a>
								</tableBase.td>
							</tableBase.tr>
						</Discretional>

						{/* NOTE: read from clipboard feature not available in Firefox */}
						<Discretional
							enabled={systemType === "chrome"}
						>
							<tableBase.tr className="premium-section">
								<tableBase.td>
									<Icon
										className="icon-small-speaker"
										mode="inline"/>

									{translateSync("frontend_usageShortcutKeyDescriptionReadFromClipboard")}
								</tableBase.td>
								<this.styled.shortcutKeysTd>
									<Discretional
										enabled={osType === "mac"}
									>
										<textBase.kbd>
											⌘
										</textBase.kbd>
									</Discretional>

									<Discretional
										enabled={osType !== "mac"}
									>
										<textBase.kbd>
											Ctrl
										</textBase.kbd>
									</Discretional>

									+
									<textBase.kbd>
										Shift
									</textBase.kbd>
									+
									<textBase.kbd>
										1
									</textBase.kbd>
								</this.styled.shortcutKeysTd>
							</tableBase.tr>
						</Discretional>
					</tableBase.tbody>
				</this.styled.shortcutKeysTable>

				<lighter.p>
					{translateSync("frontend_usageShortcutKeyAlternative03")}
				</lighter.p>

				{/* NOTE: can't change shortcut keys in Firefox */}
				<Discretional
					enabled={systemType === "chrome"}
				>
					<p>
						<textBase.a
							href={configure("urls.shortcut-keys")}
							onClick={this.handleOpenShortKeysConfigurationClick}
						>
							{translateSync("frontend_usageShortcutKeyAlternative04")}
						</textBase.a>
					</p>
				</Discretional>
			</section>
		);
	}
}

export default configureAttribute<UsageProps & ConfigureProps>()(
	translateAttribute<UsageProps & ConfigureProps & TranslateProps>()(
		Usage,
	),
);
