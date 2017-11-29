import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import {
    DangerButton,
    PrimaryButton,
} from '../../../../../../public/components/Action';
import {
    Form,
    NonFieldErrors,
    TextInput,
    requiredCondition,
    urlCondition,
} from '../../../../../../public/components/Input';

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
            'title',
            'source',
            'confidentiality',
            'assignTo',
            'publicationDate',
            'url',
            'website',
        ];

        this.validations = {
            title: [
                requiredCondition,
            ],

            source: [
                requiredCondition,
            ],

            confidentiality: [
                requiredCondition,
            ],

            assignTo: [
                requiredCondition,
            ],

            publicationDate: [
                requiredCondition,
            ],

            url: [
                requiredCondition,
                urlCondition,
            ],

            website: [
                requiredCondition,
            ],

        };
    }

    // FORM RELATED

    onSubmit = () => {
        this.form.onSubmit();
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
        console.log(values);
    };

    handleFormCancel = () => {
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
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label="Title"
                    formname="title"
                    placeholder="Enter a descriptive name"
                    value={formValues.title}
                    error={formFieldErrors.title}
                />
                <TextInput
                    label="Source"
                    formname="source"
                    placeholder="Enter a descriptive name"
                    value={formValues.source}
                    error={formFieldErrors.source}
                />
                <div styleName="other-container-box">
                    <TextInput
                        label="Confidentiality"
                        formname="confidentiality"
                        placeholder="Enter a descriptive name"
                        styleName="confidentiality-box"
                        value={formValues.confidentiality}
                        error={formFieldErrors.confidentiality}
                    />
                    <TextInput
                        label="Assign To"
                        formname="assignTo"
                        placeholder="Enter a descriptive name"
                        styleName="user-box"
                        value={formValues.assignTo}
                        error={formFieldErrors.assignTo}

                    />
                </div>
                <TextInput
                    label="Publication Date"
                    formname="publicationDate"
                    placeholder="Enter a descriptive name"
                    styleName="date-box"
                    value={formValues.publicationDate}
                    error={formFieldErrors.publicationDate}
                />
                <div styleName="url-box-container">
                    <TextInput
                        label="URL"
                        formname="url"
                        placeholder="Enter a descriptive name"
                        styleName="url-box"
                        value={formValues.url}
                        error={formFieldErrors.url}
                    />
                    <TextInput
                        label="Website"
                        formname="website"
                        placeholder="Enter a descriptive name"
                        styleName="website-box"
                        value={formValues.website}
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
                        type="button"
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
