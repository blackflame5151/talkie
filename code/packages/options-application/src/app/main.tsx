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
	OsType,
	SystemType,
} from "@talkie/shared-interfaces/imetadata-manager.mjs";
import passSelectedTextToBackground from "@talkie/shared-ui/hocs/pass-selected-text-to-background.js";
import translateAttribute, {
	TranslateProps,
} from "@talkie/shared-ui/hocs/translate.js";
import * as layoutBase from "@talkie/shared-ui/styled/layout/layout-base.js";
import {
	ClassNameProp,
} from "@talkie/shared-ui/styled/types.js";
import * as colorBase from "@talkie/shared-ui/styles/color/color-base.mjs";
import React, {
	ComponentProps,
} from "react";
import type {
	StyleObject,
	StyletronComponent,
} from "styletron-react";
import {
	styled,
	withStyleDeep,
} from "styletron-react";

import NavContainer from "../components/navigation/nav-container.js";
import {
	NavLink,
} from "../components/navigation/nav-container-types.mjs";
import TabContents from "../components/navigation/tab-contents.js";
import AboutContainer from "../containers/about-container.js";
import EditionsContainer from "../containers/editions-container.js";
import TextContainer from "../containers/settings-container.js";
import VoicesContainer from "../containers/voices/voices-container.js";
import WelcomeContainer from "../containers/welcome-container.js";
import {
	actions,
} from "../slices/index.mjs";
import Footer, {
	FooterStateProps,
} from "./footer.js";
import Header from "./header.js";
import Features from "./sections/features.js";
import Support from "./sections/support.js";
import Usage from "./sections/usage.js";

export interface MainStateProps extends FooterStateProps {
	activeTabId: string | null;
	isPremiumEdition: boolean;
	osType: OsType | null;
	showAdditionalDetails: boolean;
	systemType: SystemType | null;
}

export interface MainDispatchProps {
	openShortKeysConfiguration: typeof actions.shared.navigation.openShortKeysConfiguration;
	openUrlInNewTab: typeof actions.shared.navigation.openUrlInNewTab;
	openOptionsPage: typeof actions.shared.navigation.openOptionsPage;
}

export interface MainProps extends MainStateProps, MainDispatchProps, TranslateProps, ClassNameProp {}

const widthStyles = {
	maxWidth: "1000px",
	minWidth: "400px",
};

const styles: StyleObject = {
	...widthStyles,
	minHeight: "450px",
	paddingBottom: "2em",
};

class Main<P extends MainProps> extends React.PureComponent<P> {
	constructor(props: P) {
		super(props);

		this.handleLinkClick = this.handleLinkClick.bind(this);
		this.handleOpenShortKeysConfigurationClick = this.handleOpenShortKeysConfigurationClick.bind(this);
		this.handleOptionsPageClick = this.handleOptionsPageClick.bind(this);

		// TODO: async load/unload logic for classes.
		// TODO: better place to put navigation menu links?
		this.links = [
			{
				tabId: "welcome",
				// eslint-disable-next-line no-sync
				text: this.props.translateSync("frontend_welcomeLinkText"),
			},
			{
				tabId: "voices",
				// eslint-disable-next-line no-sync
				text: this.props.translateSync("frontend_voicesLinkText"),
			},
			{
				tabId: "usage",
				// eslint-disable-next-line no-sync
				text: this.props.translateSync("frontend_usageLinkText"),
			},
			{
				tabId: "features",
				// eslint-disable-next-line no-sync
				text: this.props.translateSync("frontend_featuresLinkText"),
			},
			{
				tabId: "upgrade",
				// eslint-disable-next-line no-sync
				text: this.props.translateSync("frontend_upgradeLinkText"),
			},
			{
				tabId: "settings",
				// eslint-disable-next-line no-sync
				text: this.props.translateSync("frontend_settingsLinkText"),
			},
			{
				tabId: "support",
				// eslint-disable-next-line no-sync
				text: this.props.translateSync("frontend_supportLinkText"),
			},
			{
				tabId: "about",
				// eslint-disable-next-line no-sync
				text: this.props.translateSync("frontend_aboutLinkText"),
			},
		];

		this.styled = {
			footerHr: withStyleDeep(
				layoutBase.hr,
				{
					marginTop: "3em",
				},
			),

			main: withStyleDeep(
				layoutBase.main,
				{
					paddingTop: "10em",
				},
			),

			navHeader: styled(
				"div",
				{
					...widthStyles,
					backgroundColor: colorBase.bodyBackgroundColor,
					left: 0,
					position: "fixed",
					right: 0,
					top: 0,
				},
			),
		};
	}

