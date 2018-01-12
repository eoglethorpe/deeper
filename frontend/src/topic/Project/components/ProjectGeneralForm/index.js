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
    MultiSelectInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    SuccessButton,
} from '../../../../public/components/Action';

import {
    projectStrings,
} from '../../../../common/constants';

import styles from './styles.scss';

const propTypes = {
    changeCallback: PropTypes.func.isRequired,
    regionOptions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupsOptions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    failureCallback: PropTypes.func.isRequired,
    formErrors: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    formFieldErrors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    formValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
                        {projectStrings.modalRevert}
                    </DangerButton>
                    <SuccessButton
                        disabled={pending || !pristine}
                    >
                        {projectStrings.modalSave}
                    </SuccessButton>
                </div>
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label={projectStrings.projectNameLabel}
                    formname="title"
                    placeholder={projectStrings.projectNamePlaceholder}
                    styleName="name"
                    value={formValues.title}
                    error={formFieldErrors.title}
                />
                <TextArea
                    label={projectStrings.projectDescriptionLabel}
                    formname="description"
                    placeholder={projectStrings.projectDescriptionPlaceholder}
                    styleName="description"
                    rows={3}
                    value={formValues.description}
                    error={formFieldErrors.description}
                />
                <DateInput
                    label={projectStrings.projectStartDateLabel}
                    formname="startDate"
                    placeholder={projectStrings.projectStartDatePlaceholder}
                    styleName="start-date"
                    value={formValues.startDate}
                    error={formFieldErrors.startDate}
                />
                <DateInput
                    label={projectStrings.projectEndDateLabel}
                    formname="endDate"
                    placeholder={projectStrings.projectEndDatePlaceholder}
                    styleName="end-date"
                    value={formValues.endDate}
                    error={formFieldErrors.endDate}
                />
                <MultiSelectInput
                    label={projectStrings.projectRegionLabel}
                    formname="regions"
                    placeholder={projectStrings.projectRegionPlaceholder}
                    styleName="regions"
                    value={formValues.regions}
                    options={regionOptions}
                    labelSelector={ProjectGeneralForm.optionLabelSelector}
                    keySelector={ProjectGeneralForm.optionKeySelector}
                    error={formFieldErrors.regions}
                />
                <MultiSelectInput
                    label={projectStrings.projectUserGroupLabel}
                    formname="userGroups"
                    placeholder={projectStrings.projectUserGroupPlaceholder}
                    styleName="user-groups"
                    value={formValues.userGroups}
                    options={userGroupsOptions}
                    labelSelector={ProjectGeneralForm.optionLabelSelector}
                    keySelector={ProjectGeneralForm.optionKeySelector}
                    error={formFieldErrors.userGroups}
                />
            </Form>
        );
    }
}
