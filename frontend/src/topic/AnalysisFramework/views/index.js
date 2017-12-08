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

import schema from '../../../common/schema';
import { FgRestBuilder } from '../../../public/utils/rest';
import { pageTitles } from '../../../common/constants';

import {
    LoadingAnimation,
} from '../../../public/components/View';

import {
    createParamsForUser,
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '../../../common/rest';
import {
    analysisFrameworkIdFromProps,
    setAfViewAnalysisFrameworkAction,

    afViewCurrentAnalysisFrameworkSelector,
    tokenSelector,
} from '../../../common/redux';

import styles from './styles.scss';
import Overview from './Overview';
import List from './List';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line
    analysisFrameworkId: PropTypes.string.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: afViewCurrentAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: analysisFrameworkIdFromProps(state, props),
    token: tokenSelector(state),
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
            .params(() => {
                const { token } = this.props;
                return createParamsForUser(token);
            })
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

    createRequestForAnalysisFrameworkSave = ({ analysisFramework }) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFramework.id,
        );
        const analysisFrameworkSaveRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(() => {
                const { token } = this.props;
                return createParamsForAnalysisFrameworkEdit(token, analysisFramework);
            })
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
                    <Helmet>
                        <title>{ pageTitles.analysisFramework }</title>
                    </Helmet>
                    <LoadingAnimation />
                </div>
            );
        }

        return (
            <HashRouter>
                <div styleName="analysis-framework">
                    <Helmet>
                        <title>{ pageTitles.analysisFramework }</title>
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
