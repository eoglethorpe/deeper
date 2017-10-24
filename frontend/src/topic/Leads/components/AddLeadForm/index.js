import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import { PrimaryButton, DangerButton, SuccessButton } from '../../../../public/components/Button';
import styles from './styles.scss';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
    urlCondition,
} from '../../../../public/utils/Form';

@CSSModules(styles, { allowMultiple: true })
export default class AddLeadForm extends React.PureComponent {
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
        this.state = {
            selectedValue: 'website',
        };
        const form = new Form();
        const elements = [
            'title',
            'source',
            'confidentiality',
            'user',
            'date',
            'url',
            'website',
            'manualEntry',
        ];
        const validations = {
            title: [requiredCondition],
            source: [requiredCondition],
            confidentiality: [requiredCondition],
            user: [requiredCondition],
            date: [requiredCondition],
            url: [
                requiredCondition,
                urlCondition,
            ],
            website: [requiredCondition],
            manualEntry: [requiredCondition],
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


    handleOptionChange = (changeEvent) => {
        this.setState({ selectedValue: changeEvent.target.value });
    };

    render() {
        const { pending } = this.props;
        return (
            <div styleName="leads-details">
                <form
                    styleName="user-profile-edit-form"
                    onSubmit={this.handleSubmit}
                >
                    <header styleName="header-title">
                        <h1>Lead Form</h1>
                        <div styleName="action-buttons">
                            <DangerButton>
                                Cancel
                            </DangerButton>
                            <SuccessButton>
                                Save Changes
                            </SuccessButton>
                            <PrimaryButton>
                                Save and Next
                            </PrimaryButton>
                        </div>
                    </header>
                    {
                        pending &&
                        <div styleName="pending-overlay">
                            <i
                                className="ion-load-c"
                                styleName="loading-icon"
                            />
                        </div>
                    }
                    <div styleName="title-and-source-box">
                        <TextInput
                            label="Title"
                            placeholder="Enter a descriptive name"
                            styleName="title-box"

                            ref={this.form.updateRef('title')}
                            initialValue={this.state.formValues.title}
                            error={this.state.formErrors.title}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />

                        <TextInput
                            label="Source"
                            placeholder="Enter Source"
                            styleName="source-box"

                            ref={this.form.updateRef('source')}
                            initialValue={this.state.formValues.source}
                            error={this.state.formErrors.source}

                            onFocus={this.onFocus}
                            onChange={this.onChange}

                        />
                    </div>
                    <div styleName="other-container-box">
                        <TextInput
                            label="Confidentiality"
                            placeholder="Lead title"
                            styleName="confidentiality-box"

                            ref={this.form.updateRef('confidentiality')}
                            initialValue={this.state.formValues.confidentiality}
                            error={this.state.formErrors.confidentiality}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                        <TextInput
                            label="Assign To"
                            placeholder="Select User"
                            styleName="user-box"

                            ref={this.form.updateRef('user')}
                            initialValue={this.state.formValues.user}
                            error={this.state.formErrors.user}

                            onFocus={this.onFocus}
                            onChange={this.onChange}

                        />
                        <TextInput
                            label="Publication Date"
                            placeholder="Date Picker Goes here.."
                            styleName="date-box"

                            ref={this.form.updateRef('date')}
                            initialValue={this.state.formValues.date}
                            error={this.state.formErrors.date}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                    </div>
                    <div styleName="url-box-container">
                        <TextInput
                            label="URL"
                            placeholder="Enter URL"
                            styleName="url-box"

                            ref={this.form.updateRef('url')}
                            initialValue={this.state.formValues.url}
                            error={this.state.formErrors.url}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                        <TextInput
                            label="Website"
                            placeholder="Enter Website"
                            styleName="website-box"

                            ref={this.form.updateRef('website')}
                            initialValue={this.state.formValues.website}
                            error={this.state.formErrors.website}

                            onFocus={this.onFocus}
                            onChange={this.onChange}
                        />
                    </div>
                    <div>
                        <label htmlFor="manual-entry-box">Manual Entry </label>
                        <textarea
                            styleName="manual-entry-box"
                            cols="40"
                            rows="5"
                        />
                    </div>
                    <div>
                        File Upload
                    </div>
                </form>
            </div>
        );
    }
}
