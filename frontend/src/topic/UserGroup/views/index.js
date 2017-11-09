import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import styles from './styles.scss';
import MembersTable from '../components/MembersTable';
import ProjectsTable from '../components/ProjectsTable';
import { pageTitles } from '../../../common/utils/labels';
import {
    userGroupsSelector,
    setNavbarStateAction,
} from '../../../common/redux';

const propTypes = {
    userGroups: PropTypes.array, // eslint-disable-line
    setNavbarState: PropTypes.func.isRequired,
};

const defaultProps = {
    userGroups: [],
    leads: [],
};

const mapStateToProps = (state, props) => ({
    userGroups: userGroupsSelector(state, props),
});
const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: pageTitles.userGroup,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.projectPanel,
            ],
        });
    }

    render() {
        return (
            <div styleName="usergroup">
                <Helmet>
                    <title>{ pageTitles.userGroup }</title>
                </Helmet>
                <div styleName="title">
                    <h1>{ pageTitles.userGroup }</h1>
                </div>
                <Tabs
                    activeLinkStyle={{ none: 'none' }}
                    styleName="tabs-container"
                >
                    <div styleName="tabs-header-container">
                        <TabLink
                            styleName="tab-header"
                            to="members"
                        >
                            Members
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="Projects"
                        >
                            Projects
                        </TabLink>
                        {/* Essential for border bottom, for more info contact AdityaKhatri */}
                        <div styleName="empty-tab" />
                    </div>
                    <TabContent
                        for="members"
                        styleName="tab"
                    >
                        <MembersTable />
                    </TabContent>
                    <TabContent
                        for="Projects"
                        styleName="tab"
                    >
                        <ProjectsTable />
                    </TabContent>
                </Tabs>
            </div>
        );
    }
}
