import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    ListView,
    LoadingAnimation,
} from '../../../public/components/View';
import { TextInput } from '../../../public/components/Input';
import {
    PrimaryButton,
} from '../../../public/components/Action';
import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '../../../public/utils/common';

import {
    iconNames,
    pathNames,
} from '../../../common/constants';
import {
} from '../../../common/rest';
import {
    currentUserAdminProjectsSelector,
    setActiveProjectAction,
} from '../../../common/redux';

import ProjectDetails from '../components/ProjectDetails';
import styles from './styles.scss';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            countryId: PropTypes.string,
            projectId: PropTypes.string,
        }),
    }).isRequired,
    setActiveProject: PropTypes.func.isRequired,
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
        }),
    ),
};

const defaultProps = {
    activeUser: {},
    userProjects: {},
};

const mapStateToProps = (state, props) => ({
    userProjects: currentUserAdminProjectsSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
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
            pending: false,
            displayUserProjects: this.props.userProjects,
            isSidebarVisible: false,
            searchInputValue: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        const { userProjects } = nextProps;
        const { searchInputValue } = this.state;

        if (this.props.userProjects !== userProjects) {
            const displayUserProjects = userProjects.filter(
                project => caseInsensitiveSubmatch(project.title, searchInputValue),
            );
            this.setState({ displayUserProjects });
        }
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

    handleSearchInputChange = (searchInputValue) => {
        const displayUserProjects = this.props.userProjects.filter(
            project => caseInsensitiveSubmatch(project.title, searchInputValue),
        );

        this.setState({
            displayUserProjects,
            searchInputValue,
        });
    };

    renderSidebarItem = (key, project) => (
        <div
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
        </div>
    )

    render() {
        const {
            displayUserProjects,
            pending,
        } = this.state;

        const { projectId } = this.props.match.params;
        const {
            history,
        } = this.props;

        return (
            <div styleName="project-panel">
                <div styleName="sidebar">
                    {pending && <LoadingAnimation />}
                    <header styleName="header">
                        <h3 styleName="heading">
                            Projects
                        </h3>
                        <PrimaryButton
                            iconName={iconNames.add}
                        >
                            Add
                        </PrimaryButton>
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
                        styleName="project-list"
                        data={displayUserProjects}
                        keyExtractor={project => project.id}
                        modifier={this.renderSidebarItem}
                    />
                </div>
                {
                    projectId ? (
                        <ProjectDetails
                            styleName="project-details"
                            projectId={+projectId}
                            mainHistory={history}
                        />
                    ) : (
                        <p styleName="no-project-text">Select a project to view its details</p>
                    )
                }
            </div>
        );
    }
}
