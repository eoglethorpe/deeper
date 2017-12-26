import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Form,
    NonFieldErrors,
    requiredCondition,
    TabularSelectInput,
} from '../../../../public/components/Input';
import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';

import { FgRestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import {
    transformResponseErrorToFormError,
    createParamsForProjectPatch,
    createUrlForProject,
} from '../../../../common/rest';
import {
    projectDetailsSelector,
    projectOptionsSelector,

    setProjectAction,
} from '../../../../common/redux';
import {
    notificationStrings,
} from '../../../../common/constants';
import notify from '../../../../common/notify';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line
    projectId: PropTypes.number,
    setProject: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddExistingRegion extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            projectOptions,
        } = props;

        const formValues = {
            regions: '',
            regionsBlackList: (projectDetails.regions || []).map(region => region.id),
        };

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues,
            pending: false,
            pristine: false,
            regionOptions: projectOptions.regions || emptyList,
        };

        this.regionsHeader = [
            {
                key: 'value',
                label: 'Name',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.value.localeCompare(b.value),
            },
            {
                key: 'key',
                label: 'id',
                order: 2,
                sortable: true,
                comparator: (a, b) => a.key - b.key,
            },
        ];

        this.elements = [
            'regions',
        ];
        this.validations = {
            regions: [requiredCondition],
        };
    }

    componentWillUnmount() {
        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }
    }

    createProjectPatchRequest = (newProjectDetails, projectId) => {
        const projectPatchRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForProjectPatch(newProjectDetails))
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                    this.props.setProject({
                        project: response,
                    });
                    notify.send({
                        title: notificationStrings.countryCreate,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.countryCreateSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: notificationStrings.countryCreate,
                    type: notify.type.ERROR,
                    message: notificationStrings.countryCreateFailure,
                    duration: notify.duration.MEDIUM,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: notificationStrings.countryCreate,
                    type: notify.type.ERROR,
                    message: notificationStrings.countryCreateFatal,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    formErrors: ['Error while trying to :ave project.'],
                });
            })
            .build();
        return projectPatchRequest;
    };

    // FORM RELATED
    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        const { projectId,
            projectDetails,
        } = this.props;

        const regionsFromValues = values.regions.map(region => ({
            id: region,
        }));

        const regions = [...new Set([...projectDetails.regions, ...regionsFromValues])];

        const newProjectDetails = {
            ...values,
            regions,
        };

        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }

        this.projectPatchRequest = this.createProjectPatchRequest(newProjectDetails, projectId);
        this.projectPatchRequest.start();

        this.setState({ pristine: false });
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            pristine,
            regionOptions,
        } = this.state;

        const {
            className,
        } = this.props;

        return (
            <Form
                className={className}
                styleName="add-region-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validation={this.validation}
                validations={this.validations}
                onSubmit={this.handleSubmit}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors
                    styleName="non-field-errors"
                    errors={formErrors}
                />
                <TabularSelectInput
                    formname="regions"
                    styleName="tabular-select"
                    blackList={formValues.regionsBlackList}
                    options={regionOptions}
                    optionsIdentifier="select-input-inside-modal"
                    labelSelector={AddExistingRegion.optionLabelSelector}
                    onChange={this.handleTabularSelectInputChange}
                    keySelector={AddExistingRegion.optionKeySelector}
                    tableHeaders={this.regionsHeader}
                    error={formFieldErrors.regions}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        Update
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
