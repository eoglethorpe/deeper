import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import { PrimaryButton } from '../../../../public/components/Button';
import { ImageInput } from '../../../../public/components/FileInput';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
    emailCondition,
} from '../../../../public/utils/Form';


@CSSModules(styles)
export default class UserProfileEditForm extends React.PureComponent {
    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        pending: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        const form = new Form();
        const elements = ['email', 'password'];
        const validations = {
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

        const updateValues = (data) => {
            this.setState({
                formValues: { ...this.state.formValues, ...data },
            });
        };

        const updateErrors = (data) => {
            this.setState({
                formErrors: data,
            });
        };

        const okay = (data) => {
            this.props.onSubmit(data);
        };

        form.setElements(elements);
        form.setValidations(validations);

        // calls with new errors
        form.setCallbackForFocus(updateErrors);
        // new state
        form.setCallbackForChange(updateValues);
        // calls with success and error
        form.setCallbackForSuccessAndFailure(okay, updateErrors);

        this.form = form;

        this.state = {
            formErrors: { },
            formValues: { },
        };
    }

    onFocus = (overrideName) => {
        this.form.onFocus(overrideName);
    }

    onChange = (value) => {
        this.form.onChange(value);
    }

    onSubmit = () => {
        this.form.onSubmit();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.onSubmit();
        return false;
    }

    render() {
        const { pending } = this.props;

        return (
            <form styleName="user-profile-edit-form" onSubmit={this.handleSubmit}>
                {
                    pending && (
                        <div styleName="pending-overlay">
                            <i className="ion-load-c" styleName="loading-icon" />
                        </div>
                    )
                }
                <ImageInput
                    showPreview
                    styleName="display-picture"
                />
                <TextInput
                    label="First name"
                    placeholder="John"

                    ref={this.form.updateRef('first-name')}
                    initialValue={this.state.formValues.email}
                    error={this.state.formErrors.email}

                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <TextInput
                    label="Last name"
                    placeholder="Doe"

                    ref={this.form.updateRef('last-name')}
                    initialValue={this.state.formValues.email}
                    error={this.state.formErrors.email}

                    onFocus={this.onFocus}
                    onChange={this.onChange}
                />
                <div styleName="action-buttons">
                    <PrimaryButton>
                        Save changes
                    </PrimaryButton>
                </div>
            </form>
        );
    }
}
