import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import SegmentButton from '../../vendor/react-store/components/Action/SegmentButton';
import Button from '../../vendor/react-store/components/Action/Button';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import {
    createParamsForAdminLevelsForRegionGET,
    createUrlForAdminLevelsForRegion,
    createUrlForGeoAreasLoadTrigger,
    createUrlForGeoJsonMap,
    createUrlForGeoJsonBounds,
} from '../../rest';
import { commonStringsSelector } from '../../redux';
import { iconNames } from '../../constants';
import GeoJsonMap from '../GeoJsonMap';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number,
    selections: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
    onLocationsChange: PropTypes.func,
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    regionId: undefined,
    selections: [],
    onChange: undefined,
    onLocationsChange: undefined,
};

const mapStateToProps = state => ({
    commonStrings: commonStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class RegionMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
            adminLevelPending: {},
            error: false,
            adminLevels: [],
            geoJsons: {},
            geoJsonBounds: {},
        };
        this.geoJsonRequests = [];
    }

    componentDidMount() {
        this.create(this.props.regionId);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.regionId !== nextProps.regionId) {
            this.create(nextProps.regionId);
        }
    }

    componentWillUnmount() {
        this.geoJsonRequests.forEach(request => request.stop());
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }
        if (this.adminLevelsRequest) {
            this.adminLevelsRequest.stop();
        }
    }

    create(regionId) {
        this.geoJsonRequests.forEach(request => request.stop());

        if (!regionId) {
            this.setState({ pending: false, adminLevelPending: {} });
            return;
        }

        this.hasTriggeredOnce = false;
        this.setState({ pending: true, adminLevelPending: {} });

        if (this.adminLevelsRequest) {
            this.adminLevelsRequest.stop();
        }
        this.adminLevelsRequest = this.createAdminLevelsRequest(regionId);
        this.adminLevelsRequest.start();
    }

    createTriggerRequest = regionId => (
        new FgRestBuilder()
            .url(createUrlForGeoAreasLoadTrigger(regionId))
            .params(createParamsForAdminLevelsForRegionGET())
            .success(() => {
                console.log(`Triggered geo areas loading task for ${regionId}`);
                if (this.adminLevelsRequest) {
                    this.adminLevelsRequest.stop();
                }
                this.adminLevelsRequest = this.createAdminLevelsRequest(regionId);
                this.adminLevelsRequest.start();
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: this.props.commonStrings('erverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: this.props.commonStrings('connectionFailureText'),
                });
            })
            .build()
    )

    createAdminLevelsRequest = regionId => (
        new FgRestBuilder()
            .url(createUrlForAdminLevelsForRegion(regionId))
            .params(createParamsForAdminLevelsForRegionGET())
            .maxPollAttempts(200)
            .pollTime(2000)
            .shouldPoll(response => (
                this.hasTriggeredOnce &&
                response.results.reduce((acc, adminLevel) => (
                    adminLevel.staleGeoAreas || acc
                ), false)
            ))
            .success((response) => {
                const stale = response.results.reduce((acc, adminLevel) => (
                    adminLevel.staleGeoAreas || acc
                ), false);

                if (stale) {
                    this.hasTriggeredOnce = true;
                    if (this.triggerRequest) {
                        this.triggerRequest.stop();
                    }
                    this.triggerRequest = this.createTriggerRequest(regionId);
                    this.triggerRequest.start();
                } else {
                    this.setState({
                        pending: false,
                        adminLevelPending: {},
                        error: undefined,
                        selectedAdminLevelId: response.results.length > 0 ? `${response.results[0].id}` : '',
                        adminLevels: response.results,
                    }, () => {
                        this.loadGeoJsons();
                    });
                }
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: this.props.commonStrings('erverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: this.props.commonStrings('connectionFailureText'),
                });
            })
            .build()
    )

    handleAreaClick = (selection) => {
        const selections = [...this.props.selections];
        const index = selections.indexOf(selection);

        if (index === -1) {
            selections.push(selection);
        } else {
            selections.splice(index, 1);
        }

        if (this.props.onChange) {
            this.props.onChange(selections);
        }
    }

    handleAdminLevelSelection = (id) => {
        this.setState({
            selectedAdminLevelId: id,
        });
    }

    loadLocations() {
        const { adminLevels, geoJsons } = this.state;
        let locations = [];
        adminLevels.forEach((adminLevel) => {
            const geoJson = geoJsons[adminLevel.id];
            if (geoJson) {
                locations = [
                    ...locations,
                    ...geoJson.features.map(feature => ({
                        key: feature.properties.pk,
                        label: feature.properties.title,
                    })),
                ];
            }
        });

        if (this.props.onLocationsChange) {
            this.props.onLocationsChange(locations);
        }
    }

    loadGeoJsons() {
        const { adminLevels } = this.state;
        const params = createParamsForAdminLevelsForRegionGET();
        adminLevels.forEach((adminLevel) => {
            {
                const url = createUrlForGeoJsonMap(adminLevel.id);
                const request = new FgRestBuilder()
                    .url(url)
                    .params(params)
                    .preLoad(() => {
                        this.setState({
                            adminLevelPending: {
                                ...this.state.adminLevelPending,
                                [adminLevel.id]: true,
                            },
                        });
                    })
                    .postLoad(() => {
                        this.setState({
                            adminLevelPending: {
                                ...this.state.adminLevelPending,
                                [adminLevel.id]: false,
                            },
                        });
                    })
                    .success((response) => {
                        // FIXME: write schema
                        const geoJsons = {
                            [adminLevel.id]: response,
                            ...this.state.geoJsons,
                        };
                        this.setState({ geoJsons }, () => {
                            this.loadLocations();
                        });
                    })
                    .failure((response) => {
                        console.log(response);
                    })
                    .fatal((response) => {
                        console.log(response);
                    })
                    .build();
                request.start();

                this.geoJsonRequests.push(request);
            }
            {
                const url = createUrlForGeoJsonBounds(adminLevel.id);
                const request = new FgRestBuilder()
                    .url(url)
                    .params(params)
                    .success((response) => {
                        // FIXME: write schema
                        const bounds = response.bounds;
                        const geoJsonBounds = {
                            [adminLevel.id]: bounds && [[
                                bounds.minX,
                                bounds.minY,
                            ], [
                                bounds.maxX,
                                bounds.maxY,
                            ]],
                            ...this.state.geoJsonBounds,
                        };
                        this.setState({ geoJsonBounds });
                    })
                    .failure((response) => {
                        console.log(response);
                    })
                    .fatal((response) => {
                        console.log(response);
                    })
                    .build();
                request.start();

                this.geoJsonRequests.push(request);
            }
        });
    }

    handleRefresh = () => {
        this.create(this.props.regionId);
    }

    renderContent() {
        const {
            error,
            adminLevels,
            selectedAdminLevelId,
            geoJsons,
            geoJsonBounds,
            adminLevelPending,
        } = this.state;

        if (error) {
            return (
                <div styleName="message">
                    { error }
                </div>
            );
        }

        if (adminLevels && adminLevels.length > 0 && selectedAdminLevelId) {
            const adminLevel = adminLevels.find(al => al.id === +selectedAdminLevelId);
            const segmentButtonData = adminLevels.map(al => ({
                label: al.title,
                value: `${al.id}`,
            }));

            return (
                <div styleName="map-container">
                    <Button
                        styleName="refresh-button"
                        onClick={this.handleRefresh}
                    >
                        <span className={iconNames.refresh} />
                    </Button>
                    <GeoJsonMap
                        selections={this.props.selections}
                        styleName="geo-json-map"
                        geoJson={geoJsons[selectedAdminLevelId]}
                        geoJsonBounds={geoJsonBounds[selectedAdminLevelId]}
                        onAreaClick={this.handleAreaClick}
                        thickness={adminLevels.length - adminLevel.level}
                        pending={adminLevelPending[selectedAdminLevelId]}
                    />
                    <div styleName="bottom-bar">
                        <SegmentButton
                            data={segmentButtonData}
                            selected={selectedAdminLevelId}
                            backgroundHighlight
                            onChange={this.handleAdminLevelSelection}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div styleName="message">
                {this.props.commonStrings('mapNotAvailable')}
            </div>
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        return (
            <div
                className={className}
                styleName="region-map"
            >
                { pending ? <LoadingAnimation /> : this.renderContent() }
            </div>
        );
    }
}
