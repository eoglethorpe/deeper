import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import SelectInputWithList from '../../../../../vendor/react-store/components/Input/SelectInputWithList';
import TabularSelectInput from '../../../../../vendor/react-store/components/Input/TabularSelectInput';
import DateInput from '../../../../../vendor/react-store/components/Input/DateInput';
import TextArea from '../../../../../vendor/react-store/components/Input/TextArea';
import Form, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Form';

import {
    projectStringsSelector,
} from '../../../../../redux';

import styles from './styles.scss';

const propTypes = {
    changeCallback: PropTypes.func.isRequired,
    regionOptions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    userGroupsOptions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    memberOptions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    failureCallback: PropTypes.func.isRequired,
    formErrors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    formFieldErrors: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    formValues: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    memberHeaders: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    handleFormCancel: PropTypes.func.isRequired,
    successCallback: PropTypes.func.isRequired,
    pending: PropTypes.bool,
    pristine: PropTypes.bool,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    pending: false,
    pristine: false,
    className: '',
};

const mapStateToProps = state => ({
    projectStrings: projectStringsSelector(state),
});

@connect(mapStateToProps)
export default class ProjectGeneralForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    static memberOptionLabelSelector = (d = {}) => d.name;
    static memberOptionKeySelector = (d = {}) => d.id;

    constructor(props) {
        super(props);

        this.schema = {
            fields: {
                title: [requiredCondition],
                startDate: [],
                endDate: [],
                description: [],
                regions: [],
                userGroups: [],
                memberships: [],
            },
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
            memberOptions,
            handleFormCancel,
            memberHeaders,
            pending,
            pristine,
            successCallback,
            projectStrings,
        } = this.props;

        return (
            <Form
                styleName="project-general-form"
                changeCallback={changeCallback}
                failureCallback={failureCallback}
                className={styles['project-general-form']}
                successCallback={successCallback}
                schema={this.schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <div className={styles['action-buttons']}>
                    <DangerButton
                        onClick={handleFormCancel}
                        type="button"
                        disabled={pending || !pristine}
                    >
                        {projectStrings('modalRevert')}
                    </DangerButton>
                    <SuccessButton disabled={pending || !pristine} >
                        {projectStrings('modalSave')}
                    </SuccessButton>
                </div>
                <NonFieldErrors
                    className={styles['non-field-errors']}
                    formerror=""
                />
                <div className={styles['inputs-container']}>
                    <TextInput
                        label={this.props.projectStrings('projectNameLabel')}
                        formname="title"
                        placeholder={this.props.projectStrings('projectNamePlaceholder')}
                        className={styles.name}
                    />
                    <DateInput
                        label={this.props.projectStrings('projectStartDateLabel')}
                        formname="startDate"
                        placeholder={this.props.projectStrings('projectStartDatePlaceholder')}
                        className={styles['start-date']}
                    />
                    <DateInput
                        label={this.props.projectStrings('projectEndDateLabel')}
                        formname="endDate"
                        placeholder={this.props.projectStrings('projectEndDatePlaceholder')}
                        className={styles['end-date']}
                    />
                </div>
                <TextArea
                    label={projectStrings('projectDescriptionLabel')}
                    formname="description"
                    placeholder={projectStrings('projectDescriptionPlaceholder')}
                    className={styles.description}
                    rows={3}
                />
                <div className={styles['selects-container']}>
                    <div className={styles['regions-usergroup-container']}>
                        <SelectInputWithList
                            label={this.props.projectStrings('projectRegionLabel')}
                            formname="regions"
                            placeholder={this.props.projectStrings('projectRegionPlaceholder')}
                            className={styles.regions}
                            options={regionOptions}
                            labelSelector={ProjectGeneralForm.optionLabelSelector}
                            keySelector={ProjectGeneralForm.optionKeySelector}
                        />
                        <SelectInputWithList
                            label={this.props.projectStrings('projectUserGroupLabel')}
                            formname="userGroups"
                            placeholder={this.props.projectStrings('projectUserGroupPlaceholder')}
                            className={styles['user-groups']}
                            options={userGroupsOptions}
                            labelSelector={ProjectGeneralForm.optionLabelSelector}
                            keySelector={ProjectGeneralForm.optionKeySelector}
                        />
                    </div>
                    <TabularSelectInput
                        formname="memberships"
                        className={styles.members}
                        options={memberOptions}
                        label={this.props.projectStrings('projectMembersLabel')}
                        optionsIdentifier="select-input-inside-modal"
                        labelSelector={ProjectGeneralForm.memberOptionLabelSelector}
                        keySelector={ProjectGeneralForm.memberOptionKeySelector}
                        tableHeaders={memberHeaders}
                        hideRemoveFromListButton
                    />
                </div>
            </Form>
        );
    }
}
