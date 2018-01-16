import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import {
    Confirm,
} from '../../../../public/components/View';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    createParamsForUser,
    createParamsForRegionClone,
    createParamsForProjectPatch,
    createUrlForProject,
    createUrlForRegionClone,
    createUrlForRegionWithField,
} from '../../../../common/rest';
import {
    activeProjectSelector,

    regionDetailForRegionSelector,
    projectDetailsSelector,
    setRegionDetailsAction,
    removeProjectRegionAction,
    addNewRegionAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';
import {
    notificationStrings,
    projectStrings,
} from '../../../../common/constants';
import notify from '../../../../common/notify';

import RegionMap from '../../../../common/components/RegionMap';
import RegionDetail from '../../../../common/components/RegionDetail';
import RegionDetailView from '../../../../common/components/RegionDetailView';
import RegionAdminLevel from '../../../../common/components/RegionAdminLevel';

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
};

const defaultProps = {
    activeProject: undefined,
    onRegionClone: undefined,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    regionDetails: regionDetailForRegionSelector(state, props),
});
const mapDispatchToProps = dispatch => ({
    addNewRegion: params => dispatch(addNewRegionAction(params)),
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
    removeProjectRegion: params => dispatch(removeProjectRegionAction(params)),
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ProjectRegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.regionRequest = this.createRegionRequest(props.countryId);
        this.state = {
            dataLoading: true,
            deleteConfirmModalShow: false,
            cloneConfirmModalShow: false,
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
                        title: notificationStrings.countryDelete,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.countryDeleteSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure(() => {
                notify.send({
                    title: notificationStrings.countryDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.countryDeleteFailure,
                    duration: notify.duration.SLOW,
                });
            })
            .fatal(() => {
                notify.send({
                    title: notificationStrings.countryDelete,
                    type: notify.type.ERROR,
                    message: notificationStrings.countryDeleteFatal,
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
            cloneConfirmModalShow: false,
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
            deleteConfirmModalShow: false,
        });
    }

    handleRegionRemoveClick = () => {
        this.setState({
            deleteConfirmModalShow: true,
        });
    }

    handleRegionCloneClick = () => {
        this.setState({
            cloneConfirmModalShow: true,
        });
    }

    render() {
        const {
            countryId,
            regionDetails,
            activeProject,
            projectDetails,
        } = this.props;

        const { dataLoading } = this.state;

        const isPublic = regionDetails.public;

        return (
            <div styleName="region-details-container">
                <header styleName="header">
                    <h2>
                        {regionDetails.title}
                    </h2>
                    <div styleName="action-btns">
                        <DangerButton
                            disabled={dataLoading}
                            onClick={this.handleRegionRemoveClick}
                        >
                            {projectStrings.removeRegionButtonLabel}
                        </DangerButton>
                        {
                            isPublic && (
                                <PrimaryButton
                                    disabled={dataLoading}
                                    styleName="clone-btn"
                                    onClick={this.handleRegionCloneClick}
                                >
                                    {projectStrings.cloneEditButtonLabel}
                                </PrimaryButton>
                            )
                        }
                    </div>
                    <Confirm
                        show={this.state.deleteConfirmModalShow}
                        closeOnEscape
                        onClose={deleteConfirm => this.handleRegionRemove(
                            deleteConfirm, projectDetails, countryId,
                        )}
                    >
                        <p>{`${projectStrings.confirmRemoveText}
                            ${regionDetails.title} from project ${projectDetails.title}?`}</p>
                    </Confirm>
                    <Confirm
                        show={this.state.cloneConfirmModalShow}
                        onClose={cloneConfirm => this.handleRegionClone(
                            cloneConfirm, countryId, activeProject,
                        )}
                    >
                        <p>{`${projectStrings.confirmCloneText} ${regionDetails.title}?`}</p>
                    </Confirm>
                </header>
                {
                    (isPublic !== undefined && !isPublic) ? (
                        <div styleName="region-details">
                            <div styleName="detail-map-container">
                                <RegionDetail
                                    dataLoading={dataLoading}
                                    countryId={countryId}
                                    styleName="region-detail-form"
                                />
                                <div styleName="map-container">
                                    <RegionMap regionId={countryId} />
                                </div>
                            </div>
                            <RegionAdminLevel
                                styleName="admin-levels"
                                countryId={countryId}
                            />
                        </div>
                    ) : (
                        <div styleName="region-details-non-edit">
                            <RegionDetailView
                                styleName="region-detail-box"
                                countryId={countryId}
                            />
                            <div styleName="map-container-non-edit">
                                <RegionMap regionId={countryId} />
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
}
