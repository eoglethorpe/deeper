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
import { pageTitles } from '../../../../common/constants';

import {
    LoadingAnimation,
} from '../../../../public/components/View';

import {
    leadIdFromRoute,
    /*
    editEntryViewCurrentLeadSelector,
    editEntryViewCurrentProjectSelector,
    */
    editEntryViewCurrentAnalysisFrameworkSelector,
    editEntryViewEntriesSelector,
    editEntryViewSelectedEntryIdSelector,

    tokenSelector,

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
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    leadId: PropTypes.string.isRequired,
    /*
    lead: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    project: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    */
    token: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setAnalysisFramework: PropTypes.func.isRequired,
    setLead: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,

    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types

    selectedEntryId: PropTypes.string,
};

const defaultProps = {
    /*
    lead: undefined,
    project: undefined,
    */
    analysisFramework: undefined,
    selectedEntryId: undefined,
};

const mapStateToProps = (state, props) => ({
    leadId: leadIdFromRoute(state, props),
    token: tokenSelector(state),

    /*
    lead: editEntryViewCurrentLeadSelector(state, props),
    project: editEntryViewCurrentProjectSelector(state, props),
    */

    entries: editEntryViewEntriesSelector(state, props),
    selectedEntryId: editEntryViewSelectedEntryIdSelector(state, props),
    analysisFramework: editEntryViewCurrentAnalysisFrameworkSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    setLead: params => dispatch(setEditEntryViewLeadAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class EditEntryView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
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
            entries,
            selectedEntryId,
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
                                selectedEntryId={selectedEntryId}
                                entries={entries}
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
                                entries={entries}
                                analysisFramework={analysisFramework}
                            />
                        )}
                    />
                </div>
            </HashRouter>
        );
    }
}
