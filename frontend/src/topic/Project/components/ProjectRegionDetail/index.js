import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { RestBuilder } from '../../../../public/utils/rest';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    createParamsForUser,
    createParamsForRegionClone,
    createUrlForRegion,
    createUrlForRegionClone,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    tokenSelector,

    regionDetailForRegionSelector,
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

    handleCloneRegion = (regionId, activeProject) => {
        console.log('cloning region', regionId, ' project ', activeProject);
        if (this.regionCloneRequest) {
            this.regionCloneRequest.stop();
        }
        this.regionCloneRequest = this.createRegionCloneRequest(regionId, activeProject);
        this.regionCloneRequest.start();
    }

    render() {
        const {
            regionId,
            regionDetails,
            activeProject,
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
                        <DangerButton>
                            Remove Region
                        </DangerButton>
                        {isPublic &&
                            <PrimaryButton
                                styleName="clone-btn"
                                onClick={() => this.handleCloneRegion(regionId, activeProject)}
                            >
                                Clone and Edit
                            </PrimaryButton>
                        }
                    </div>
                </header>
                {!isPublic &&
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
                }
                {isPublic &&
                    <div styleName="region-details-non-edit">
                        <RegionDetailView regionId={regionId} />
                        <div styleName="map-container-non-edit">
                            The map
                        </div>
                    </div>
                }
            </div>
        );
    }
}
