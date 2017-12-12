import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    ListView,
    ListItem,
    LoadingAnimation,
} from '../../../public/components/View';
import { TextInput } from '../../../public/components/Input';
import { TransparentPrimaryButton } from '../../../public/components/Action';
import { FgRestBuilder } from '../../../public/utils/rest';
import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '../../../public/utils/common';

import {
    pathNames,
} from '../../../common/constants';
import schema from '../../../common/schema';
import {
    createParamsForUser,
    createUrlForProject,
    createParamsForProjectOptions,
    createUrlForProjectOptions,
} from '../../../common/rest';
import {
    activeProjectSelector,
    currentUserAdminProjectsSelector,
    projectDetailsSelector,

    setProjectOptionsAction,
    setActiveProjectAction,
    setProjectAction,
} from '../../../common/redux';

import ProjectDetails from '../components/ProjectDetails';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    match: PropTypes.shape({
        params: PropTypes.shape({
            countryId: PropTypes.string,
        }),
    }),
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    setProject: PropTypes.func.isRequired,
    setActiveProject: PropTypes.func.isRequired,
    setProjectOptions: PropTypes.func.isRequired,
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
        }),
    ),
};

const defaultProps = {
    activeProject: undefined,
    match: undefined,
    activeUser: {},
    userProjects: {},
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    userProjects: currentUserAdminProjectsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    setProjectOptions: params => dispatch(setProjectOptionsAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            displayUserProjects: this.props.userProjects,
            isSidebarVisible: false,
            searchInputValue: '',
        };
        const { activeProject } = props;

        this.projectRequest = this.createProjectRequest(activeProject);
        this.projectOptionsRequest = this.createProjectOptionsRequest(activeProject);
    }

    componentWillMount() {
        this.projectRequest.start();
        this.projectOptionsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject, userProjects } = nextProps;
        const { searchInputValue } = this.state;

        if (this.props.activeProject !== activeProject) {
            if (this.projectOptionsRequest) {
                this.projectOptionsRequest.stop();
                this.projectOptionsRequest = this.createProjectOptionsRequest(activeProject);
                this.projectOptionsRequest.start();
            }
            if (this.projectRequest) {
                this.projectRequest.stop();
                this.projectRequest = this.createProjectRequest(activeProject);
                this.projectRequest.start();
            }
        }

        if (this.props.userProjects !== userProjects) {
            const displayUserProjects = userProjects.filter(
                project => caseInsensitiveSubmatch(project.title, searchInputValue),
            );
            this.setState({ displayUserProjects });
        }
    }

    componentWillUnmount() {
        this.projectRequest.stop();
        this.projectOptionsRequest.stop();
    }

    onChangeProject = (id) => {
        this.props.setActiveProject({ activeProject: id });
    }

    getStyleName = (projectId) => {
        const { match } = this.props;
        const { projectId: projectIdFromUrl } = match.params;

        const styleNames = [];
        styleNames.push(styles['list-item']);
        if (projectId === +projectIdFromUrl) {
            styleNames.push(styles.active);
        }
        return styleNames.join(' ');
    }

    createProjectRequest = (activeProject) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(activeProject))
            .params(() => createParamsForUser())
            .preLoad(() => this.setState({ pending: true }))
            .postLoad(() => this.setState({ pending: false }))
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({
                        project: response,
                    });
                    this.setState({
                        loadingLeads: false,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return projectRequest;
    };

    createProjectOptionsRequest = (projectId) => {
        const projectOptionsRequest = new FgRestBuilder()
            .url(createUrlForProjectOptions(projectId))
            .params(() => createParamsForProjectOptions())
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

    showProjectList = () => {
        this.setState({ isSidebarVisible: true });
    };

    closeProjectList = () => {
        this.setState({ isSidebarVisible: false });
    };


    handleSearchInputChange = (searchInputValue) => {
        const displayUserProjects = this.props.userProjects.filter(
            project => caseInsensitiveSubmatch(project.title, searchInputValue),
        );

        this.setState({
            displayUserProjects,
            searchInputValue,
        });
    };

    renderProjectDetails = (projectDetails) => {
        if (projectDetails.role === 'admin') {
            return (
                <ProjectDetails
                    key={projectDetails.id}
                    project={projectDetails}
                />
            );
        }

        return (
            <div styleName="no-right">
                You do not have the rights to edit this project.
            </div>
        );
    }

    render() {
        const {
            isSidebarVisible,
            displayUserProjects,
            pending,
        } = this.state;
        const { projectDetails } = this.props;

        return (
            <div styleName="project-panel">
                {pending && <LoadingAnimation />}
                <div
                    styleName={isSidebarVisible ? 'content side-bar-shown' : 'content'}
                >
                    <header styleName="header">
                        <h1 styleName="heading">
                            { projectDetails.title }
                        </h1>
                        {
                            !isSidebarVisible && (
                                <TransparentPrimaryButton
                                    styleName="sidebar-toggle-button"
                                    onClick={this.showProjectList}
                                >
                                    <span className="ion-android-menu" />
                                </TransparentPrimaryButton>
                            )
                        }
                    </header>
                    {this.renderProjectDetails(projectDetails)}
                </div>
                <div
                    styleName={isSidebarVisible ? 'side-bar show' : 'side-bar'}
                >
                    <header styleName="header">
                        <h1 styleName="heading">
                            Projects
                        </h1>
                        <TransparentPrimaryButton
                            styleName="close-sidebar-button"
                            onClick={this.closeProjectList}
                        >
                            <span className="ion-android-close" />
                        </TransparentPrimaryButton>
                        <TextInput
                            onChange={this.handleSearchInputChange}
                            placeholder="Search Project"
                            styleName="search-input"
                            type="search"
                            value={this.state.searchInputValue}
                            showLabel={false}
                            showHintAndError={false}
                        />
                    </header>
                    <ListView
                        styleName="list"
                        data={displayUserProjects}
                        keyExtractor={project => project.id}
                        modifier={(key, project) => (
                            <ListItem
                                key={key}
                                className={this.getStyleName(project.id)}
                            >
                                <Link
                                    to={reverseRoute(pathNames.projects, { projectId: project.id })}
                                    className={styles.link}
                                    onClick={() => this.onChangeProject(project.id)}
                                >
                                    {project.title}
                                </Link>
                            </ListItem>
                        )}
                    />
                </div>
            </div>
        );
    }
}
