import PropTypes from 'prop-types';
import React from 'react';
import {
    Redirect,
    Route,
    HashRouter,
    NavLink,
} from 'react-router-dom';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import List from '../../../vendor/react-store/components/View/List';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';

import {
    createParamsForUser,
    createUrlForProject,
    createParamsForProjectOptions,
    createUrlForProjectOptions,
} from '../../../rest';
import {
    projectDetailsSelector,
    setProjectAction,
    setProjectOptionsAction,
    projectStringsSelector,
} from '../../../redux';
import schema from '../../../schema';

import ProjectGeneral from './ProjectGeneral';
import ProjectRegions from './ProjectRegions';
import ProjectAnalysisFramework from './ProjectAnalysisFramework';
import ProjectCategoryEditor from './ProjectCategoryEditor';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    mainHistory: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    project: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number,
    setProject: PropTypes.func.isRequired,
    setProjectOptions: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    project: undefined,
    projectId: undefined,
};


const mapStateToProps = (state, props) => ({
    project: projectDetailsSelector(state, props),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    setProjectOptions: params => dispatch(setProjectOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectDetails extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = d => d;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
        };

        this.routes = [
            'generalDetails',
            'regions',
            'analysisFramework',
            'categoryEditor',
        ];

        this.defaultRoute = 'generalDetails';

        this.pathNames = {
            generalDetails: '/general-details',
            regions: '/regions',
            analysisFramework: '/analysis-framework',
            categoryEditor: '/category-editor',
        };

        this.views = {
            generalDetails: ProjectGeneral,
            regions: ProjectRegions,
            analysisFramework: ProjectAnalysisFramework,
            categoryEditor: ProjectCategoryEditor,
        };

        this.titles = {
            generalDetails: this.props.projectStrings('generalDetailsLabel'),
            regions: this.props.projectStrings('regionsLabel'),
            analysisFramework: this.props.projectStrings('analysisFrameworkLabel'),
            categoryEditor: this.props.projectStrings('categoryEditorLabel'),
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
                    console.warn(response);
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
            to={this.pathNames[routeId]}
            activeClassName={styles.active}
            className={styles.tab}
            replace
            exact
        >
            { this.titles[routeId] }
        </NavLink>
    )

    renderRoute = (key, routeId) => {
        const Component = this.views[routeId];
        const { projectId } = this.props;

        return (
            <Route
                key={key}
                path={this.pathNames[routeId]}
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
                    className={`${className} ${styles['project-details']}`}
                >
                    <Route
                        exact
                        path="/"
                        component={() => <Redirect to={this.pathNames[this.defaultRoute]} />}
                    />
                    { pending && <LoadingAnimation /> }
                    {
                        project.role === 'admin' ? ([
                            <header
                                key="header"
                                className={styles.header}
                            >
                                <h2 className={styles.heading}>
                                    { project.title }
                                </h2>
                                <div className={styles.tabs}>
                                    <List
                                        data={this.routes}
                                        modifier={this.renderLink}
                                        keyExtractor={ProjectDetails.keyExtractor}
                                    />
                                    <div className={styles['empty-space']} />
                                </div>
                            </header>,
                            <List
                                key="list"
                                data={this.routes}
                                modifier={this.renderRoute}
                                keyExtractor={ProjectDetails.keyExtractor}
                            />,
                        ]) : (
                            <p className={styles['forbidden-text']}>
                                {this.props.projectStrings('forbiddenText')}
                            </p>
                        )
                    }
                </div>
            </HashRouter>
        );
    }
}
