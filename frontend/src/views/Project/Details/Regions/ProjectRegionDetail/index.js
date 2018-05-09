import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import Confirm from '../../../../../vendor/react-store/components/View/Modal/Confirm';
import WarningButton from '../../../../../vendor/react-store/components/Action/Button/WarningButton';
import SuccessButton from '../../../../../vendor/react-store/components/Action/Button/SuccessButton';
import DangerButton from '../../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../../vendor/react-store/components/View/LoadingAnimation';
import Faram, {
    requiredCondition,
} from '../../../../../vendor/react-store/components/Input/Faram';

import {
    activeProjectIdFromStateSelector,
    regionDetailSelector,
    projectDetailsSelector,
    setRegionDetailsAction,
    changeRegionDetailsAction,
    setRegionDetailsErrorsAction,
    removeProjectRegionAction,
    addNewRegionAction,
} from '../../../../../redux';
import _ts from '../../../../../ts';

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
    projectId: PropTypes.number.isRequired,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        faramValues: PropTypes.object,
        faramErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }),
    addNewRegion: PropTypes.func.isRequired,
    setRegionDetails: PropTypes.func.isRequired,
    changeRegionDetails: PropTypes.func.isRequired,
    setRegionDetailsErrors: PropTypes.func.isRequired,
    removeProjectRegion: PropTypes.func.isRequired,
    onRegionClone: PropTypes.func,
};

const defaultProps = {
    activeProject: undefined,
    onRegionClone: undefined,
    regionDetail: {
        faramValues: {},
        faramErrors: {},
        pristine: false,
    },
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectIdFromStateSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    regionDetail: regionDetailSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    addNewRegion: params => dispatch(addNewRegionAction(params)),
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
    changeRegionDetails: params => dispatch(changeRegionDetailsAction(params)),
    setRegionDetailsErrors: params => dispatch(setRegionDetailsErrorsAction(params)),
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
            setRegionDetailsErrors: this.props.setRegionDetailsErrors,
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

    handleValidationFailure = (faramErrors) => {
        this.props.setRegionDetailsErrors({
            faramErrors,
            regionId: this.props.regionDetail.id,
        });
    };

    handleValidationSuccess = (values) => {
        this.startRequestForRegionDetailPatch(this.props.regionDetail.id, values);
    };

    handleFaramChange = (faramValues, faramErrors) => {
        this.props.changeRegionDetails({
            faramValues,
            faramErrors,
            regionId: this.props.regionDetail.id,
            projectId: this.props.projectId,
        });
    };

    renderCloneAndEditButton = () => {
        const { regionDetail } = this.props;

        const {
            dataLoading,
            regionClonePending,
        } = this.state;

        const isPublic = regionDetail.public;
        const cloneAndEditButtonLabel = _ts('project', 'cloneEditButtonLabel');

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
        const { regionDetail } = this.props;

        const {
            faramValues = {},
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

        const removeRegionButtonLabel = _ts('project', 'removeRegionButtonLabel');
        const CloneAndEditButton = this.renderCloneAndEditButton;
        const isPublic = regionDetail.public;

        return (
            <header className={styles.header}>
                <h2>
                    {faramValues.title}
                </h2>
                <div className={styles.actionButtons}>
                    <CloneAndEditButton />
                    {!isPublic &&
                        <Fragment>
                            <WarningButton
                                disabled={!pristine}
                                onClick={this.handleDiscardButtonClick}
                            >
                                {_ts('project', 'discardButtonLabel')}
                            </WarningButton>
                            <SuccessButton
                                type="submit"
                                disabled={!pristine}
                            >
                                {_ts('project', 'saveButtonLabel')}
                            </SuccessButton>
                        </Fragment>
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
        } = this.props;
        const {
            faramValues = {},
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
                        _ts('project', 'confirmRemoveText', {
                            title: faramValues.title,
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
        } = this.props;

        const {
            faramValues = {},
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
                    {_ts('project', 'confirmCloneText', { title: faramValues.title })}
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

        const {
            faramErrors = {},
            faramValues = {},
        } = this.props.regionDetail;

        const loading = projectPatchPending ||
            regionClonePending ||
            regionDetailPatchPending;

        return (
            <Faram
                className={styles.regionDetailsContainer}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={loading}
            >
                { loading && <LoadingAnimation /> }
                <Header />
                <Content />
                <DeleteRegionConfirm />
                <CloneAndEditRegionConfirm />
            </Faram>
        );
    }
}
