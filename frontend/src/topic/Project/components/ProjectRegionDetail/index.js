import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../public/utils/rest';
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
    createUrlForRegion,
    createUrlForProject,
    createUrlForRegionClone,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    tokenSelector,

    regionDetailForRegionSelector,
    projectDetailsSelector,
    setRegionDetailsAction,
    removeProjectRegionAction,
    addNewRegionAction,
} from '../../../../common/redux';
import schema from '../../../../common/schema';

import RegionDetail from '../../../../common/components/RegionDetail';
import RegionDetailView from '../../../../common/components/RegionDetailView';
import RegionAdminLevel from '../../../../common/components/RegionAdminLevel';

import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number,
    projectDetails: PropTypes.object.isRequired, // eslint-disable-line
    regionId: PropTypes.number.isRequired,
    token: PropTypes.object.isRequired, // eslint-disable-line
    regionDetails: PropTypes.object.isRequired, // eslint-disable-line
    addNewRegion: PropTypes.func.isRequired,
    setRegionDetails: PropTypes.func.isRequired,
    removeProjectRegion: PropTypes.func.isRequired,
};

const defaultProps = {
    activeProject: undefined,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),
    projectDetails: projectDetailsSelector(state, props),
    regionDetails: regionDetailForRegionSelector(state, props),
    token: tokenSelector(state),
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
        this.regionRequest = this.createRegionRequest(props.regionId);
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
        const regionRequest = new RestBuilder()
            .url(createUrlForRegion(regionId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
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
        const regionCloneRequest = new RestBuilder()
            .url(createUrlForRegionClone(regionId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForRegionClone(
                    { access },
                    { project: projectId },
                );
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
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

        const projectPatchRequest = new RestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForProjectPatch(
                    { access },
                    { regions },
                );
            })
            .decay(0.3)
            .maxRetryTime(3000)
            .maxRetryAttempts(10)
            .success((response) => {
                try {
                    schema.validate(response, 'project');
                    this.props.removeProjectRegion({
                        projectId,
                        regionId: removedRegionId,
                    });
                } catch (er) {
                    console.error(er);
                }
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
        console.log(deleteConfirm);
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
            regionId,
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
                            Remove Region
                        </DangerButton>
                        {
                            isPublic && (
                                <PrimaryButton
                                    disabled={dataLoading}
                                    styleName="clone-btn"
                                    onClick={this.handleRegionCloneClick}
                                >
                                    Clone and Edit
                                </PrimaryButton>
                            )
                        }
                    </div>
                    <Confirm
                        show={this.state.deleteConfirmModalShow}
                        closeOnEscape
                        onClose={deleteConfirm => this.handleRegionRemove(
                            deleteConfirm, projectDetails, regionId)}
                    >
                        <p>{`Are you sure you want to remove
                            ${regionDetails.title} from project ${projectDetails.title}?`}</p>
                    </Confirm>
                    <Confirm
                        show={this.state.cloneConfirmModalShow}
                        onClose={cloneConfirm => this.handleRegionClone(
                            cloneConfirm, regionId, activeProject)}
                    >
                        <p>{`Are you sure you want to clone ${regionDetails.title}?`}</p>
                        <p>After cloning and editing this region,
                            you will not recieve any updates in this public region.</p>
                    </Confirm>
                </header>
                {
                    !isPublic ? (
                        <div styleName="region-details">
                            <div styleName="detail-map-container">
                                <RegionDetail
                                    dataLoading={dataLoading}
                                    regionId={regionId}
                                    styleName="region-detail-form"
                                />
                                <div styleName="map-container">
                                    The map
                                </div>
                            </div>
                            <RegionAdminLevel
                                styleName="admin-levels"
                                regionId={regionId}
                            />
                        </div>
                    ) : (
                        <div styleName="region-details-non-edit">
                            <RegionDetailView regionId={regionId} />
                            <div styleName="map-container-non-edit">
                                The map
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
}
