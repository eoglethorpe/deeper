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
import Faram, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Faram';

import {
    alterResponseErrorToFaramError,
    createParamsForProjectPatch,
    createUrlForProject,
} from '../../../../../rest';
import {
    projectDetailsSelector,
    projectOptionsSelector,

    setProjectAction,
} from '../../../../../redux';
import notify from '../../../../../notify';
import schema from '../../../../../schema';
import _ts from '../../../../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    onModalClose: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number,
    setProject: PropTypes.func.isRequired,
    onRegionsAdd: PropTypes.func,
};

const defaultProps = {
    className: '',
    projectId: undefined,
    onRegionsAdd: undefined,
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

        const faramValues = {
            regions: [],
        };

        this.state = {
            faramErrors: {},
            faramValues,

            pending: false,
            pristine: false,
            regionOptions: projectOptions.regions || emptyList,
            regionsBlackList: (projectDetails.regions || []).map(region => region.id),
        };

        this.regionsHeader = [
            {
                key: 'value',
                label: _ts('project', 'tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.value, b.value),
            },
            {
                key: 'key',
                label: _ts('project', 'tableHeaderId'),
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
            .postLoad(() => this.setState({ pristine: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                    this.props.setProject({
                        project: response,
                    });
                    notify.send({
                        title: _ts('notification', 'countryCreate'),
                        type: notify.type.SUCCESS,
                        message: _ts('notification', 'countryCreateSuccess'),
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
                    title: _ts('notification', 'countryCreate'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'countryCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                notify.send({
                    title: _ts('notification', 'countryCreate'),
                    type: notify.type.ERROR,
                    message: _ts('notification', 'countryCreateFatal'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    faramErrors: { $internal: [_ts('project', 'projectSaveFailure')] },
                });
            })
            .build();
        return projectPatchRequest;
    };

    // faram RELATED
    handleFaramChange = (values, faramErrors) => {
        this.setState({
            faramValues: values,
            faramErrors,
            pristine: true,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleValidationSuccess = (values) => {
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
    };

    render() {
        const {
            faramErrors,
            faramValues,

            pending,
            pristine,
            regionOptions,
            regionsBlackList,
        } = this.state;

        const { className } = this.props;

        return (
            <Faram
                className={`${className} ${styles.addRegionForm}`}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                faramErrors={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TabularSelectInput
                    faramElementName="regions"
                    className={styles.tabularSelect}
                    blackList={regionsBlackList}
                    options={regionOptions}
                    labelSelector={AddExistingRegion.optionLabelSelector}
                    keySelector={AddExistingRegion.optionKeySelector}
                    tableHeaders={this.regionsHeader}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.props.onModalClose}>
                        {_ts('project', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('project', 'modalUpdate')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
