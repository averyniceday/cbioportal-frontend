import * as React from 'react';
import * as _ from 'lodash';
import { Link } from 'react-router';
import AppConfig from "appConfig";
import {If, Then, Else} from 'react-if';
import {openSocialAuthWindow} from "../../shared/lib/openSocialAuthWindow";
import {AppStore} from "../../AppStore";
import {observer} from "mobx-react";
import {buildCBioPortalPageUrl} from "../../shared/api/urls";
import {Button, DropdownButton, DropdownButton, MenuItem} from "react-bootstrap";

@observer
export default class PortalHeader extends React.Component<{ appStore:AppStore }, {}> {

    private tabs(){

        return [

            {
                id:"datasets",
                text:"Data Sets",
                address:"/s/datasets",
                internal:true,
                hide:()=>AppConfig.serverConfig.skin_show_data_tab === false
            },

            {
                id:"webAPI",
                text:"Web API",
                address:"/s/webAPI",
                internal:true,
                hide:()=>AppConfig.serverConfig.skin_show_web_api_tab === false
            },

            {
                id:"rMatlab",
                text:"R/MATLAB",
                address:"/s/rmatlab",
                internal:true,
                hide:()=>AppConfig.serverConfig.skin_show_r_matlab_tab === false
            },

            {
                id:"tutorials",
                text:"Tutorials",
                address:"/s/tutorials",
                internal:true,
                hide:()=>AppConfig.serverConfig.skin_show_tutorials_tab === false
            },

            {
                id:"faq",
                text:"FAQ",
                address:"/s/faq",
                internal:true,
                hide:()=>AppConfig.serverConfig.skin_show_faqs_tab === false
            },

            {
                id:"news",
                text:"News",
                address:"/s/news",
                internal:true,
                hide:()=>AppConfig.serverConfig.skin_show_news_tab === false
            },

            {
                id:"visualize",
                text:"Visualize Your Data",
                address:"/s/visualize",
                internal:true,
                hide:()=>AppConfig.serverConfig.skin_show_tools_tab === false
            },

            {
                id:"about",
                text:"About",
                address:"/s/about",
                internal:true,
                hide:()=>AppConfig.serverConfig.skin_show_about_tab === false
            },

        ];


    }

    private getTabs(){
        const shownTabs = this.tabs().filter((t)=>{
            return !t.hide()
        });

        return shownTabs.map((tab)=>{
            return <li>
                {
                    (tab.internal) ? <Link activeClassName={'selected'} to={tab.address}>{tab.text}</Link> :  <a href={tab.address}>{tab.text}</a>
                }
            </li>
        })

    }

    private createTokenFunction() {
        fetch("http://dashi-dev.cbio.mskcc.org:8080/security-test/api-legacy/dataAccessToken/6f3f730d-4dd7-4781-9b5b-39481513f036",
        //http://dashi-dev.cbio.mskcc.org:8080/security-test/api-legacy/dataAccessToken?allowRevocationOfOtherTokens=true",
            { method: "GET"})
            .then(function (response) {
                console.log(response);
                alert(response.body);
                return(response);
            }).then(function(parsedData) {
                alert(parsedData.message);
            }).catch(function(error) {
                alert(error);
            });
    }

    render(){
        return <header>
            <div id="leftHeaderContent">
                <Link to="/" id="cbioportal-logo"><img src={require("./cbioportal_logo.png")} alt="cBioPortal Logo"/></Link>
                <nav id="main-nav">
                    <ul>
                        {
                           this.getTabs()
                        }
                    </ul>
                </nav>
            </div>
            <div className="identity">Logged in as {this.props.appStore.userName}
                <span className="pipeSeperator">|</span>
                <a href={buildCBioPortalPageUrl(this.props.appStore.logoutUrl)}>Sign out</a>

            </div>

            <div id="rightHeaderContent">
                <If condition={this.props.appStore.isLoggedIn}>
                    <Then>
                        <div className={DropdownButton}>
                            <DropdownButton
                                bsSize="xsmall"
                                title={this.props.appStore.userName}
                                id="dropdown-size-small"
                            >
                                <MenuItem href={buildCBioPortalPageUrl(this.props.appStore.logoutUrl)} eventKey="1">Sign Out</MenuItem>
                                <MenuItem eventKey="2" onSelect={this.createTokenFunction}>Create Token</MenuItem>
                            </DropdownButton>
                        </div>
                    </Then>
                    <Else>
                        <If condition={AppConfig.authGoogleLogin}>
                            <div className="identity"><button className="btn btn-default" onClick={()=>openSocialAuthWindow(this.props.appStore)}>Login</button></div>
                        </If>
                    </Else>
                </If>

                <If condition={!_.isEmpty(AppConfig.serverConfig.skin_right_logo)}>
                    <img id="institute-logo" src={AppConfig.serverConfig.skin_right_logo!} alt="Institute Logo" />
                </If>

            </div>
        </header>
    }
}
