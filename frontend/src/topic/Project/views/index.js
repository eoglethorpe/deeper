import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { ListView, ListItem } from '../../../public/components/View';
import { TextInput } from '../../../public/components/Input';
import { TransparentPrimaryButton } from '../../../public/components/Action';
import { RestBuilder } from '../../../public/utils/rest';

import { pageTitles } from '../../../common/utils/labels';
import schema from '../../../common/schema';
import {
    createParamsForUser,
    createUrlForProject,
} from '../../../common/rest';
import {
    activeProjectSelector,
    currentUserProjectsSelector,
    projectDetailsSelector,

    tokenSelector,

    setNavbarStateAction,

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
    match: undefined,
    activeUser: {},
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
            <div styleName="project-panel">
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
                    <ProjectDetails project={projectDetails} />
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
                            value={this.state.searchInputValue}
                            type="search"
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
                                    to={`/${project.id}/projectpanel/`}
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
