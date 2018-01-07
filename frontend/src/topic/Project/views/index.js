import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    Modal,
    ModalBody,
    ModalHeader,
    ListView,
    LoadingAnimation,
} from '../../../public/components/View';
import { TextInput } from '../../../public/components/Input';
import {
    PrimaryButton,
    TransparentPrimaryButton,
} from '../../../public/components/Action';
import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '../../../public/utils/common';

import {
    iconNames,
    pathNames,
    projectStrings,
} from '../../../common/constants';
import {
} from '../../../common/rest';
import {
    currentUserAdminProjectsSelector,
    setActiveProjectAction,
    projectIdFromRouteSelector,
} from '../../../common/redux';

import UserProjectAdd from '../../../common/components/UserProjectAdd';
import ProjectDetails from '../components/ProjectDetails';
import styles from './styles.scss';

const propTypes = {
    history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setActiveProject: PropTypes.func.isRequired,
    userProjects: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            title: PropTypes.string,
        }),
    ),
    projectId: PropTypes.string.isRequired,
};

const defaultProps = {
    activeUser: {},
    userProjects: {},
};

const mapStateToProps = (state, props) => ({
    userProjects: currentUserAdminProjectsSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
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
            showAddProjectModal: false,
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
        const { projectId: projectIdFromUrl } = this.props;

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

    handleProjectAdded = (projectId) => {
        this.props.setActiveProject({ activeProject: projectId });
    }

    handleAddProjectClick = () => {
        this.setState({ showAddProjectModal: true });
    }

    handleAddProjectModalClose = () => {
        this.setState({ showAddProjectModal: false });
    }

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
            showAddProjectModal,
        } = this.state;

        const { projectId } = this.props;
        const {
            history,
        } = this.props;

        return (
            <div styleName="project-panel">
                <div styleName="sidebar">
                    {pending && <LoadingAnimation />}
                    <header styleName="header">
                        <h3 styleName="heading">
                            {projectStrings.headerProjects}
                        </h3>
                        <PrimaryButton
                            onClick={this.handleAddProjectClick}
                            iconName={iconNames.add}
                        >
                            {projectStrings.addProjectButtonLabel}
                        </PrimaryButton>
                        <TextInput
                            onChange={this.handleSearchInputChange}
                            placeholder={projectStrings.searchProjectPlaceholder}
                            styleName="search-input"
                            type="search"
                            value={this.state.searchInputValue}
                            showLabel={false}
                            showHintAndError={false}
                        />
                        <Modal
                            closeOnEscape
                            onClose={this.handleAddProjectModalClose}
                            show={showAddProjectModal}
                        >
                            <ModalHeader
                                title={projectStrings.addProjectModalTitle}
                                rightComponent={
                                    <TransparentPrimaryButton
                                        onClick={this.handleAddProjectModalClose}
                                    >
                                        <span className={iconNames.close} />
                                    </TransparentPrimaryButton>
                                }
                            />
                            <ModalBody>
                                <UserProjectAdd
                                    onProjectAdded={this.handleProjectAdded}
                                    handleModalClose={this.handleAddProjectModalClose}
                                />
                            </ModalBody>
                        </Modal>
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
                            key={projectId}
                            styleName="project-details"
                            projectId={+projectId}
                            mainHistory={history}
                        />
                    ) : (
                        <p styleName="no-project-text">{projectStrings.noProjectText}</p>
                    )
                }
            </div>
        );
    }
}
