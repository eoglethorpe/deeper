import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Route,
    HashRouter,
} from 'react-router-dom';

import schema from '../../../common/schema';
import { FgRestBuilder } from '../../../public/utils/rest';

import {
    LoadingAnimation,
} from '../../../public/components/View';

import {
    createParamsForUser,
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '../../../common/rest';
import {
    afIdFromRoute,
    setAfViewAnalysisFrameworkAction,

    afViewCurrentAnalysisFrameworkSelector,
} from '../../../common/redux';

import notify from '../../../common/notify';
import { notificationStrings } from '../../../common/constants';

import styles from './styles.scss';
import Overview from './Overview';
import List from './List';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    analysisFrameworkId: PropTypes.number.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: afViewCurrentAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: afIdFromRoute(state, props),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAfViewAnalysisFrameworkAction(params)),
});

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
                            title: notificationStrings.afUpdate,
                            message: notificationStrings.afUpdateOverridden,
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
                        dismissable: false,
                        title: notificationStrings.afTitle,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.afSaveSuccess,
                        duration: 5000,
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
        const { analysisFramework } = this.props;

        if (!analysisFramework) {
            return (
                <div styleName="analysis-framework">
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <HashRouter>
                <div styleName="analysis-framework">
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
                            />
                        )}
                    />
                </div>
            </HashRouter>
        );
    }
}
