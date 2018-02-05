import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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

import { projectStringsSelector } from '../../../../common/redux';

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
                        {this.props.projectStrings('modalRevert')}
                    </DangerButton>
                    <SuccessButton
                        disabled={pending || !pristine}
                    >
                        {this.props.projectStrings('modalSave')}
                    </SuccessButton>
                </div>
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label={this.props.projectStrings('projectNameLabel')}
                    formname="title"
                    placeholder={this.props.projectStrings('projectNamePlaceholder')}
                    styleName="name"
                    value={formValues.title}
                    error={formFieldErrors.title}
                />
                <TextArea
                    label={this.props.projectStrings('projectDescriptionLabel')}
                    formname="description"
                    placeholder={this.props.projectStrings('projectDescriptionPlaceholder')}
                    styleName="description"
                    rows={3}
                    value={formValues.description}
                    error={formFieldErrors.description}
                />
                <DateInput
                    label={this.props.projectStrings('projectStartDateLabel')}
                    formname="startDate"
                    placeholder={this.props.projectStrings('projectStartDatePlaceholder')}
                    styleName="start-date"
                    value={formValues.startDate}
                    error={formFieldErrors.startDate}
                />
                <DateInput
                    label={this.props.projectStrings('projectEndDateLabel')}
                    formname="endDate"
                    placeholder={this.props.projectStrings('projectEndDatePlaceholder')}
                    styleName="end-date"
                    value={formValues.endDate}
                    error={formFieldErrors.endDate}
                />
                <MultiSelectInput
                    label={this.props.projectStrings('projectRegionLabel')}
                    formname="regions"
                    placeholder={this.props.projectStrings('projectRegionPlaceholder')}
                    styleName="regions"
                    value={formValues.regions}
                    options={regionOptions}
                    labelSelector={ProjectGeneralForm.optionLabelSelector}
                    keySelector={ProjectGeneralForm.optionKeySelector}
                    error={formFieldErrors.regions}
                />
                <MultiSelectInput
                    label={this.props.projectStrings('projectUserGroupLabel')}
                    formname="userGroups"
                    placeholder={this.props.projectStrings('projectUserGroupPlaceholder')}
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
