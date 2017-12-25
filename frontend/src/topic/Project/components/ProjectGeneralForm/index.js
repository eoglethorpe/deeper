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
    TextArea,
    SelectInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    SuccessButton,
} from '../../../../public/components/Action';

import styles from './styles.scss';

const propTypes = {
    changeCallback: PropTypes.func.isRequired,
    regionOptions: PropTypes.array.isRequired, //eslint-disable-line
    userGroupsOptions: PropTypes.array.isRequired, //eslint-disable-line
    failureCallback: PropTypes.func.isRequired,
    formErrors: PropTypes.array.isRequired, //eslint-disable-line
    formFieldErrors: PropTypes.object.isRequired, //eslint-disable-line
    formValues: PropTypes.object.isRequired, //eslint-disable-line
    handleFormCancel: PropTypes.func.isRequired,
    successCallback: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    pristine: PropTypes.bool,
};

const defaultProps = {
    pending: false,
    pristine: false,
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeneralForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);

        this.elements = [
            'title',
            'startDate',
            'endDate',
            'description',
            'regions',
            'userGroups',
        ];

        this.validations = {
            name: [requiredCondition],
        };
    }

    render() {
        const {
            changeCallback,
            failureCallback,
            formErrors,
            formFieldErrors,
            formValues,
            regionOptions,
            userGroupsOptions,
            handleFormCancel,
            pending,
            pristine,
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
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={handleFormCancel}
                        type="button"
                        disabled={pending || !pristine}
                    >
                        Revert
                    </DangerButton>
                    <SuccessButton
                        disabled={pending || !pristine}
                    >
                        Save
                    </SuccessButton>
                </div>
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label="Name"
                    formname="title"
                    placeholder="Enter Project Name"
                    styleName="name"
                    value={formValues.title}
                    error={formFieldErrors.title}
                />
                <TextArea
                    label="Description"
                    formname="description"
                    placeholder="Enter Project Description"
                    styleName="description"
                    rows={3}
                    value={formValues.description}
                    error={formFieldErrors.description}
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
                <SelectInput
                    label="Regions"
                    formname="regions"
                    placeholder="Select regions"
                    styleName="regions"
                    value={formValues.regions}
                    options={regionOptions}
                    labelSelector={ProjectGeneralForm.optionLabelSelector}
                    keySelector={ProjectGeneralForm.optionKeySelector}
                    error={formFieldErrors.regions}
                    multiple
                />
                <SelectInput
                    label="User Groups"
                    formname="userGroups"
                    placeholder="Select user groups"
                    styleName="user-groups"
                    value={formValues.userGroups}
                    options={userGroupsOptions}
                    labelSelector={ProjectGeneralForm.optionLabelSelector}
                    keySelector={ProjectGeneralForm.optionKeySelector}
                    error={formFieldErrors.userGroups}
                    multiple
                />
            </Form>
        );
    }
}
