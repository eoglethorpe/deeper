import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import MultiViewContainer from '../../vendor/react-store/components/View/MultiViewContainer';
import { checkVersion } from '../../vendor/react-store/utils/common';

import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';
import {
    createParamsForUser,
    createParamsForAnalysisFrameworkEdit,
    createUrlForAnalysisFramework,
} from '../../rest';
import {
    afIdFromRoute,
    setAfViewAnalysisFrameworkAction,

    afViewCurrentAnalysisFrameworkSelector,
} from '../../redux';
import notify from '../../notify';
import schema from '../../schema';
import _ts from '../../ts';

import Overview from './Overview';
import List from './List';
import styles from './styles.scss';

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

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class AnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.views = {
            overview: {
                component: () => (
                    <Overview
                        analysisFramework={this.props.analysisFramework}
                        onSave={this.handleSave}
                    />
                ),
            },
            list: {
                component: () => (
                    <List
                        analysisFramework={this.props.analysisFramework}
                        onSave={this.handleSave}
                    />
                ),
            },
        };

        this.defaultHash = 'overview';
        if (!window.location.hash) {
            window.location.replace(`#/${this.defaultHash}`);
        }
    }

    componentWillMount() {
        this.analysisFrameworkRequest = this.createRequestForAnalysisFramework(
            this.props.analysisFrameworkId,
        );
        this.analysisFrameworkRequest.start();
    }

    componentWillReceiveProps() {
        if (!window.location.hash) {
            window.location.replace(`#/${this.defaultHash}`);
        }
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
                    const { analysisFramework = {} } = this.props;

                    const {
                        shouldSetValue,
                        isValueOverriden,
                    } = checkVersion(analysisFramework.versionId, response.versionId);

                    if (shouldSetValue) {
                        this.props.setAnalysisFramework({
                            analysisFramework: response,
                        });
                    }
                    if (isValueOverriden) {
                        notify.send({
                            type: notify.type.WARNING,
                            title: _ts('notification', 'afUpdate'),
                            message: _ts('notification', 'afUpdateOverridden'),
                            duration: notify.duration.SLOW,
                        });
                    }
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
                        title: _ts('notification', 'afTitle'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'afSaveSuccess'),
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
        const { analysisFramework } = this.props;

        if (!analysisFramework) {
            return (
                <div className={styles.analysisFramework}>
                    <LoadingAnimation large />
                </div>
            );
        }


        return (
            <div className={styles.analysisFramework}>
                <MultiViewContainer
                    views={this.views}
                    useHash
                />
            </div>
        );
    }
}
