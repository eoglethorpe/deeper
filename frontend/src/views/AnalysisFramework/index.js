import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
} from 'react-router-dom';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import BoundError from '../../components/BoundError';
import {
    createParamsForUser,
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '../../rest';
import {
    afIdFromRoute,
    setAfViewAnalysisFrameworkAction,

    afViewCurrentAnalysisFrameworkSelector,
    notificationStringsSelector,
} from '../../redux';
import notify from '../../notify';
import schema from '../../schema';

import Overview from './Overview';
import List from './List';
import styles from './styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    notificationStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: afViewCurrentAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: afIdFromRoute(state, props),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAfViewAnalysisFrameworkAction(params)),
});

@BoundError
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        this.analysisFrameworkRequest = this.createRequestForAnalysisFramework(
            this.props.analysisFrameworkId,
        );
        this.analysisFrameworkRequest.start();
    }

    componentWillUnmount() {
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
        if (this.analysisFrameworkSaveRequest) {
            this.analysisFrameworkSaveRequest.stop();
        }
    }

    createRequestForAnalysisFramework = (analysisFrameworkId) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    const { analysisFramework } = this.props;

                    // no analysis framework, set
                    // if analysis framework, set only if versionId is greater
                    if (!analysisFramework) {
                        this.props.setAnalysisFramework({
                            analysisFramework: response,
                        });
                    } else if (analysisFramework.versionId < response.versionId) {
                        notify.send({
                            type: notify.type.WARNING,
                            title: this.props.notificationStrings('afUpdate'),
                            message: this.props.notificationStrings('afUpdateOverridden'),
                            duration: notify.duration.SLOW,
                        });
                        this.props.setAnalysisFramework({
                            analysisFramework: response,
                        });
                    } // else skip
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkRequest;
    }

    createRequestForAnalysisFrameworkSave = ({ analysisFramework }) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFramework.id,
        );
        const analysisFrameworkSaveRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(() => createParamsForAnalysisFrameworkEdit(analysisFramework))
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({
                        analysisFramework: response,
                    });
                    notify.send({
                        title: this.props.notificationStrings('afTitle'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('afSaveSuccess'),
                        duration: notify.duration.SLOW,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkSaveRequest;
    }

    handleSave = () => {
        if (!this.props.analysisFramework) {
            return;
        }

        this.analysisFrameworkSaveRequest = this.createRequestForAnalysisFrameworkSave({
            analysisFramework: this.props.analysisFramework,
        });
        this.analysisFrameworkSaveRequest.start();
    }

    render() {
        const {
            analysisFramework,
            history,
        } = this.props;

        if (!analysisFramework) {
            return (
                <div className={styles.analysisFramework}>
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <HashRouter>
                <div className={styles.analysisFramework}>
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
                                analysisFramework={analysisFramework}
                                onSave={this.handleSave}
                                mainHistory={history}
                            />
                        )}
                    />
                    <Route
                        path="/list"
                        render={props => (
                            <List
                                {...props}
                                analysisFramework={analysisFramework}
                                onSave={this.handleSave}
                                mainHistory={history}
                            />
                        )}
                    />
                </div>
            </HashRouter>
        );
    }
}
