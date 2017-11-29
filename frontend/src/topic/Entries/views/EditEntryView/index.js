import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
} from 'react-router-dom';

import schema from '../../../../common/schema';
import { RestBuilder } from '../../../../public/utils/rest';
import { pageTitles } from '../../../../common/utils/labels';

import {
    LoadingAnimation,
} from '../../../../public/components/View';

import {
    leadIdFromProps,
    editEntryViewCurrentLeadSelector,
    editEntryViewCurrentProjectSelector,
    editEntryViewCurrentAnalysisFrameworkSelector,
    tokenSelector,

    setNavbarStateAction,
    setAnalysisFrameworkAction,
    setEditEntryViewLeadAction,
    setProjectAction,
} from '../../../../common/redux';
import {
    createParamsForUser,
    createUrlForAnalysisFramework,
    createUrlForLead,
    createUrlForProject,
} from '../../../../common/rest';

import styles from './styles.scss';
import Overview from './Overview';
import List from './List';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line
    lead: PropTypes.object, // eslint-disable-line
    leadId: PropTypes.string.isRequired,
    project: PropTypes.object, // eslint-disable-line
    token: PropTypes.object.isRequired, // eslint-disable-line
    setAnalysisFramework: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,
};

const defaultProps = {
    lead: undefined,
    project: undefined,
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: editEntryViewCurrentAnalysisFrameworkSelector(state, props),
    lead: editEntryViewCurrentLeadSelector(state, props),
    leadId: leadIdFromProps(state, props),
    project: editEntryViewCurrentProjectSelector(state, props),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setLead: params => dispatch(setEditEntryViewLeadAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class EditEntryView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: pageTitles.entries,
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

        this.leadRequest = this.createRequestForLead(this.props.leadId);
        this.leadRequest.start();
    }

    componentWillUnmount() {
        if (this.leadRequest) {
            this.leadRequest.stop();
        }

        if (this.projectRequest) {
            this.projectRequest.stop();
        }

        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
    }

    createRequestForLead = (leadId) => {
        const leadRequest = new RestBuilder()
            .url(createUrlForLead(leadId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .retryTime(1000)
            .success((response) => {
                try {
                    schema.validate(response, 'lead');
                    this.props.setLead({
                        lead: response,
                    });

                    this.projectRequest = this.createRequestForProject(response.project);
                    this.projectRequest.start();
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return leadRequest;
    }

    createRequestForProject = (projectId) => {
        const projectRequest = new RestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .retryTime(1000)
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({
                        project: response,
                    });

                    this.analysisFramework = this.createRequestForAnalysisFramework(
                        response.analysisFramework,
                    );
                    this.analysisFramework.start();
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectRequest;
    };

    createRequestForAnalysisFramework = (analysisFrameworkId) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new RestBuilder()
            .url(urlForAnalysisFramework)
            .params(() => {
                const { token } = this.props;
                return createParamsForUser(token);
            })
            .retryTime(1000)
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({
                        analysisFramework: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkRequest;
    }

    render() {
        const {
            analysisFramework,
            leadId,
        } = this.props;

        if (!analysisFramework) {
            return (
                <div styleName="edit-entry">
                    <Helmet>
                        <title>{ pageTitles.editEntry }</title>
                    </Helmet>
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <HashRouter>
                <div styleName="edit-entry">
                    <Helmet>
                        <title>{ pageTitles.editEntry }</title>
                    </Helmet>
                    <Route
                        exact
                        path="/"
                        component={
                            () => (
                                <Redirect to="/overview" />
                            )
                        }
                    />
                    <Route
                        path="/overview"
                        render={props => (
                            <Overview
                                {...props}
                                leadId={leadId}
                                analysisFramework={analysisFramework}
                            />
                        )}
                    />
                    <Route
                        path="/list"
                        render={props => (
                            <List
                                {...props}
                                leadId={leadId}
                                analysisFramework={analysisFramework}
                            />
                        )}
                    />
                </div>
            </HashRouter>
        );
    }
}
