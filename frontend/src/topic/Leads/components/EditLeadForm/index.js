import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import { PrimaryButton } from '../../../../public/components/Button';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
    emailCondition,
} from '../../../../public/utils/Form';


@CSSModules(styles)
export default class EditLeadForm extends React.PureComponent {
    static propTypes = {
        onSubmit: PropTypes.func.isRequired,
        pending: PropTypes.bool.isRequired,
        values: PropTypes.shape({
            title: PropTypes.string,
        }),
    };

    static defaultProps = {
        values: {},
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
            formValues: props.values,
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
            <form styleName="edit-lead-form" onSubmit={this.handleSubmit}>
                {
                    pending && (
                        <div styleName="pending-overlay">
                            <i className="ion-load-c" styleName="loading-icon" />
                        </div>
                    )
                }
                <TextInput
                    label="Title"
                    placeholder="Lead title"

                    ref={this.form.updateRef('lead-title')}
                    initialValue={this.state.formValues.title}
                    error={this.state.formErrors.title}

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
