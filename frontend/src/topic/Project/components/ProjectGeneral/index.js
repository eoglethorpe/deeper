import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../public/utils/rest';
import {
    createParamsForProjectPatch,
    createUrlForProject,
    createParamsForProjectOptions,
    createUrlForProjectOptions,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    tokenSelector,

    projectDetailsSelector,
    projectOptionsSelector,

    setProjectOptionsAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';

import ProjectGeneralForm from '../ProjectGeneralForm';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    projectOptions: PropTypes.object.isRequired, // eslint-disable-line
    setProjectOptions: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    activeProject: undefined,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    projectOptions: projectOptionsSelector(state, props),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProjectOptions: params => dispatch(setProjectOptionsAction(params)),
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
            activeProject,
            projectOptions,
        } = props;

        const formValues = {
            ...projectDetails,
            regions: (projectDetails.regions || []).map(region => region.id),
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

        this.projectOptionsRequest = this.createProjectOptionsRequest(activeProject);
    }

    componentWillMount() {
        this.projectOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectDetails,
            activeProject,
            projectOptions,
        } = nextProps;

        if (nextProps !== this.props) {
            const formValues = {
                ...projectDetails,
                regions: (projectDetails.regions || []).map(region => region.id),
            };
            this.setState({
                formValues,
                regionOptions: projectOptions.regions || emptyList,
                userGroupsOptions: projectOptions.userGroups || emptyList,
            });
        }
        if (nextProps.activeProject !== this.props.activeProject) {
            if (this.projectOptionsRequest) {
                this.projectOptionsRequest.stop();
                this.projectOptionsRequest = this.createProjectOptionsRequest(activeProject);
                this.projectOptionsRequest.start();
            }
        }
    }

    componentWillUnmount() {
        this.projectOptionsRequest.stop();
    }

    createProjectPatchRequest = () => {
        const projectPatchRequest = new RestBuilder()
            .url(createUrlForProject())
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectPatch(
                    { access },
                );
            })
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectPatchRequest;
    };

    createProjectOptionsRequest = (projectId) => {
        const projectOptionsRequest = new RestBuilder()
            .url(createUrlForProjectOptions(projectId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectOptions({ access });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectOptionsGetResponse');
                    this.props.setProjectOptions({
                        projectId,
                        options: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectOptionsRequest;
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

    handleFormCancel = () => {
        console.log();
    };

    successCallback = (values) => {
        console.log(values);
        // Rest Request goes here
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
                    stale={stale}
                    pending={pending}
                />
            </div>
        );
    }
}
