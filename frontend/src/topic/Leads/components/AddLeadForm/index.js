import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import TextInput from '../../../../public/components/TextInput';
import Form, {
    requiredCondition,
    urlCondition,
} from '../../../../public/components/Form';
import {
    PrimaryButton,
    SuccessButton,
} from '../../../../public/components/Button';


// uploadStates -> birth, uploading, success, fail
// formStates -> stale, error, pending
const propTypes = {
    className: PropTypes.string,
    data: PropTypes.object.isRequired, // eslint-disable-line
    leadId: PropTypes.string.isRequired,
    leadType: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onFailure: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired,
    pending: PropTypes.bool.isRequired,
    ready: PropTypes.bool.isRequired,
    stale: PropTypes.bool.isRequired,
};
const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class AddLeadForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            formErrors: [],
            formFieldErrors: {},
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
        });
        this.props.onChange(this.props.leadId, values);
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
        this.props.onFailure(this.props.leadId);
    };

    successCallback = (values) => {
        console.log(values);
        // Rest Request goes here
        this.props.onSuccess(this.props.leadId, values);
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
        } = this.state;

        const {
            className,
            data,
            pending,
            stale,
            ready,
            leadType,
        } = this.props;
        const formValues = data;

        return (
            <Form
                changeCallback={this.changeCallback}
                className={className}
                elements={this.elements}
                failureCallback={this.failureCallback}
                onSubmit={this.handleSubmit}
                styleName="add-lead-form"
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
                <header styleName="header">
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
                        {
                            formErrors.length <= 0 &&
                                <div styleName="error empty">
                                    -
                                </div>
                        }
                    </div>
                    <div styleName="action-buttons">
                        <SuccessButton
                            disabled={pending || !stale || !ready}
                        >
                            Save
                        </SuccessButton>
                        <PrimaryButton
                            disabled={pending || !stale || !ready}
                        >
                            Save &amp; next
                        </PrimaryButton>
                    </div>
                </header>
                <TextInput
                    label="Title"
                    formname="title"
                    placeholder="Enter a descriptive name"
                    styleName="title"
                    initialValue={formValues.title}
                    error={formFieldErrors.title}
                />
                <TextInput
                    label="Source"
                    formname="source"
                    placeholder="Enter a descriptive name"
                    styleName="source"
                    initialValue={formValues.source}
                    error={formFieldErrors.source}
                />
                <TextInput
                    label="Confidentiality"
                    formname="confidentiality"
                    placeholder="Enter a descriptive name"
                    styleName="confidentiality"
                    initialValue={formValues.confidentiality}
                    error={formFieldErrors.confidentiality}
                />
                <TextInput
                    label="Assign To"
                    formname="user"
                    placeholder="Enter a descriptive name"
                    styleName="user"
                    initialValue={formValues.user}
                    error={formFieldErrors.user}

                />
                <TextInput
                    label="Publication Date"
                    formname="date"
                    placeholder="Enter a descriptive name"
                    styleName="date"
                    initialValue={formValues.date}
                    error={formFieldErrors.date}
                />
                {
                    leadType === 'website' && [
                        <TextInput
                            key="url"
                            label="URL"
                            formname="url"
                            placeholder="Enter a descriptive name"
                            styleName="url"
                            initialValue={formValues.url}
                            error={formFieldErrors.url}
                        />,
                        <TextInput
                            key="website"
                            label="Website"
                            formname="website"
                            placeholder="Enter a descriptive name"
                            styleName="website"
                            initialValue={formValues.website}
                            error={formFieldErrors.website}
                        />,
                    ]
                }
                {
                    leadType === 'text' &&
                        <div styleName="manual-entry">
                            <label
                                styleName="label"
                                htmlFor="manual-entry-input"
                            >
                                Manual Entry
                            </label>
                            <textarea
                                id="manual-entry-input"
                                rows="3"
                                styleName="textarea"
                            />
                        </div>
                }
                {
                    leadType === 'file' &&
                    <div>
                        File Upload
                    </div>
                }
            </Form>
        );
    }
}
