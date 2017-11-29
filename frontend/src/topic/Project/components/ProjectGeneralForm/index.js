import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    DateInput,
    Form,
    NonFieldErrors,
    TextInput,
    SelectInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
    SuccessButton,
} from '../../../../public/components/Action';

import styles from './styles.scss';

const propTypes = {
    changeCallback: PropTypes.func.isRequired,
    failureCallback: PropTypes.func.isRequired,
    formErrors: PropTypes.array.isRequired, //eslint-disable-line
    formFieldErrors: PropTypes.object.isRequired, //eslint-disable-line
    formValues: PropTypes.object.isRequired, //eslint-disable-line
    handleFormCancel: PropTypes.func.isRequired,
    successCallback: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    stale: PropTypes.bool,
};

const defaultProps = {
    pending: false,
    stale: false,
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeneralForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.elements = [
            'name',
            'startDate',
            'endDate',
            'description',
            'regions',
            'userGroups',
            'otherMembers',
            'admins',
        ];

        this.validations = {
            name: [requiredCondition],
            startDate: [requiredCondition],
            endDate: [requiredCondition],
            description: [requiredCondition],
            regions: [requiredCondition],
            userGroups: [requiredCondition],
        };
    }

    regionLabelSelector = (d = {}) => d.title;
    regionKeySelector = (d = {}) => d.id;

    render() {
        const {
            changeCallback,
            failureCallback,
            formErrors = [],
            formFieldErrors,
            formValues,
            handleFormCancel,
            pending,
            stale,
            successCallback,
        } = this.props;

        return (
            <Form
                changeCallback={changeCallback}
                elements={this.elements}
                failureCallback={failureCallback}
                styleName="project-general-form"
                successCallback={successCallback}
                validation={this.validation}
                validations={this.validations}
            >
                { pending && <LoadingAnimation /> }
                <header styleName="header">
                    <NonFieldErrors errors={formErrors} />
                    <div styleName="action-buttons">
                        <DangerButton
                            onClick={handleFormCancel}
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
                    value={formValues.title}
                    error={formFieldErrors.title}
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
                <SelectInput
                    label="Regions"
                    formname="regions"
                    placeholder="Select regions"
                    styleName="regions"
                    value={formValues.regions}
                    options={formValues.regionOptions}
                    labelSelector={this.regionLabelSelector}
                    keySelector={this.regionKeySelector}
                    error={formFieldErrors.regions}
                    multiple
                />
                <TextInput
                    label="User Groups"
                    formname="userGroups"
                    placeholder="Select User Group"
                    styleName="user-groups"
                    value={formValues.userGroups}
                    error={formFieldErrors.userGroups}
                />
            </Form>
        );
    }
}
