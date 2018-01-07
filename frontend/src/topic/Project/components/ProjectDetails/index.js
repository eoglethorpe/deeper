import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    Redirect,
    Route,
    HashRouter,
    NavLink,
} from 'react-router-dom';
import { connect } from 'react-redux';

import {
    List,
    LoadingAnimation,
} from '../../../../public/components/View';
import { FgRestBuilder } from '../../../../public/utils/rest';
import { projectStrings } from '../../../../common/constants';

import schema from '../../../../common/schema';
import {
    createParamsForUser,
    createUrlForProject,
    createParamsForProjectOptions,
    createUrlForProjectOptions,
} from '../../../../common/rest';
import {
    projectDetailsSelector,
    setProjectAction,
    setProjectOptionsAction,
} from '../../../../common/redux';

import ProjectGeneral from '../ProjectGeneral';
import ProjectRegions from '../ProjectRegions';
import ProjectAnalysisFramework from '../ProjectAnalysisFramework';
import ProjectCategoryEditor from '../ProjectCategoryEditor';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    mainHistory: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    project: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number,
    setProject: PropTypes.func.isRequired,
    setProjectOptions: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    project: undefined,
    projectId: undefined,
};

const routes = [
    'generalDetails',
    'regions',
    'analysisFramework',
    'categoryEditor',
];

const defaultRoute = 'generalDetails';

const pathNames = {
    generalDetails: '/general-details',
    regions: '/regions',
    analysisFramework: '/analysis-framework',
    categoryEditor: '/category-editor',
};

const views = {
    generalDetails: ProjectGeneral,
    regions: ProjectRegions,
    analysisFramework: ProjectAnalysisFramework,
    categoryEditor: ProjectCategoryEditor,
};

const titles = {
    generalDetails: 'General details',
    regions: 'Regions',
    analysisFramework: 'Analysis Framework',
    categoryEditor: 'Category Editor',
};

const keyExtractor = d => d;

const mapStateToProps = (state, props) => ({
    project: projectDetailsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    setProjectOptions: params => dispatch(setProjectOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
        };

        const { projectId } = props;
        if (projectId) {
            this.projectRequest = this.createProjectRequest(projectId);
            this.projectOptionsRequest = this.createProjectOptionsRequest(projectId);
        }
    }

    componentDidMount() {
        if (this.projectRequest) {
            this.projectRequest.start();
        }
        if (this.projectOptionsRequest) {
            this.projectOptionsRequest.start();
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectId: nextProjectId,
        } = nextProps;

        const {
            projectId: currentProjectId,
        } = this.props;

        if (nextProjectId && currentProjectId !== nextProjectId) {
            if (this.projectRequest) {
                this.projectRequest.stop();
            }

            if (this.projectOptionsRequest) {
                this.projectOptionsRequest.stop();
            }

            this.projectRequest = this.createProjectRequest(nextProjectId);
            this.projectRequest.start();

            this.projectOptionsRequest = this.createProjectOptionsRequest(nextProjectId);
            this.projectOptionsRequest.start(nextProjectId);
        }
    }

    componentWillUnmount() {
        if (this.projectRequest) {
            this.projectRequest.stop();
        }

        if (this.projectOptionsRequest) {
            this.projectOptionsRequest.stop();
        }
    }

    createProjectRequest = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
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

    renderLink = (key, routeId) => (
        <NavLink
            key={key}
            to={pathNames[routeId]}
            activeClassName={styles.active}
            className={styles.tab}
            replace
            exact
        >
            { titles[routeId] }
        </NavLink>
    )

    renderRoute = (key, routeId) => {
        const Component = views[routeId];
        const { projectId } = this.props;

        return (
            <Route
                key={key}
                path={pathNames[routeId]}
                exact
                render={() => (
                    <Component
                        mainHistory={this.props.mainHistory}
                        className={styles.content}
                        projectId={projectId}
                    />
                )}
            />
        );
    }

    render() {
        const {
            project,
            className,
        } = this.props;

        const { pending } = this.state;

        return (
            <HashRouter>
                <div
                    className={className}
                    styleName="project-details"
                >
                    <Route
                        exact
                        path="/"
                        component={() => <Redirect to={pathNames[defaultRoute]} />}
                    />
                    { pending && <LoadingAnimation /> }
                    {
                        project.role === 'admin' ? ([
                            <header
                                key="header"
                                styleName="header"
                            >
                                <h2 styleName="heading">
                                    { project.title }
                                </h2>
                                <div styleName="tabs">
                                    <List
                                        data={routes}
                                        modifier={this.renderLink}
                                        keyExtractor={keyExtractor}
                                    />
                                    <div styleName="empty-space" />
                                </div>
                            </header>,
                            <List
                                key="list"
                                data={routes}
                                modifier={this.renderRoute}
                                keyExtractor={keyExtractor}
                            />,
                        ]) : (
                            <p styleName="forbidden-text">
                                {projectStrings.forbiddenText}
                            </p>
                        )
                    }
                </div>
            </HashRouter>
        );
    }
}
