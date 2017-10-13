import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import Helmet from 'react-helmet';
import styles from './styles.scss';
import { pageTitles } from '../../../common/utils/labels';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    TransparentPrimaryButton,
} from '../../../public/components/Button';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(null, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectPanel extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            sideBarVisibility: false,
        };
    }

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.projectPanel,
            ],
        });
    }

    showProjectList = () => {
        this.setState({
            sideBarVisibility: true,
        });
    };

    closeProjectList = () => {
        this.setState({
            sideBarVisibility: false,
        });
    };

    render() {
        const { sideBarVisibility } = this.state;

        return (
            <div styleName="project-panel">
                <Helmet>
                    <title>{ pageTitles.projectPanel }</title>
                </Helmet>
                <div
                    styleName={sideBarVisibility ? 'content side-bar-shown' : 'content'}
                >
                    <header styleName="header">
                        <h1 styleName="heading">
                            { pageTitles.projectPanel }
                        </h1>
                        {!sideBarVisibility &&
                            <TransparentPrimaryButton onClick={this.showProjectList}>
                                Show all projects
                            </TransparentPrimaryButton>
                        }
                    </header>
                    <Tabs
                        activeLinkStyle={{ none: 'none' }}
                        styleName="tabs-container"
                    >
                        <div styleName="tabs-header-container">
                            <TabLink
                                styleName="tab-header"
                                to="project-details"
                            >
                                Details
                            </TabLink>
                            <TabLink
                                styleName="tab-header"
                                to="geo-areas"
                            >
                                Geo Areas
                            </TabLink>
                            <TabLink
                                styleName="tab-header"
                                to="analysis-framework"
                            >
                                Analysis Framework
                            </TabLink>
                            {/* Essential for border bottom, for more info contact AdityaKhatri */}
                            <div styleName="empty-tab" />
                        </div>
                        <div styleName="tabs-content">
                            <TabContent
                                for="project-details"
                                styleName="tab"
                            >
                                Details
                            </TabContent>
                            <TabContent
                                for="geo-areas"
                                styleName="tab"
                            >
                                Geo Areas
                            </TabContent>
                            <TabContent
                                for="analysis-framework"
                                styleName="tab"
                            >
                                Analysis Framework
                            </TabContent>
                        </div>
                    </Tabs>
                </div>
                <div
                    styleName={sideBarVisibility ? 'side-bar show' : 'side-bar'}
                >
                    <header styleName="header">
                        <h1 styleName="heading">
                            Project List
                        </h1>
                        <TransparentPrimaryButton onClick={this.closeProjectList}>
                            <span className="ion-android-close" />
                        </TransparentPrimaryButton>
                    </header>
                </div>
            </div>
        );
    }
}
