import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import Confirm from '../../../../../vendor/react-store/components/View/Modal/Confirm';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    createParamsForUser,
    createParamsForRegionClone,
    createParamsForProjectPatch,
    createUrlForProject,
    createUrlForRegionClone,
    createUrlForRegionWithField,
} from '../../../../../rest';
import {
    activeProjectSelector,

    regionDetailForRegionSelector,
    projectDetailsSelector,
    setRegionDetailsAction,
    removeProjectRegionAction,
    addNewRegionAction,

    notificationStringsSelector,
    projectStringsSelector,
} from '../../../../../redux';
import schema from '../../../../../schema';
import notify from '../../../../../notify';

import RegionMap from '../../../../../components/RegionMap';
import RegionDetail from '../../../../../components/RegionDetail';
import RegionDetailView from '../../../../../components/RegionDetailView';
import RegionAdminLevel from '../../../../../components/RegionAdminLevel';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    countryId: PropTypes.number.isRequired,
    regionDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    addNewRegion: PropTypes.func.isRequired,
    setRegionDetails: PropTypes.func.isRequired,
    removeProjectRegion: PropTypes.func.isRequired,
    onRegionClone: PropTypes.func,

    notificationStrings: PropTypes.func.isRequired,
    projectStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    activeProject: undefined,
    onRegionClone: undefined,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    regionDetails: regionDetailForRegionSelector(state, props),
    notificationStrings: notificationStringsSelector(state),
    projectStrings: projectStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addNewRegion: params => dispatch(addNewRegionAction(params)),
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
    removeProjectRegion: params => dispatch(removeProjectRegionAction(params)),
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectRegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.regionRequest = this.createRegionRequest(props.countryId);
        this.state = {
            dataLoading: true,
            showDeleteConfirm: false,
            showCloneAndEditConfirm: false,
        };
    }

    componentWillMount() {
        this.regionRequest.start();
    }

    componentWillUnmount() {
        if (this.regionRequest) {
            this.regionRequest.stop();
        }
    }

    createRegionRequest = (regionId) => {
        const urlForRegionForRegionalGroups = createUrlForRegionWithField(regionId, ['regional_groups']);

        const regionRequest = new FgRestBuilder()
            .url(urlForRegionForRegionalGroups)
            .params(() => createParamsForUser())
            .preLoad(() => { this.setState({ dataLoading: true }); })
            .postLoad(() => { this.setState({ dataLoading: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'region');
                    this.props.setRegionDetails({
                        regionDetails: response,
                        regionId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return regionRequest;
    };

    createRegionCloneRequest = (regionId, projectId) => {
        const regionCloneRequest = new FgRestBuilder()
            .url(createUrlForRegionClone(regionId))
            .params(() => createParamsForRegionClone({ project: projectId }))
            .success((response) => {
                try {
                    schema.validate(response, 'region');
                    this.props.addNewRegion({
                        regionDetail: response,
                        projectId,
                    });
                    this.props.removeProjectRegion({
                        projectId,
                        regionId,
                    });
                    if (this.props.onRegionClone) {
                        this.props.onRegionClone(response.id);
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return regionCloneRequest;
    };

    createProjectPatchRequest = (projectDetails, removedRegionId) => {
        const projectId = projectDetails.id;
        const regions = [...projectDetails.regions];
        const index = regions.findIndex(d => (d.id === removedRegionId));
        regions.splice(index, 1);

        const projectPatchRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForProjectPatch({ regions }))
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                    this.props.removeProjectRegion({
                        projectId,
                        regionId: removedRegionId,
                    });
                    notify.send({
                        title: this.props.notificationStrings('countryDelete'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('countryDeleteSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: this.props.notificationStrings('countryDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('countryDeleteFailure'),
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('countryDelete'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('countryDeleteFatal'),
                    duration: notify.duration.SLOW,
                });
            })
            .build();
        return projectPatchRequest;
    };

    handleRegionClone = (cloneConfirm, regionId, activeProject) => {
        if (cloneConfirm) {
            if (this.regionCloneRequest) {
                this.regionCloneRequest.stop();
            }
            this.regionCloneRequest = this.createRegionCloneRequest(regionId, activeProject);
            this.regionCloneRequest.start();
        }
        this.setState({
            showCloneAndEditConfirm: false,
        });
    }

    handleRegionRemove = (deleteConfirm, projectDetails, removedRegionId) => {
        if (deleteConfirm) {
            if (this.regionRemoveRequest) {
                this.regionRemoveRequest.stop();
            }
            this.regionRemoveRequest = this.createProjectPatchRequest(
                projectDetails,
                removedRegionId,
            );
            this.regionRemoveRequest.start();
        }
        this.setState({
            showDeleteConfirm: false,
        });
    }

    handleRegionRemoveClick = () => {
        this.setState({
            showDeleteConfirm: true,
        });
    }

    handleRegionCloneClick = () => {
        this.setState({
            showCloneAndEditConfirm: true,
        });
    }

    renderCloneAndEditButton = () => {
        const {
            regionDetails,
            projectStrings,
        } = this.props;
        const { dataLoading } = this.state;

        const isPublic = regionDetails.public;
        const cloneAndEditButtonLabel = projectStrings('cloneEditButtonLabel');

        if (!isPublic) {
            return null;
        }

        return (
            <PrimaryButton
                disabled={dataLoading}
                className={styles.cloneAndEditButton}
                onClick={this.handleRegionCloneClick}
            >
                {cloneAndEditButtonLabel}
            </PrimaryButton>
        );
    }

    renderHeader = () => {
        const {
            regionDetails,
            projectStrings,
        } = this.props;

        const { dataLoading } = this.state;
        const removeRegionButtonLabel = projectStrings('removeRegionButtonLabel');
        const CloneAndEditButton = this.renderCloneAndEditButton;

        return (
            <header className={styles.header}>
                <h2>
                    {regionDetails.title}
                </h2>
                <div className={styles.actionButtons}>
                    <DangerButton
                        disabled={dataLoading}
                        onClick={this.handleRegionRemoveClick}
                    >
                        { removeRegionButtonLabel }
                    </DangerButton>
                    <CloneAndEditButton />
                </div>
            </header>
        );
    }

    renderContent = () => {
        const {
            countryId,
            regionDetails,
            activeProject,
        } = this.props;

        const { dataLoading } = this.state;
        const isEditable = regionDetails.public !== undefined && !regionDetails.public;

        const classNames = [
            styles.content,
        ];

        if (isEditable) {
            return (
                <div className={classNames.join(' ')}>
                    <div className={styles.top}>
                        <RegionMap
                            className={styles.regionMap}
                            regionId={countryId}
                        />
                        <RegionDetail
                            dataLoading={dataLoading}
                            countryId={countryId}
                            projectId={activeProject}
                            className={styles.regionDetailForm}
                        />
                    </div>
                    <RegionAdminLevel
                        className="admin-level-table"
                        countryId={countryId}
                    />
                </div>
            );
        }

        classNames.push(styles.viewOnly);
        return (
            <div className={classNames.join(' ')}>
                <RegionMap
                    className={styles.regionMap}
                    regionId={countryId}
                />
                <RegionDetailView countryId={countryId} />
            </div>
        );
    }

    renderDeleteRegionConfirm = () => {
        const {
            countryId,
            regionDetails,
            projectDetails,
            projectStrings,
        } = this.props;
        const { showDeleteConfirm } = this.state;
        const confirmRemoveText = projectStrings('confirmRemoveText');

        return (
            <Confirm
                show={showDeleteConfirm}
                closeOnEscape
                onClose={
                    (deleteConfirm) => {
                        this.handleRegionRemove(deleteConfirm, projectDetails, countryId);
                    }
                }
            >
                <p>
                    {`
                        ${confirmRemoveText}
                        ${regionDetails.title} from project ${projectDetails.title}?
                    `}
                </p>
            </Confirm>
        );
    }

    renderCloneAndEditRegionConfirm = () => {
        const {
            countryId,
            regionDetails,
            activeProject,
            projectStrings,
        } = this.props;
        const { showCloneAndEditConfirm } = this.state;
        const confirmCloneText = projectStrings('confirmCloneText');

        return (
            <Confirm
                show={showCloneAndEditConfirm}
                onClose={
                    (cloneConfirm) => {
                        this.handleRegionClone(cloneConfirm, countryId, activeProject);
                    }
                }
            >
                <p>
                    {`
                        ${confirmCloneText}
                        ${regionDetails.title}?
                    `}
                </p>
            </Confirm>
        );
    }

    render() {
        const Header = this.renderHeader;
        const Content = this.renderContent;
        const DeleteRegionConfirm = this.renderDeleteRegionConfirm;
        const CloneAndEditRegionConfirm = this.renderCloneAndEditRegionConfirm;

        return (
            <div className={styles.regionDetailsContainer}>
                <Header />
                <Content />
                <DeleteRegionConfirm />
                <CloneAndEditRegionConfirm />
            </div>
        );
    }
}
