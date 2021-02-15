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

import PropTypes from "prop-types";
import React from "react";

import Discretional from "../../shared/components/discretional.jsx";
import ExtensionShortName from "../../shared/components/editions/extension-short-name.jsx";
import TalkieEditionIcon from "../../shared/components/icon/talkie-edition-icon.jsx";
import configureAttribute from "../../shared/hocs/configure.jsx";
import styled from "../../shared/hocs/styled.jsx";
import translateAttribute from "../../shared/hocs/translate.jsx";
import * as buttonBase from "../../shared/styled/button/button-base.jsx";
import * as layoutBase from "../../shared/styled/layout/layout-base.jsx";
import * as textBase from "../../shared/styled/text/text-base.jsx";

const styles = {};

export default
@configureAttribute
@translateAttribute
@styled(styles)
class Header extends React.PureComponent {
	constructor(props) {
		super(props);

		this.styled = {
			button: styled({
				":focus": {
					outline: 0,
				},
				lineHeight: "1.5em",
				// float: "__MSG_@@bidi_end_edge__",
			})(buttonBase.a),

			extensionName: styled({
				":focus": {
					outline: 0,
				},
				fontWeight: "bold",
				textDecoration: "none",
			})(textBase.a),
		};
	}

	static defaultProps = {
		className: "",
	}

	static propTypes = {
		className: PropTypes.string,
		configure: PropTypes.func.isRequired,
		isPremiumEdition: PropTypes.bool.isRequired,
		onConfigurationChange: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	}

	componentDidMount() {
		this._unregisterConfigurationListener = this.props.onConfigurationChange(() => this.forceUpdate());
	}

	componentWillUnmount() {
		this._unregisterConfigurationListener();
	}

	render() {
		const {
			className,
			isPremiumEdition,
			translate,
			configure,
		} = this.props;

		return (
			<layoutBase.header className={className}>
				{/* TODO: show for free Talkie, not for Talkie Premium. */}
				<Discretional
					enabled={!isPremiumEdition}
				>
					<this.styled.button
						href={configure("urls.options-upgrade-from-demo")}
						id="header-premium-button"
						lang="en"
					>
						{translate("extensionShortName_Premium")}
					</this.styled.button>
				</Discretional>

				<textBase.h1>
					<TalkieEditionIcon
						isPremiumEdition={isPremiumEdition}
						mode="inline"
					/>

					<this.styled.extensionName
						href={configure("urls.main")}
						lang="en"
					>
						<ExtensionShortName
							isPremiumEdition={isPremiumEdition}
						/>
					</this.styled.extensionName>
				</textBase.h1>
			</layoutBase.header>
		);
	}
}
