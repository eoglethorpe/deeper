import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';
import ListView, { ListItem } from '../../../public/components/ListView';
import ProjectDetails from '../components/ProjectDetails';
import TextInput from '../../../public/components/TextInput';
import styles from './styles.scss';
import { RestBuilder } from '../../../public/utils/rest';
import { pageTitles } from '../../../common/utils/labels';
import {
    setActiveProjectAction,
    setProjectAction,
} from '../../../common/action-creators/domainData';
import {
    setNavbarStateAction,
} from '../../../common/action-creators/navbar';
import {
    createParamsForUser,
    createUrlForProject,
} from '../../../common/rest';
import {
    activeProjectSelector,
    currentUserProjectsSelector,
    projectDetailsSelector,
} from '../../../common/selectors/domainData';
import {
    tokenSelector,
} from '../../../common/selectors/auth';
import {
    TransparentPrimaryButton,
} from '../../../public/components/Button';
import schema from '../../../common/schema';

const propTypes = {
    activeProject: PropTypes.number,
    location: PropTypes.shape({
        pathname: PropTypes.string.isReqired,
    }),
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    setNavbarState: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,
    setActiveProject: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
        }),
    ),
};

const defaultProps = {
    activeProject: undefined,
    activeUser: {},
    location: {},
    userProjects: {},
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    token: tokenSelector(state),
    userProjects: currentUserProjectsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
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
            displayUserProjects: this.props.userProjects,
            sideBarVisibility: false,
            searchInputValue: '',
        };

        this.projectRequest = this.createProjectRequest(this.props.activeProject);
    }

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.projectPanel,
            ],
        });

        this.projectRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { activeProject } = nextProps;


        if (this.props.activeProject !== activeProject) {
            this.projectRequest.stop();
            this.projectRequest = this.createProjectRequest(activeProject);
            this.projectRequest.start();
        }

        const caseInsensitiveSubmatch = project => (
            project.title.toLowerCase().includes(this.state.searchInputValue.toLowerCase())
        );
        const displayUserProjects = nextProps.userProjects.filter(caseInsensitiveSubmatch);

        this.setState({
            displayUserProjects,
        });
    }

    componentWillUnmount() {
        this.projectRequest.stop();
    }

    onChangeProject = (id) => {
        this.props.setActiveProject({ activeProject: id });
    }

    getStyleName = (projectId) => {
        const { pathname } = this.props.location;

        const styleNames = [];
        styleNames.push('list-item');

        if (pathname === `/${projectId}/projectpanel/`) {
            styleNames.push('active');
        }

        return styleNames.join(' ');
    }

    createProjectRequest = (activeProject) => {
        const projectRequest = new RestBuilder()
            .url(createUrlForProject(activeProject))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({
                        projectId: this.props.activeProject,
                        project: response,
                    });
                } catch (er) {
                    console.error(er);
                }
                this.setState({
                    loadingLeads: false,
                });
            })
            .build();
        return projectRequest;
    };

    showProjectList = () => {
        this.setState({
            sideBarVisibility: true,
        });
    };

    closeProjectList = () => {
        this.setState({
            sideBarVisibility: false,
        });
    };

    search = (value) => {
        const caseInsensitiveSubmatch = project => (
            project.title.toLowerCase().includes(value.toLowerCase())
        );
        const displayUserProjects = this.props.userProjects.filter(caseInsensitiveSubmatch);

        this.setState({
            displayUserProjects,
            searchInputValue: value,
        });
    };
    render() {
        const { sideBarVisibility, displayUserProjects } = this.state;
        const { projectDetails } = this.props;

        return (
            <div
                styleName="project-panel"
            >
                <Helmet>
                    <title>{ pageTitles.projectPanel }</title>
                </Helmet>
                <div
                    styleName={sideBarVisibility ? 'content side-bar-shown' : 'content'}
                >
                    <header styleName="header">
                        <h1 styleName="heading">
                            { projectDetails.title }
                        </h1>
                        {!sideBarVisibility &&
                            <TransparentPrimaryButton onClick={this.showProjectList}>
                                <span className="ion-eye" />
                            </TransparentPrimaryButton>
                        }
                    </header>
                    <ProjectDetails />
                </div>
                <div
                    styleName={sideBarVisibility ? 'side-bar show' : 'side-bar'}
                >
                    <header styleName="header">
                        <h1 styleName="heading">
                            Projects
                        </h1>
                        <TransparentPrimaryButton onClick={this.closeProjectList}>
                            <span className="ion-android-close" />
                        </TransparentPrimaryButton>
                        <TextInput
                            onChange={this.search}
                            placeholder="Search Project"
                            type="search"
                        />
                    </header>
                    <ListView styleName="list">
                        {
                            displayUserProjects.map(project => (
                                <ListItem
                                    key={`project-${project.id}`}
                                    styleName={this.getStyleName(project.id)}
                                >
                                    <Link
                                        to={`/${project.id}/projectpanel/`}
                                        styleName="link"
                                        onClick={() => this.onChangeProject(project.id)}
                                    >
                                        {project.title}
                                    </Link>
                                </ListItem>
                            ))
                        }
                    </ListView>
                </div>
            </div>
        );
    }
}