	override componentDidMount(): void {
		this.scrollToTop();
	}

	override componentDidUpdate(previousProps: P): void {
		if (previousProps.activeTabId !== this.props.activeTabId) {
			this.scrollToTop();
		}
	}

	scrollToTop(): void {
		// NOTE: execute outside the synchronous rendering.
		setTimeout(() => {
			// NOTE: feels like this might be the wrong place to put this? Is there a better place?
			// NOTE: due to shuffling around elements, there's some confusion regarding which element to apply scrolling to.
			document.body.scrollTop = 0;
			window.scroll(0, 0);
		}, 100);
	}

	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	handleOpenShortKeysConfigurationClick(event: Readonly<React.MouseEvent>): false {
		event.preventDefault();
		event.stopPropagation();

		this.props.openShortKeysConfiguration();

		return false;
	}

	handleLinkClick(url: string): void {
		this.props.openUrlInNewTab(url);
	}

	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	handleOptionsPageClick(event: React.MouseEvent): false {
		event.preventDefault();
		event.stopPropagation();

		this.props.openOptionsPage();

		return false;
	}

	override render(): React.ReactNode {
		const {
			activeTabId,
			className,
			errorCount,
			isPremiumEdition,
			osType,
			showAdditionalDetails,
			systemType,
			versionNumber,
		} = this.props;

		const linksToShow = this.links;

		return (
			<div className={className}>
				<this.styled.navHeader>
					<Header
						isPremiumEdition={isPremiumEdition}
					/>

					<NavContainer
						links={linksToShow}
					/>

					<layoutBase.hr/>
				</this.styled.navHeader>

				<layoutBase.hr/>

				<this.styled.main>
					<TabContents
						activeTabId={activeTabId}
						id="welcome"
						onLinkClick={this.handleLinkClick}
					>
						<WelcomeContainer/>
					</TabContents>

					<TabContents
						activeTabId={activeTabId}
						id="voices"
						onLinkClick={this.handleLinkClick}
					>
						<VoicesContainer/>
					</TabContents>

					<TabContents
						activeTabId={activeTabId}
						id="usage"
						onLinkClick={this.handleLinkClick}
					>
						<Usage
							isPremiumEdition={isPremiumEdition}
							osType={osType}
							systemType={systemType}
							onOpenShortKeysConfigurationClick={this.handleOpenShortKeysConfigurationClick}
						/>
					</TabContents>

					<TabContents
						activeTabId={activeTabId}
						id="features"
						onLinkClick={this.handleLinkClick}
					>
						<Features
							isPremiumEdition={isPremiumEdition}
							systemType={systemType}
						/>
					</TabContents>

					<TabContents
						activeTabId={activeTabId}
						id="upgrade"
						onLinkClick={this.handleLinkClick}
					>
						<EditionsContainer/>
					</TabContents>

					<TabContents
						activeTabId={activeTabId}
						id="settings"
						onLinkClick={this.handleLinkClick}
					>
						<TextContainer/>
					</TabContents>

					<TabContents
						activeTabId={activeTabId}
						id="support"
						onLinkClick={this.handleLinkClick}
					>
						<Support
							osType={osType}
							showAdditionalDetails={showAdditionalDetails}
							systemType={systemType}
							onOpenShortKeysConfigurationClick={this.handleOpenShortKeysConfigurationClick}
						/>
					</TabContents>

					<TabContents
						activeTabId={activeTabId}
						id="about"
						onLinkClick={this.handleLinkClick}
					>
						<AboutContainer/>
					</TabContents>
				</this.styled.main>

				<this.styled.footerHr/>

				<Footer
					errorCount={errorCount}
					versionNumber={versionNumber}
				/>
			</div>
		);
	}

	static defaultProps = {
		osType: null,
	};

	private readonly links: NavLink[];

	private readonly styled: {
		footerHr: StyletronComponent<ComponentProps<typeof layoutBase.hr>>;
		main: StyletronComponent<ComponentProps<typeof layoutBase.main>>;
		navHeader: StyletronComponent<ComponentProps<"div">>;
	};
}

export default styled(
	translateAttribute<MainProps>()(
		passSelectedTextToBackground<MainProps>()(
			Main,
		),
	),
	styles,
);
