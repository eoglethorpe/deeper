import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import {
    PrimaryButton,
    DangerButton,
} from '../../../../public/components/Button';
// import { ImageInput } from '../../../../public/components/FileInput';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
} from '../../../../public/components/Form';

const propTypes = {
    onCancel: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    formValues: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class UserProfileEditForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: this.props.formValues,
            stale: false,
        };
        this.elements = [
            'firstName',
            'lastName',
            'organization',
        ];
        this.validations = {
            firstName: [requiredCondition],
            lastName: [requiredCondition],
            organization: [requiredCondition],
        };
    }

    // FORM RELATED

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
        this.props.onSubmit(values);
    };

    handleFormCancel = (e) => {
        e.preventDefault();
        this.props.onCancel();
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            stale,
        } = this.state;
        const { pending } = this.props;
        return (
            <Form
                styleName="user-profile-edit-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
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
                {/*
                <ImageInput
                    showPreview
                    styleName="display-picture"
                />
                */}
                <TextInput
                    label="First name"
                    formname="firstName"
                    placeholder="Enter a descriptive name"
                    initialValue={formValues.firstName}
                    error={formFieldErrors.firstName}
                />
                <TextInput
                    label="Last name"
                    formname="lastName"
                    placeholder="Enter a descriptive name"
                    initialValue={formValues.lastName}
                    error={formFieldErrors.lastName}
                />
                <TextInput
                    label="Organization"
                    formname="organization"
                    placeholder="Enter a descriptive name"
                    initialValue={formValues.organization}
                    error={formFieldErrors.organization}
                />
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
