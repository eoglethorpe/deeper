import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Faram, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Faram';

import {
    alterResponseErrorToFaramError,
    createParamsForAfCreate,
    urlForAfCreate,
} from '../../../../../rest';
import { addNewAfAction } from '../../../../../redux';
import _ts from '../../../../../ts';
import notify from '../../../../../notify';
import schema from '../../../../../schema';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewAf: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapDispatchToProps = dispatch => ({
    addNewAf: params => dispatch(addNewAfAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class AddAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        if (this.afCreateRequest) {
            this.afCreateRequest.stop();
        }
    }

    createRequestForAfCreate = ({ title }) => {
        const { projectId } = this.props;

        const afCreateRequest = new FgRestBuilder()
            .url(urlForAfCreate)
            .params(() => createParamsForAfCreate({ project: projectId, title }))
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.addNewAf({
                        afDetail: response,
                        projectId,
                    });
                    notify.send({
                        title: _ts('notification', 'afCreate'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'afCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: _ts('notification', 'afCreate'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'afCreateFailure'),
                    duration: notify.duration.SLOW,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('notification', 'afCreate'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'afCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    faramErrors: { $internal: [_ts('project', 'frameworkCreateFailure')] },
                });
            })
            .build();
        return afCreateRequest;
    }

    // faram RELATED
    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (data) => {
        if (this.afCreateRequest) {
            this.afCreateRequest.stop();
        }

        this.afCreateRequest = this.createRequestForAfCreate(data);
        this.afCreateRequest.start();
    };

    render() {
        const {
            faramErrors,
            faramValues,
            pending,
            pristine,
        } = this.state;

        const { className } = this.props;

        return (
            <Faram
                className={`${className} ${styles.addAnalysisFrameworkForm}`}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    label={_ts('project', 'addAfTitleLabel')}
                    faramElementName="title"
                    placeholder={_ts('project', 'addAfTitlePlaceholder')}
                    autoFocus
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {_ts('project', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('project', 'modalAdd')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
