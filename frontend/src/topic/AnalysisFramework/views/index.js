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
import { RestBuilder } from '../../../public/utils/rest';
import { pageTitles } from '../../../common/utils/labels';

import {
    LoadingAnimation,
} from '../../../public/components/View';

import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    setAnalysisFramework,
} from '../../../common/action-creators/domainData';
import {
    analysisFrameworkIdFromProps,
    currentAnalysisFrameworkSelector,
} from '../../../common/selectors/domainData';

import {
    createParamsForUser,
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '../../../common/rest';
import {
    tokenSelector,
} from '../../../common/redux';

import styles from './styles.scss';

import Overview from './Overview';
import List from './List';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line
    analysisFrameworkId: PropTypes.string.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    analysisFramework: undefined,
};

const mapStateToProps = (state, props) => ({
    analysisFramework: currentAnalysisFrameworkSelector(state, props),
    analysisFrameworkId: analysisFrameworkIdFromProps(state, props),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setAnalysisFramework: params => dispatch(setAnalysisFramework(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
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

        this.analysisFrameworkRequest = this.createRequestForAnalysisFramework({
            analysisFrameworkId: this.props.analysisFrameworkId,
        });
        this.analysisFrameworkRequest.start();
    }

    componentWillUnmount() {
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
    }

    createRequestForAnalysisFramework = ({ analysisFrameworkId }) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new RestBuilder()
            .url(urlForAnalysisFramework)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({ access });
            })
            .preLoad(() => {
            })
            .postLoad(() => {
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
                            />
                        )}
                    />
                    <Route
                        path="/list"
                        render={props => (
                            <List
                                {...props}
                                analysisFramework={analysisFramework}
                            />
                        )}
                    />
                </div>
            </HashRouter>
        );
    }
}
