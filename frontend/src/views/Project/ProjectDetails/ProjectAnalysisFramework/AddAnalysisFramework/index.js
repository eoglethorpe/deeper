import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Form, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    createParamsForAfCreate,
    urlForAfCreate,
} from '../../../../../rest';
import {
    addNewAfAction,
    notificationStringsSelector,
    projectStringsSelector,
} from '../../../../../redux';
import notify from '../../../../../notify';
import schema from '../../../../../schema';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    addNewAf: PropTypes.func.isRequired,
    onModalClose: PropTypes.func.isRequired,
    projectId: PropTypes.number,
    notificationStrings: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapStateToProps = state => ({
    notificationStrings: notificationStringsSelector(state),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addNewAf: params => dispatch(addNewAfAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class AddAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues: {},
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
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.addNewAf({
                        afDetail: response,
                        projectId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('afCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('afCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('afCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('afCreateFailure'),
                    duration: notify.duration.SLOW,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('afCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('afCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: { errors: ['Error while trying to save region.'] },
                });
            })
            .build();
        return afCreateRequest;
    }

    // FORM RELATED
    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (data) => {
        // Stop old post request
        if (this.afCreateRequest) {
            this.afCreateRequest.stop();
        }

        // Create new post request
        this.afCreateRequest = this.createRequestForAfCreate(data);
        this.afCreateRequest.start();
    };

    render() {
        const {
            formErrors,
            formFieldErrors,
            formValues,
            pending,
            pristine,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <Form
                className={`${className} ${styles.addAnalysisFrameworkForm}`}
                schema={this.schema}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                onSubmit={this.handleSubmit}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                value={formValues}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors formerror="" />
                <TextInput
                    label={this.props.projectStrings('addAfTitleLabel')}
                    formname="title"
                    placeholder={this.props.projectStrings('addAfTitlePlaceholder')}
                    autoFocus
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {this.props.projectStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {this.props.projectStrings('modalAdd')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
