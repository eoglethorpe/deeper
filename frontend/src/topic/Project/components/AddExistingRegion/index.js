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

import { RestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import {
    createParamsForProjectPatch,
    createUrlForProject,
} from '../../../../common/rest';
import {
    tokenSelector,

    projectDetailsSelector,
    projectOptionsSelector,

    setProjectAction,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    onModalClose: PropTypes.func.isRequired,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line
    projectId: PropTypes.number,
    setProject: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
    token: tokenSelector(state),
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
            stale: false,
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
        const projectPatchRequest = new RestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectPatch(
                    { access },
                    newProjectDetails,
                );
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                    this.props.setProject({
                        project: response,
                    });
                    this.props.onModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({
                    formErrors: response.errors.nonFieldErrors,
                });
            })
            .fatal((response) => {
                this.setState({
                    formErrors: response.errors.nonFieldErrors,
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
            stale: true,
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

        this.setState({ stale: false });
    };

    render() {
        const {
            formErrors = [],
            formFieldErrors,
            formValues,
            pending,
            stale,
            regionOptions,
        } = this.state;

        return (
            <Form
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
                <NonFieldErrors errors={formErrors} />
                <TabularSelectInput
                    formname="regions"
                    blackList={formValues.regionsBlackList}
                    options={regionOptions}
                    labelSelector={AddExistingRegion.optionLabelSelector}
                    onChange={this.handleTabularSelectInputChange}
                    keySelector={AddExistingRegion.optionKeySelector}
                    tableHeaders={this.regionsHeader}
                    error={formFieldErrors.regions}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.props.onModalClose}
                        disabled={pending}
                    >
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Update
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
