import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import { PrimaryButton, DangerButton, SuccessButton } from '../../../../public/components/Button';
import styles from './styles.scss';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
    urlCondition,
} from '../../../../public/components/Form';

@CSSModules(styles, { allowMultiple: true })
export default class AddLeadForm extends React.PureComponent {
    static propTypes = {
    };
    static defaultProps = {
    };

    constructor(props) {
        super(props);
        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: {},
            pending: false,
            stale: false,
        };
        this.elements = [
            'title',
            'source',
            'confidentiality',
            'user',
            'date',
            'url',
            'website',
            // 'manualEntry',
        ];
        this.validations = {
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
            // manualEntry: [requiredCondition],
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

    successCallback = (data) => {
        console.log(data);

        // Rest Request goes here
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            stale,
        } = this.state;

        return (
            <div styleName="leads-details">
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
                    <header styleName="header-title">
                        <h1>Lead</h1>
                        <div styleName="action-buttons">
                            {/* <DangerButton>
                                Cancel
                                </DangerButton>
                            */}
                            <SuccessButton
                                disabled={pending || !stale}
                            >
                                Save
                            </SuccessButton>
                            <PrimaryButton
                                disabled={pending || !stale}
                            >
                                Save & Next
                            </PrimaryButton>
                        </div>
                    </header>
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
                    <div styleName="title-and-source-box">
                        <TextInput
                            label="Title"
                            formname="title"
                            placeholder="Enter a descriptive name"
                            styleName="title-box"
                            initialValue={formValues.title}
                            error={formFieldErrors.title}
                        />
                        <TextInput
                            label="Source"
                            formname="source"
                            placeholder="Enter a descriptive name"
                            styleName="source-box"
                            initialValue={formValues.source}
                            error={formFieldErrors.source}
                        />
                    </div>
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
                        <TextInput
                            label="Publication Date"
                            formname="date"
                            placeholder="Enter a descriptive name"
                            styleName="date-box"
                            initialValue={formValues.date}
                            error={formFieldErrors.date}
                        />
                    </div>
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
                            cols="40"
                            rows="5"
                        />
                    </div>
                    <div>
                        File Upload
                    </div>
                </Form>
            </div>
        );
    }
}
