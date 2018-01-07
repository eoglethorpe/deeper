import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Form,
    NonFieldErrors,
    TextInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';

import { FgRestBuilder } from '../../../../public/utils/rest';

import {
    transformResponseErrorToFormError,
    createParamsForAfCreate,
    urlForAfCreate,
} from '../../../../common/rest';
import {
    addNewAfAction,
} from '../../../../common/redux';
import {
    notificationStrings,
    projectStrings,
} from '../../../../common/constants';
import notify from '../../../../common/notify';

import schema from '../../../../common/schema';
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
@CSSModules(styles, { allowMultiple: true })
export default class AddAnalysisFramework extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            pristine: false,
        };

        this.elements = [
            'title',
        ];
        this.validations = {
            title: [requiredCondition],
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
                        title: notificationStrings.afCreate,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.afCreateSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: notificationStrings.afCreate,
                    type: notify.type.ERROR,
                    message: notificationStrings.afCreateFailure,
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
                    title: notificationStrings.afCreate,
                    type: notify.type.ERROR,
                    message: notificationStrings.afCreateFatal,
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: ['Error while trying to save region.'],
                });
            })
            .build();
        return afCreateRequest;
    }

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
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
            formErrors = [],
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
                className={className}
                styleName="add-analysis-framework-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label={projectStrings.addAfTitleLabel}
                    formname="title"
                    placeholder={projectStrings.addAfTitlePlaceholder}
                    value={formValues.title}
                    error={formFieldErrors.title}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                        disabled={pending}
                    >
                        {projectStrings.modalCancel}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        {projectStrings.modalAdd}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
