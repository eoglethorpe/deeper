import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import { PrimaryButton, DangerButton } from '../../../../public/components/Button';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
    emailCondition,
} from '../../../../public/components/Form';

const propTypes = {
    onSubmit: PropTypes.func.isRequired, //eslint-disable-line
    pending: PropTypes.bool.isRequired, //eslint-disable-line
    onCancel: PropTypes.func.isRequired, //eslint-disable-line
};

const defaultProps = {
    values: {},
};

@CSSModules(styles, { allowMultiple: true })
export default class EditLeadForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            editLead: false,

            formValues: {},
            formErrors: [],
            formFieldErrors: {},
            stale: false,
            pending: false,
        };
        this.elements = [
            'email',
            'password'];

        this.validations = {
            email: [
                requiredCondition,
                emailCondition,
            ],

            firstName: [
                requiredCondition,
            ],

            lastName: [
                requiredCondition,
            ],
        };
    }

    // FORM RELATED

    onSubmit = () => {
        this.form.onSubmit();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.onSubmit();
        return false;
    }

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            stale: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        this.setState({ pending: true });
        // Stop old patch request
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }
        // Create new patch request and start it
        const { match } = this.props;
        const userId = match.params.userId;
        this.userPatchRequest = this.createRequestForUserPatch(userId, values);
        this.userPatchRequest.start();
    };

    handleFormCancel = (e) => {
        e.preventDefault();
        this.props.onCancel();
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            stale,
            pending,
            formValues,
        } = this.state;

        return (
            <Form
                styleName="edit-lead-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
            >
                {
                    pending &&
                    <div styleName="pending-overlay">
                        <i
                            className="ion-load-c"
                            styleName="loading-icon"
                        />
                    </div>
                }
                <div styleName="non-field-errors">
                    {
                        formErrors.map(err => (
                            <div
                                key={err}
                                styleName="error"
                            >
                                {err}
                            </div>
                        ))
                    }
                    { formErrors.length <= 0 &&
                        <div styleName="error empty">
                            -
                        </div>
                    }
                </div>
                <TextInput
                    label="Title"
                    formname="title"
                    placeholder="Enter a descriptive name"
                    initialValue={formValues.title}
                    error={formFieldErrors.title}
                />
                <TextInput
                    label="Source"
                    formname="source"
                    placeholder="Enter a descriptive name"
                    initialValue={formValues.source}
                    error={formFieldErrors.source}
                />
                <div styleName="other-container-box">
                    <TextInput
                        label="Confidentiality"
                        formname="confidentiality"
                        placeholder="Enter a descriptive name"
                        styleName="confidentiality-box"
                        initialValue={formValues.confidentiality}
                        error={formFieldErrors.confidentiality}
                    />
                    <TextInput
                        label="Assign To"
                        formname="user"
                        placeholder="Enter a descriptive name"
                        styleName="user-box"
                        initialValue={formValues.user}
                        error={formFieldErrors.user}

                    />
                </div>
                <TextInput
                    label="Publication Date"
                    formname="date"
                    placeholder="Enter a descriptive name"
                    styleName="date-box"
                    initialValue={formValues.date}
                    error={formFieldErrors.date}
                />
                <div styleName="url-box-container">
                    <TextInput
                        label="URL"
                        formname="url"
                        placeholder="Enter a descriptive name"
                        styleName="url-box"
                        initialValue={formValues.url}
                        error={formFieldErrors.url}
                    />
                    <TextInput
                        label="Website"
                        formname="website"
                        placeholder="Enter a descriptive name"
                        styleName="website-box"
                        initialValue={formValues.website}
                        error={formFieldErrors.website}
                    />
                </div>
                <div>
                    <label htmlFor="manual-entry-box">
                        Manual Entry
                    </label>
                    <textarea
                        styleName="manual-entry-box"
                        cols="10"
                        rows="3"
                    />
                </div>
                <div>
                    File Upload
                </div>
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.handleFormCancel}
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Save changes
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
