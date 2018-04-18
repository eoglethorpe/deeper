import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    reverseRoute,
    caseInsensitiveSubmatch,
} from '../../vendor/react-store/utils/common';
import Modal from '../../vendor/react-store/components/View/Modal';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ListView from '../../vendor/react-store/components/View/List/ListView';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import SearchInput from '../../vendor/react-store/components/Input/SearchInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';

import UserProjectAdd from '../../components/UserProjectAdd';
import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';
import {
    currentUserAdminProjectsSelector,
    setActiveProjectAction,
    projectIdFromRouteSelector,
    projectStringsSelector,
} from '../../redux';
import {
    iconNames,
    pathNames,
} from '../../constants';

import ProjectDetails from './ProjectDetails';
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
    projectId: PropTypes.number,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    activeUser: {},
    userProjects: {},
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    userProjects: currentUserAdminProjectsSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setActiveProject: params => dispatch(setActiveProjectAction(params)),
});

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
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
        styleNames.push(styles.listItem);
        if (projectId === projectIdFromUrl) {
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
        const { history } = this.props;

        return (
            <div className={styles.projectPanel}>
                <div className={styles.sidebar}>
                    {pending && <LoadingAnimation large />}
                    <header className={styles.header}>
                        <h3 className={styles.heading}>
                            {this.props.projectStrings('headerProjects')}
                        </h3>
                        <PrimaryButton
                            onClick={this.handleAddProjectClick}
                            iconName={iconNames.add}
                        >
                            {this.props.projectStrings('addProjectButtonLabel')}
                        </PrimaryButton>
                        <SearchInput
                            onChange={this.handleSearchInputChange}
                            placeholder={this.props.projectStrings('searchProjectPlaceholder')}
                            className={styles.searchInput}
                            value={this.state.searchInputValue}
                            showLabel={false}
                            showHintAndError={false}
                        />
                        { showAddProjectModal &&
                            <Modal
                                closeOnEscape
                                onClose={this.handleAddProjectModalClose}
                            >
                                <ModalHeader
                                    title={this.props.projectStrings('addProjectModalTitle')}
                                    rightComponent={
                                        <PrimaryButton
                                            onClick={this.handleAddProjectModalClose}
                                            transparent
                                        >
                                            <span className={iconNames.close} />
                                        </PrimaryButton>
                                    }
                                />
                                <ModalBody>
                                    <UserProjectAdd
                                        onProjectAdded={this.handleProjectAdded}
                                        handleModalClose={this.handleAddProjectModalClose}
                                    />
                                </ModalBody>
                            </Modal>
                        }
                    </header>
                    <ListView
                        className={styles.projectList}
                        data={displayUserProjects}
                        keyExtractor={project => project.id}
                        modifier={this.renderSidebarItem}
                    />
                </div>
                {
                    projectId ? (
                        <ProjectDetails
                            key={projectId}
                            className={styles.projectDetails}
                            projectId={projectId}
                            mainHistory={history}
                        />
                    ) : (
                        <p className={styles.noProjectText}>
                            {this.props.projectStrings('noProjectText')}
                        </p>
                    )
                }
            </div>
        );
    }
}
