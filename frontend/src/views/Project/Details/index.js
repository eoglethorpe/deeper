import PropTypes from 'prop-types';
import React from 'react';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import FixedTabs from '../../../vendor/react-store/components/View/FixedTabs';
import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
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

import General from './General';
import Regions from './Regions';
import Frameworks from './Frameworks';
import CategoryEditors from './CategoryEditors';
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

        this.routes = {
            general: 'General',
            regions: 'Regions',
            frameworks: 'Framework',
            categoryEditors: 'Category Editor',
        };

        this.defaultHash = 'general';

        this.views = {
            general: {
                component: () => (
                    <General
                        className={styles.content}
                        projectId={this.props.projectId}
                    />
                ),
            },
            regions: {
                component: () => (
                    <Regions
                        className={styles.content}
                        projectId={this.props.projectId}
                    />
                ),
            },
            frameworks: {
                component: () => (
                    <Frameworks
                        className={styles.content}
                        projectId={this.props.projectId}
                    />
                ),
            },
            categoryEditors: {
                component: () => (
                    <CategoryEditors
                        className={styles.content}
                        projectId={this.props.projectId}
                    />
                ),
            },
        };

        this.titles = {
            general: this.props.projectStrings('generalDetailsLabel'),
            regions: this.props.projectStrings('regionsLabel'),
            frameworks: this.props.projectStrings('analysisFrameworkLabel'),
            categoryEditors: this.props.projectStrings('categoryEditorLabel'),
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

    getClassName = () => {
        const { className } = this.props;
        return `
            ${className}
            ${styles.details}
        `;
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

    renderDetail = () => {
        const { project } = this.props;

        return (
            project.role === 'admin' ? (
                <React.Fragment>
                    <header className={styles.header}>
                        <FixedTabs
                            defaultHash={this.defaultHash}
                            replaceHistory
                            useHash
                            tabs={this.routes}
                        />
                    </header>
                    <MultiViewContainer
                        useHash
                        views={this.views}
                    />
                </React.Fragment>
            ) : (
                <p className={styles.forbiddenText}>
                    {this.props.projectStrings('forbiddenText')}
                </p>
            )
        );
    }

    render() {
        const { pending } = this.state;

        const className = this.getClassName();
        const Detail = this.renderDetail;

        return (
            <div className={className}>
                {
                    pending ? (
                        <LoadingAnimation large />
                    ) : (
                        <Detail />
                    )
                }
            </div>
        );
    }
}