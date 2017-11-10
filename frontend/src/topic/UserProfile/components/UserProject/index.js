/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author thenav56 <ayernavin@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    FormattedDate,
    Modal,
    ModalBody,
    ModalHeader,
    Table,
} from '../../../../public/components/View';

import {
    UserProjectAdd,
} from '../../components/';

import { RestBuilder } from '../../../../public/utils/rest';

import schema from '../../../../common/schema';
import DeletePrompt from '../../../../common/components/DeletePrompt';

import {
    createParamsForProjectDelete,
    createParamsForProjects,
    createUrlForProject,
    createUrlForProjectsOfUser,
} from '../../../../common/rest';

import {
    tokenSelector,
    userProjectsSelector,
    setUserProjectsAction,
    activeUserSelector,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    setUserProjects: PropTypes.func.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    userProjects: PropTypes.array, // eslint-disable-line
    activeUser: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    match: {
        params: {},
    },
    userProjects: [],
};


const mapStateToProps = (state, props) => ({
    token: tokenSelector(state),
    userProjects: userProjectsSelector(state, props),
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserProjects: params => dispatch(setUserProjectsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserProject extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            // Add Modal state
            addProject: false,

            // Delete Modal state
            deleteProject: false,

            // Active Delete state
            activeProjectDelete: null,
        };

        // TABLE component
        this.projectTableHeaders = [
            {
                key: 'title',
                label: 'Title',
                order: 1,
            },
            {
                key: 'rights',
                label: 'Rights',
                order: 2,
                modifier: (row) => {
                    const { userId } = this.props.match.params;
                    const { memberships = [] } = row;
                    const membership = memberships.find(d => d.member === +userId);
                    return membership && membership.role ? membership.role : '-';
                },
            },
            {
                key: 'createdAt',
                label: 'Created at',
                order: 3,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'modifiedAt',
                label: 'Last Modified at',
                order: 4,
                modifier: row => (
                    <FormattedDate
                        date={row.modifiedAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
            {
                key: 'status',
                label: 'Status',
                order: 5,
                modifier: () => 'Active', // NOTE: Show 'Active' for now
            },
            {
                key: 'members',
                label: 'Members',
                order: 6,
                modifier: d => (d.memberships || []).length,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 7,
                modifier: (d) => {
                    const { activeUser } = this.props;
                    const activeUserMembership = (d.memberships || [])
                        .find(e => e.member === activeUser.userId);

                    if (!activeUserMembership || activeUserMembership.role !== 'admin') {
                        return <div />;
                    }

                    const onEditClick = () => this.handleEditProjectClick(d.id);
                    const onDeleteClick = () => this.handleDeleteProjectClick(d.id);
                    return (
                        <div>
                            <PrimaryButton onClick={onEditClick} >
                                <i className="ion-edit" />
                            </PrimaryButton>
                            <DangerButton onClick={onDeleteClick} >
                                <i className="ion-android-delete" />
                            </DangerButton>
                        </div>
                    );
                },
            },
        ];
        this.projectTableKeyExtractor = rowData => rowData.id;
    }

    componentWillMount() {
        const { userId } = this.props.match.params;
        this.projectsRequest = this.createRequestForProjects(userId);
        this.projectsRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const { userId } = nextProps.match.params;
        if (this.props.match.params.userId !== userId) {
            this.projectsRequest.stop();
            this.projectsRequest = this.createRequestForProjects(userId);
            this.projectsRequest.start();
        }
    }

    componentWillUnmount() {
        this.projectsRequest.stop();
    }

    getActiveDeleteProjectType = () => 'Project'

    getActiveDeleteProjectName = () => {
        const { userProjects } = this.props;
        const project = userProjects.find(e => (
            e.id === this.state.activeProjectDelete
        ));
        return project ? project.title : null;
    }

    deleteActiveProject = () => {
        if (this.projectDeleteRequest) {
            this.projectDeleteRequest.stop();
        }

        const { activeProjectDelete } = this.state;
        this.projectDeleteRequest = this.createRequestForProjectDelete(
            activeProjectDelete,
        );
        this.projectDeleteRequest.start();
    }

    createRequestForProjectDelete = (projectId) => {
        const urlForProject = createUrlForProject(projectId);
        const projectDeleteRequest = new RestBuilder()
            .url(urlForProject)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectDelete({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    console.log(response);
                    /*
                     * TODO: implement
                    this.props.unSetProject({
                        projectId,
                    });
                    */
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return projectDeleteRequest;
    }

    createRequestForProjects = (userId) => {
        const projectsRequest = new RestBuilder()
            .url(createUrlForProjectsOfUser(userId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjects({ access });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(1)
            .success((response) => {
                try {
                    schema.validate(response, 'projectsGetResponse');
                    this.props.setUserProjects({
                        userId,
                        projects: response.results,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
            })
            .fatal((response) => {
                console.info('FATAL:', response);
            })
            .build();
        return projectsRequest;
    }

    // BUTTONS

    handleAddProjectClick = () => {
        this.setState({ addProject: true });
    }

    handleAddProjectClose = () => {
        this.setState({ addProject: false });
    }

    // Table Actions

    // Edit Click
    handleEditProjectClick = (id) => {
        // TODO: @adityakhatri47 route to selected project panel
        console.log(id);
    }

    // Delete Click
    handleDeleteProjectClick = (id) => {
        this.setState({
            deleteProject: true,
            activeProjectDelete: id,
        });
    }

    // Delete Close
    handleDeleteProjectClose = () => {
        this.setState({ deleteProject: false });
    }

    render() {
        const { userProjects } = this.props;
        const {
            addProject,
            deleteProject,
        } = this.state;
        return (
            <div styleName="projects">
                <h2>
                    Projects
                </h2>
                <PrimaryButton onClick={this.handleAddProjectClick} >
                    Add Project
                </PrimaryButton>
                <Modal
                    closeOnEscape
                    onClose={this.handleAddProjectClose}
                    show={addProject}
                >
                    <ModalHeader title="Add Project" />
                    <ModalBody>
                        <UserProjectAdd handleModalClose={this.handleAddProjectClose} />
                    </ModalBody>
                </Modal>
                <Modal
                    closeOnEscape
                    onClose={this.handleDeleteProjectClose}
                    show={deleteProject}
                >
                    <ModalHeader title="Delete Project" />
                    <ModalBody>
                        <DeletePrompt
                            handleCancel={this.handleDeleteProjectClose}
                            handleDelete={this.deleteActiveProject}
                            getName={this.getActiveDeleteProjectName}
                            getType={this.getActiveDeleteProjectType}
                        />
                    </ModalBody>
                </Modal>
                <Table
                    data={userProjects}
                    headers={this.projectTableHeaders}
                    keyExtractor={this.projectTableKeyExtractor}
                />
            </div>
        );
    }
}
