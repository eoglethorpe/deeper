import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import DateInput from '../../../../../vendor/react-store/components/Input/DateInput';
import TextArea from '../../../../../vendor/react-store/components/Input/TextArea';
import MultiSelectInput from '../../../../../vendor/react-store/components/Input/SelectInput/MultiSelectInput';
import Form, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Form';

import { projectStringsSelector } from '../../../../../redux';

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
            projectStrings,
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
                value={formValues}
                error={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={handleFormCancel}
                        type="button"
                        disabled={pending || !pristine}
                    >
                        {projectStrings('modalRevert')}
                    </DangerButton>
                    <SuccessButton
                        disabled={pending || !pristine}
                    >
                        {projectStrings('modalSave')}
                    </SuccessButton>
                </div>
                <NonFieldErrors errors={formErrors} />
                <TextInput
                    label={projectStrings('projectNameLabel')}
                    formname="title"
                    placeholder={projectStrings('projectNamePlaceholder')}
                    styleName="name"
                />
                <TextArea
                    label={projectStrings('projectDescriptionLabel')}
                    formname="description"
                    placeholder={projectStrings('projectDescriptionPlaceholder')}
                    styleName="description"
                    rows={3}
                />
                <DateInput
                    label={projectStrings('projectStartDateLabel')}
                    formname="startDate"
                    placeholder={projectStrings('projectStartDatePlaceholder')}
                    styleName="start-date"
                />
                <DateInput
                    label={projectStrings('projectEndDateLabel')}
                    formname="endDate"
                    placeholder={projectStrings('projectEndDatePlaceholder')}
                    styleName="end-date"
                />
                <MultiSelectInput
                    label={projectStrings('projectRegionLabel')}
                    formname="regions"
                    placeholder={projectStrings('projectRegionPlaceholder')}
                    styleName="regions"
                    options={regionOptions}
                    labelSelector={ProjectGeneralForm.optionLabelSelector}
                    keySelector={ProjectGeneralForm.optionKeySelector}
                />
                <MultiSelectInput
                    label={projectStrings('projectUserGroupLabel')}
                    formname="userGroups"
                    placeholder={projectStrings('projectUserGroupPlaceholder')}
                    styleName="user-groups"
                    options={userGroupsOptions}
                    labelSelector={ProjectGeneralForm.optionLabelSelector}
                    keySelector={ProjectGeneralForm.optionKeySelector}
                />
            </Form>
        );
    }
}
