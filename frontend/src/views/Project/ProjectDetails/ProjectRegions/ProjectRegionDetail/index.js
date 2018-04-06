import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../vendor/react-store/utils/rest';
import Confirm from '../../../../../vendor/react-store/components/View/Modal/Confirm';
import WarningButton from '../../../../../vendor/react-store/components/Action/Button/WarningButton';
import SuccessButton from '../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import Form, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Form';

import {
    createParamsForRegionClone,
    createParamsForProjectPatch,
    createUrlForProject,
    createUrlForRegionClone,
} from '../../../../../rest';
import {
    activeProjectSelector,
    regionDetailSelector,
    projectDetailsSelector,
    setRegionDetailsAction,
    removeProjectRegionAction,
    addNewRegionAction,

    notificationStringsSelector,
    projectStringsSelector,
} from '../../../../../redux';
import schema from '../../../../../schema';
import notify from '../../../../../notify';

import RegionGetRequest from '../../../requests/RegionGetRequest';
import RegionDetailPatchRequest from '../../../requests/RegionDetailPatchRequest';

import RegionMap from '../../../../../components/RegionMap';
import RegionDetail from '../../../../../components/RegionDetail';
import RegionDetailView from '../../../../../components/RegionDetailView';
import RegionAdminLevel from '../../../../../components/RegionAdminLevel';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    countryId: PropTypes.number.isRequired,
    regionDetail: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
    regionDetail: regionDetailSelector(state, props),
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
        this.state = {
            dataLoading: true,
            showDeleteConfirm: false,
            showCloneAndEditConfirm: false,
        };

        this.schema = {
            fields: {
                code: [requiredCondition],
                title: [requiredCondition],
                regionalGroups: {
                    fields: {
                        wbRegion: [],
                        wbIncomeRegion: [],
                        ochaRegion: [],
                        echoRegion: [],
                        unGeoRegion: [],
                        unGeoSubregion: [],
                    },
                },
            },
        };
    }

    componentWillMount() {
        this.startRegionRequest(this.props.countryId, false);
    }

    startRegionRequest = (regionId, discard) => {
        if (this.requestForRegion) {
            this.requestForRegion.stop();
        }
        const requestForRegion = new RegionGetRequest({
            setRegionDetails: this.props.setRegionDetails,
            setState: v => this.setState(v),
            notificationStrings: this.props.notificationStrings,
            regionDetail: this.props.regionDetail.formValues || {},
            pristine: this.props.regionDetail.pristine,
            discard,
        });
        this.requestForRegion = requestForRegion.create(regionId);
        this.requestForRegion.start();
    }

    startRequestForRegionDetailPatch = (regionId, data) => {
        if (this.regionDetailPatchRequest) {
            this.regionDetailPatchRequest.stop();
        }
        const regionDetailPatchRequest = new RegionDetailPatchRequest({
            setRegionDetails: this.props.setRegionDetails,
            projectStrings: this.props.projectStrings,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
            projectId: this.props.activeProject,
        });
        this.regionDetailPatchRequest = regionDetailPatchRequest.create(regionId, data);
        this.regionDetailPatchRequest.start();
    }

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

    handleDiscardButtonClick = () => {
        this.startRegionRequest(this.props.countryId, true);
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

    successCallback = (values) => {
        this.startRequestForRegionDetailPatch(this.props.regionDetail.formValues.id, values);
    };

    renderCloneAndEditButton = () => {
        const {
            regionDetail,
            projectStrings,
        } = this.props;
        const { dataLoading } = this.state;

        const isPublic = regionDetail.public;
        const cloneAndEditButtonLabel = projectStrings('cloneEditButtonLabel');

        if (!isPublic) {
            return null;
        }

        return (
            <PrimaryButton
                disabled={dataLoading}
                onClick={this.handleRegionCloneClick}
            >
                {cloneAndEditButtonLabel}
            </PrimaryButton>
        );
    }

    renderHeader = () => {
        const {
            regionDetail,
            projectStrings,
        } = this.props;

        const {
            formErrors = {},
            formFieldErrors = {},
            formValues = {},
            pristine = false,
        } = this.props.regionDetail;

        const { dataLoading } = this.state;
        const removeRegionButtonLabel = projectStrings('removeRegionButtonLabel');
        const CloneAndEditButton = this.renderCloneAndEditButton;
        const isPublic = regionDetail.public;

        return (
            <header className={styles.header}>
                <h2>
                    {regionDetail.title}
                </h2>
                <div className={styles.actionButtons}>
                    <CloneAndEditButton />
                    {!isPublic &&
                        <Form
                            failureCallback={this.failureCallback}
                            successCallback={this.successCallback}
                            schema={this.schema}
                            fieldErrors={formFieldErrors}
                            formErrors={formErrors}
                            value={formValues}
                        >
                            <WarningButton
                                disabled={!pristine}
                                onClick={this.handleDiscardButtonClick}
                            >
                                {projectStrings('discardButtonLabel')}
                            </WarningButton>
                            <SuccessButton
                                type="submit"
                                disabled={!pristine}
                            >
                                {projectStrings('saveButtonLabel')}
                            </SuccessButton>
                        </Form>
                    }
                    <DangerButton
                        disabled={dataLoading}
                        onClick={this.handleRegionRemoveClick}
                    >
                        { removeRegionButtonLabel }
                    </DangerButton>
                </div>
            </header>
        );
    }

    renderContent = () => {
        const {
            countryId,
            activeProject,
        } = this.props;
        const { formValues } = this.props.regionDetail;
        const { dataLoading } = this.state;

        const isEditable = formValues.public !== undefined && !formValues.public;

        const classNames = [styles.content];

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
                            projectId={activeProject}
                            countryId={countryId}
                            className={styles.regionDetailForm}
                        />
                    </div>
                    <RegionAdminLevel countryId={countryId} />
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
            regionDetail,
            projectDetails,
            projectStrings,
        } = this.props;
        const { showDeleteConfirm } = this.state;

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
                    {
                        projectStrings('confirmRemoveText', {
                            title: regionDetail.title,
                            projectTitle: projectDetails.title,
                        })
                    }
                </p>
            </Confirm>
        );
    }

    renderCloneAndEditRegionConfirm = () => {
        const {
            countryId,
            regionDetail,
            activeProject,
            projectStrings,
        } = this.props;
        const { showCloneAndEditConfirm } = this.state;

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
                    {projectStrings('confirmCloneText', { title: regionDetail.title })}
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
