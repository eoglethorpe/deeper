import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    transformResponseErrorToFormError,
    createParamsForProjectPatch,
    createUrlForProject,
} from '../../../../common/rest';
import {
    activeProjectSelector,

    projectDetailsSelector,
    projectOptionsSelector,

    setProjectAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';

import ProjectGeneralForm from '../ProjectGeneralForm';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line
    setProject: PropTypes.func.isRequired,
};

const defaultProps = {
    activeProject: undefined,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeneral extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            projectDetails,
            projectOptions,
        } = props;

        const formValues = {
            ...projectDetails,
            regions: (projectDetails.regions || []).map(region => region.id),
            userGroups: (projectDetails.userGroups || []).map(userGroups => userGroups.id),
        };

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            stale: false,
            pending: false,
            formValues,
            regionOptions: projectOptions.regions || emptyList,
            userGroupsOptions: projectOptions.userGroups || emptyList,
        };
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectDetails,
            projectOptions,
        } = nextProps;

        if (nextProps !== this.props) {
            const formValues = {
                ...projectDetails,
                regions: (projectDetails.regions || []).map(region => region.id),
                userGroups: (projectDetails.userGroups || []).map(userGroups => userGroups.id),
            };
            this.setState({
                formValues,
                regionOptions: projectOptions.regions || emptyList,
                userGroupsOptions: projectOptions.userGroups || emptyList,
            });
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
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: ['Error while trying to save jroject.'],
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
            stale: false,
        });
    };

    handleFormCancel = () => {
        console.log();
    };

    successCallback = (values) => {
        const { activeProject } = this.props;

        const regions = values.regions.map(region => ({
            id: region,
        }));
        const userGroups = values.userGroups.map(userGroup => ({
            id: userGroup,
        }));
        const newProjectDetails = {
            ...values,
            regions,
            userGroups,
        };

        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }

        this.projectPatchRequest = this.createProjectPatchRequest(newProjectDetails, activeProject);
        this.projectPatchRequest.start();

        this.setState({ stale: false });
    };

    render() {
        const {
            formErrors,
            formFieldErrors,
            stale,
            pending,
            formValues,
            regionOptions,
            userGroupsOptions,
        } = this.state;

        return (
            <div styleName="project-general">
                <ProjectGeneralForm
                    formValues={formValues}
                    regionOptions={regionOptions}
                    userGroupsOptions={userGroupsOptions}
                    formErrors={formErrors}
                    formFieldErrors={formFieldErrors}
                    changeCallback={this.changeCallback}
                    failureCallback={this.failureCallback}
                    handleFormCancel={this.handleFormCancel}
                    successCallback={this.successCallback}
                    styleName="project-general-form"
                    stale={stale}
                    pending={pending}
                />
            </div>
        );
    }
}
