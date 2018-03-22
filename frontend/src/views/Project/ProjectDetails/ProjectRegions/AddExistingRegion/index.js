import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import { compareString, compareNumber } from '../../../../../vendor/react-store/utils/common';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import NonFieldErrors from '../../../../../vendor/react-store/components/Input/NonFieldErrors';
import TabularSelectInput from '../../../../../vendor/react-store/components/Input/TabularSelectInput';
import Form, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Form';

import {
    transformResponseErrorToFormError,
    createParamsForProjectPatch,
    createUrlForProject,
} from '../../../../../rest';
import {
    projectDetailsSelector,
    projectOptionsSelector,

    setProjectAction,
    notificationStringsSelector,
    projectStringsSelector,
} from '../../../../../redux';
import notify from '../../../../../notify';
import schema from '../../../../../schema';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number,
    setProject: PropTypes.func.isRequired,
    onRegionsAdd: PropTypes.func,
    notificationStrings: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    onRegionsAdd: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
    notificationStrings: notificationStringsSelector(state),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
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
            regions: [],
        };

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues,

            pending: false,
            pristine: false,
            regionOptions: projectOptions.regions || emptyList,
            regionsBlackList: (projectDetails.regions || []).map(region => region.id),
        };

        this.regionsHeader = [
            {
                key: 'value',
                label: this.props.projectStrings('tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.value, b.value),
            },
            {
                key: 'key',
                label: this.props.projectStrings('tableHeaderId'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareNumber(a.key, b.key),
            },
        ];

        this.schema = {
            fields: {
                regions: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }
    }

    createProjectPatchRequest = (newProjectDetails, projectId, addedRegions) => {
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
                        title: this.props.notificationStrings('countryCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('countryCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    if (this.props.onRegionsAdd) {
                        this.props.onRegionsAdd(addedRegions);
                    }
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('countryCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('countryCreateFailure'),
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
                    title: this.props.notificationStrings('countryCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('countryCreateFatal'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    formErrors: { errors: ['Error while trying to save project.'] },
                });
            })
            .build();
        return projectPatchRequest;
    };

    // FORM RELATED
    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (values) => {
        const {
            projectId,
            projectDetails,
        } = this.props;

        const regionsFromValues = values.regions.map(region => ({ id: region.key }));

        const regions = [...new Set([...projectDetails.regions, ...regionsFromValues])];
        const regionsKeys = values.regions.map(r => r.key);

        const newProjectDetails = {
            ...values,
            regions,
        };

        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }

        this.projectPatchRequest = this.createProjectPatchRequest(
            newProjectDetails,
            projectId,
            regionsKeys,
        );
        this.projectPatchRequest.start();

        // FIXME: probably move this to callback of request
        this.setState({ pristine: false });
    };

    render() {
        const {
            formErrors,
            formFieldErrors,
            formValues,

            pending,
            pristine,
            regionOptions,
            regionsBlackList,
        } = this.state;

        const { className } = this.props;

        return (
            <Form
                className={`${className} ${styles.addRegionForm}`}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                schema={this.schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors
                    className={styles.nonFieldErrors}
                    formerror=""
                />
                <TabularSelectInput
                    formname="regions"
                    className={styles.tabularSelect}
                    blackList={regionsBlackList}
                    options={regionOptions}
                    optionsIdentifier="select-input-inside-modal"
                    labelSelector={AddExistingRegion.optionLabelSelector}
                    keySelector={AddExistingRegion.optionKeySelector}
                    tableHeaders={this.regionsHeader}
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        onClick={this.props.onModalClose}
                        type="button"
                    >
                        {this.props.projectStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine}>
                        {this.props.projectStrings('modalUpdate')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
