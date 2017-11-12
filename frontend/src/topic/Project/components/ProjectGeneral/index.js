import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    DateInput,
    Form,
    NonFieldErrors,
    TextInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
    SuccessButton,
} from '../../../../public/components/Action';

import styles from './styles.scss';

const propTypes = {
    pending: PropTypes.bool,
    stale: PropTypes.bool,
};

const defaultProps = {
    pending: false,
    stale: false,
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeneral extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            stale: false,
            pending: false,
            formValues: {},
        };

        this.elements = [
            'name',
            'startDate',
            'endDate',
            'description',
            'countries',
            'userGroups',
            'otherMembers',
            'admins',
        ];

        this.validations = {
            name: [requiredCondition],
            startDate: [requiredCondition],
            endDate: [requiredCondition],
            description: [requiredCondition],
            countries: [requiredCondition],
            userGroups: [requiredCondition],
            otherMembers: [requiredCondition],
            admins: [requiredCondition],
        };
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        console.log(values);
        // Rest Request goes here
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
        } = this.state;

        const {
            pending,
            stale,
        } = this.props;

        return (
            <Form
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                onSubmit={this.handleSubmit}
                styleName="project-general-form"
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
                    <NonFieldErrors errors={formErrors} />
                    <div styleName="action-buttons">
                        <DangerButton
                            onClick={this.handleFormCancel}
                            disabled={pending}
                        >
                            Cancel
                        </DangerButton>
                        <SuccessButton
                            disabled={pending || !stale}
                        >
                            Save
                        </SuccessButton>
                        <PrimaryButton
                            disabled={pending || !stale}
                        >
                            Save &amp; next
                        </PrimaryButton>
                    </div>
                </header>
                <TextInput
                    label="Name"
                    formname="name"
                    placeholder="Enter Project Name"
                    styleName="name"
                    value={formValues.name}
                    error={formFieldErrors.name}
                />
                <DateInput
                    label="Start Date"
                    formname="startDate"
                    placeholder="Enter Project Start Date"
                    styleName="start-date"
                    value={formValues.startDate}
                    error={formFieldErrors.startDate}
                />
                <DateInput
                    label="End Date"
                    formname="endDate"
                    placeholder="Enter Project End Date"
                    styleName="end-date"
                    value={formValues.endDate}
                    error={formFieldErrors.endDate}
                />
                <TextInput
                    label="Description"
                    formname="description"
                    placeholder="Enter Project Description"
                    styleName="description"
                    value={formValues.description}
                    error={formFieldErrors.description}

                />
                <TextInput
                    label="Countries"
                    formname="countries"
                    placeholder="Select countries"
                    styleName="countries"
                    value={formValues.countries}
                    error={formFieldErrors.countries}
                />
                <TextInput
                    label="User Groups"
                    formname="userGroups"
                    placeholder="Select User Group"
                    styleName="user-groups"
                    value={formValues.userGroups}
                    error={formFieldErrors.userGroups}
                />
                <TextInput
                    label="Other Members"
                    formname="otherMembers"
                    placeholder="Select Project Members"
                    styleName="other-members"
                    value={formValues.otherMembers}
                    error={formFieldErrors.otherMembers}
                />
                <TextInput
                    label="Admins"
                    formname="admins"
                    placeholder="Select Project Admins"
                    styleName="admins"
                    value={formValues.admins}
                    error={formFieldErrors.admins}
                />
            </Form>
        );
    }
}
