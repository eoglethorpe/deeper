import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import Helmet from 'react-helmet';
import styles from './styles.scss';
import ListView, { ListItem } from '../../../public/components/ListView';
import ProjectDetails from '../components/ProjectDetails';
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
    currentUserProjectsSelector,
    activeProjectSelector,
} from '../../../common/selectors/domainData';
import {
    tokenSelector,
    activeUserSelector,
} from '../../../common/selectors/auth';
import {
    TransparentPrimaryButton,
} from '../../../public/components/Button';
import schema from '../../../common/schema';

const propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isReqired,
    }),
    activeProject: PropTypes.number,
    setNavbarState: PropTypes.func.isRequired,
    setProject: PropTypes.func.isRequired,
    activeUser: PropTypes.shape({
        userId: PropTypes.number,
    }),
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
    activeUser: activeUserSelector(state),
    activeProject: activeProjectSelector(state),
    userProjects: currentUserProjectsSelector(state, props),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            sideBarVisibility: false,
        };

        this.projectRequest = this.createProjectRequest();
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
            console.log('asd0');
        }
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

    createProjectRequest = () => {
        const projectRequest = new RestBuilder()
            .url(createUrlForProject(this.props.activeProject))
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
                        userId: this.props.activeUser.userId,
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

    render() {
        const { sideBarVisibility } = this.state;
        const { activeProject, userProjects } = this.props;
        console.log(userProjects);
        console.log(activeProject);

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
                            { activeProject }
                        </h1>
                        {!sideBarVisibility &&
                            <TransparentPrimaryButton onClick={this.showProjectList}>
                                Show all projects
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
                    </header>
                    <ListView styleName="list">
                        {
                            userProjects.map(project => (
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
