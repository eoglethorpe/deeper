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
    groupSelector,
    setNavbarStateAction,
    setUserGroupAction,
    setUsersInformationAction,

    tokenSelector,
} from '../../../common/redux';

import {
    createParamsForUser,
    createUrlForUserGroup,
    createUrlForUsers,
} from '../../../common/rest';

import { RestBuilder } from '../../../public/utils/rest';
import schema from '../../../common/schema';

const propTypes = {
    match: PropTypes.object.isRequired, // eslint-disable-line
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    userGroup: PropTypes.object, // eslint-disable-line
    setUserGroup: PropTypes.func.isRequired,
    setUsers: PropTypes.func.isRequired,
};

const defaultProps = {
    userGroups: [],
    leads: [],
};

const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    userGroup: groupSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    setUserGroup: params => dispatch(setUserGroupAction(params)),
    setUsers: params => dispatch(setUsersInformationAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserGroup extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { match } = props;
        const userGroupId = match.params.userGroupId;

        this.usersFields = ['display_name', 'email', 'id'];

        this.userGroupRequest = this.createRequestForUserGroup(userGroupId);
        this.usersRequest = this.createRequestForUsers();
    }

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

        this.userGroupRequest.start();
        this.usersRequest.start();
    }

    componentWillUnmount() {
        this.userGroupRequest.stop();
        this.usersRequest.stop();
    }

    createRequestForUserGroup = (id) => {
        const urlForUserGroup = createUrlForUserGroup(id);
        const userGroupRequest = new RestBuilder()
            .url(urlForUserGroup)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    schema.validate(response, 'userGroupGetResponse');
                    this.props.setUserGroup({
                        userGroup: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return userGroupRequest;
    }

    createRequestForUsers = () => {
        const usersRequest = new RestBuilder()
            .url(createUrlForUsers([this.usersFields]))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    schema.validate(response, 'usersGetResponse');
                    this.props.setUsers({
                        users: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return usersRequest;
    }

    render() {
        const { userGroup, match } = this.props;

        return (
            <div styleName="usergroup">
                <div styleName="left">
                    <Helmet>
                        <title>{ pageTitles.userGroup }</title>
                    </Helmet>
                    <div styleName="title">
                        <h1>{ userGroup.title }</h1>
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
                            <MembersTable
                                memberData={userGroup.memberships || []}
                                userGroupId={+match.params.userGroupId}
                            />
                        </TabContent>
                        <TabContent
                            for="Projects"
                            styleName="tab"
                        >
                            <ProjectsTable
                                match={match}
                            />
                        </TabContent>
                    </Tabs>
                </div>
                <div styleName="right">
                    Activity Log
                </div>
            </div>
        );
    }
}
