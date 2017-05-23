/*
This file is part of Talkie -- text-to-speech browser extension button.
<https://joelpurra.com/projects/talkie/>

Copyright (c) 2016, 2017 Joel Purra <https://joelpurra.com/>

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
import PropTypes from "prop-types";

import configure from "../../hocs/configure.jsx";
import translate from "../../hocs/translate.jsx";

@configure
@translate
export default class Features extends React.Component {
    static propTypes = {
        translate: PropTypes.func.isRequired,
        configure: PropTypes.func.isRequired,
    }

    render() {
        return (
            <section>
                <h2>{this.props.translate("frontend_featuresHeading")}</h2>
                <p>
                    {this.props.translate("frontend_featuresVersions")}
                    <span className="talkie-free-only talkie-inline">{this.props.translate("frontend_featuresVersion_Free")}</span>
                    <a href={this.props.configure("urls.store-premium")} className="talkie-free-only talkie-inline">{this.props.translate("frontend_getPremiumLinkText")}</a>
                    <span className="talkie-premium-only talkie-inline">{this.props.translate("frontend_featuresVersion_Premium")}</span>
                </p>

                <h2><a href={this.props.configure("urls.store-premium")}><span className="icon inline talkie premium"></span>Talkie Premium</a></h2>
                <ul>
                    <li>{this.props.translate("frontend_featuresPremium_List01")}</li>
                    <li>{this.props.translate("frontend_featuresPremium_List02")}</li>
                    {/* NOTE: read from clipboard feature not available in Firefox */}
                    <li className="talkie-chrome-only talkie-list-item">{this.props.translate("frontend_featuresPremium_List05")}</li>
                    <li>{this.props.translate("frontend_featuresPremium_List03")}</li>
                    <li>{this.props.translate("frontend_featuresPremium_List04")}</li>
                </ul>

                <h2><a href={this.props.configure("urls.store-free")}><span className="icon inline talkie free"></span>Talkie</a></h2>
                <ul>
                    <li>{this.props.translate("frontend_featuresFree_List01")}</li>
                    <li>{this.props.translate("frontend_featuresFree_List02")}</li>
                    <li>{this.props.translate("frontend_featuresFree_List03")}</li>
                    <li>{this.props.translate("frontend_featuresFree_List04")}</li>
                    <li>{this.props.translate("frontend_featuresFree_List05")}</li>
                    <li>{this.props.translate("frontend_featuresFree_List06")}</li>
                </ul>
            </section>
        );
    }
}
