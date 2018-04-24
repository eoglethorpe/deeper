import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Confirm from '../../../../../vendor/react-store/components/View/Modal/Confirm';
import WarningButton from '../../../../../vendor/react-store/components/Action/Button/WarningButton';
import SuccessButton from '../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import Form, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Form';

import {
    activeProjectIdFromStateSelector,
    regionDetailSelector,
    projectDetailsSelector,
    setRegionDetailsAction,
    removeProjectRegionAction,
    addNewRegionAction,

    notificationStringsSelector,
    projectStringsSelector,
} from '../../../../../redux';

import RegionGetRequest from '../../../requests/RegionGetRequest';
import ProjectPatchRequest from '../../../requests/ProjectPatchRequest';
import RegionCloneRequest from '../../../requests/RegionCloneRequest';
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
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        formValues: PropTypes.object,
        formFieldErrors: PropTypes.object,
        formErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }),
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
    regionDetail: {
        formValues: {},
        formErrors: {},
        formFieldErrors: {},
        pristine: false,
    },
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),
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
            projectPatchPending: false,
            regionClonePending: false,
            regionDetailPatchPending: false,
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

    componentWillUnmount() {
        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }
        if (this.regionDetailPatchRequest) {
            this.regionDetailPatchRequest.stop();
        }
        if (this.requestForRegionClone) {
            this.requestForRegionClone.stop();
        }
        if (this.requestForRegion) {
            this.requestForRegion.stop();
        }
    }

    startRegionRequest = (regionId, discard) => {
        if (this.requestForRegion) {
            this.requestForRegion.stop();
        }
        const requestForRegion = new RegionGetRequest({
            setRegionDetails: this.props.setRegionDetails,
            setState: v => this.setState(v),
            notificationStrings: this.props.notificationStrings,
            regionDetail: this.props.regionDetail || {},
            discard,
        });
        this.requestForRegion = requestForRegion.create(regionId);
        this.requestForRegion.start();
    }

    startRegionCloneRequest = (regionId, projectId) => {
        if (this.requestForRegionClone) {
            this.requestForRegionClone.stop();
        }
        const requestForRegionClone = new RegionCloneRequest({
            onRegionClone: this.props.onRegionClone,
            addNewRegion: this.props.addNewRegion,
            removeProjectRegion: this.props.removeProjectRegion,
            notificationStrings: this.props.notificationStrings,
            projectId,
            setState: v => this.setState(v),
        });
        this.requestForRegionClone = requestForRegionClone.create(regionId, projectId);
        this.requestForRegionClone.start();
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

    startRequestForProjectPatch = (regionId, data) => {
        if (this.projectPatchRequest) {
            this.projectPatchRequest.stop();
        }
        const projectPatchRequest = new ProjectPatchRequest({
            removeProjectRegion: this.props.removeProjectRegion,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.projectPatchRequest = projectPatchRequest.create(regionId, data);
        this.projectPatchRequest.start();
    }

    handleRegionClone = (cloneConfirm, regionId, projectId) => {
        if (cloneConfirm) {
            this.startRegionCloneRequest(regionId, projectId);
        }
        this.setState({
            showCloneAndEditConfirm: false,
        });
    }

    handleRegionRemove = (deleteConfirm, projectDetails, removedRegionId) => {
        if (deleteConfirm) {
            const projectId = projectDetails.id;
            const regions = [...projectDetails.regions];
            const index = regions.findIndex(d => (d.id === removedRegionId));
            regions.splice(index, 1);

            this.startRequestForProjectPatch(projectId, removedRegionId, regions);
        }
        this.setState({
            showDeleteConfirm: false,
        });
    }

    handleDiscardButtonClick = () => {
        this.startRegionRequest(this.props.countryId, true);
    }

    handleRegionRemoveClick = () => {
        this.setState({ showDeleteConfirm: true });
    }

    handleRegionCloneClick = () => {
        this.setState({ showCloneAndEditConfirm: true });
    }

    successCallback = (values) => {
        this.startRequestForRegionDetailPatch(this.props.regionDetail.id, values);
    };

    renderCloneAndEditButton = () => {
        const {
            projectStrings,
            regionDetail,
        } = this.props;

        const {
            dataLoading,
            regionClonePending,
        } = this.state;

        const isPublic = regionDetail.public;
        const cloneAndEditButtonLabel = projectStrings('cloneEditButtonLabel');

        if (!isPublic) {
            return null;
        }

        return (
            <PrimaryButton
                disabled={dataLoading || regionClonePending}
                onClick={this.handleRegionCloneClick}
            >
                {cloneAndEditButtonLabel}
            </PrimaryButton>
        );
    }

    renderHeader = () => {
        const {
            projectStrings,
            regionDetail,
        } = this.props;

        const {
            formErrors = {},
            formFieldErrors = {},
            formValues = {},
            pristine = false,
        } = this.props.regionDetail;

        const {
            dataLoading,
            projectPatchPending,
            regionClonePending,
            regionDetailPatchPending,
        } = this.state;

        const pending = dataLoading ||
            regionClonePending ||
            projectPatchPending ||
            regionDetailPatchPending;

        const removeRegionButtonLabel = projectStrings('removeRegionButtonLabel');
        const CloneAndEditButton = this.renderCloneAndEditButton;
        const isPublic = regionDetail.public;

        return (
            <header className={styles.header}>
                <h2>
                    {formValues.title}
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
                        disabled={pending}
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
            regionDetail,
        } = this.props;
        const {
            formValues = {},
        } = this.props.regionDetail;
        const { dataLoading } = this.state;

        const isEditable = regionDetail.public !== undefined && !regionDetail.public;

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
            projectDetails,
            projectStrings,
        } = this.props;
        const {
            formValues = {},
        } = this.props.regionDetail;
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
                            title: formValues.title,
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
            activeProject,
            projectStrings,
        } = this.props;

        const {
            formValues = {},
        } = this.props.regionDetail;

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
                    {projectStrings('confirmCloneText', { title: formValues.title })}
                </p>
            </Confirm>
        );
    }

    render() {
        const {
            projectPatchPending,
            regionClonePending,
            regionDetailPatchPending,
        } = this.state;

        const Header = this.renderHeader;
        const Content = this.renderContent;
        const DeleteRegionConfirm = this.renderDeleteRegionConfirm;
        const CloneAndEditRegionConfirm = this.renderCloneAndEditRegionConfirm;

        const pending = projectPatchPending ||
            regionClonePending ||
            regionDetailPatchPending;

        return (
            <div className={styles.regionDetailsContainer}>
                { pending && <LoadingAnimation /> }
                <Header />
                <Content />
                <DeleteRegionConfirm />
                <CloneAndEditRegionConfirm />
            </div>
        );
    }
}
