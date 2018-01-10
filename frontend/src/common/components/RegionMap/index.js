import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import GeoJsonMap from '../GeoJsonMap';

import { FgRestBuilder } from '../../../public/utils/rest';

import {
    Button,
    SegmentButton,
} from '../../../public/components/Action';
import {
    LoadingAnimation,
} from '../../../public/components/View';

import {
    iconNames,
    commonStrings,
} from '../../constants';
import {
    createParamsForAdminLevelsForRegionGET,
    createUrlForAdminLevelsForRegion,
    createUrlForGeoAreasLoadTrigger,
    createUrlForGeoJsonMap,
    createUrlForGeoJsonBounds,
} from '../../rest';

const propTypes = {
    className: PropTypes.string,
    regionId: PropTypes.number,
    selections: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string,
        title: PropTypes.string,
    })),
    onChange: PropTypes.func,
    onLocationsChange: PropTypes.func,
};

const defaultProps = {
    className: '',
    regionId: undefined,
    selections: [],
    onChange: undefined,
    onLocationsChange: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class RegionMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
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
        this.destroy();
    }

    destroy() {
        if (this.staleRequestTimeout) {
            clearTimeout(this.staleRequestTimeout);
        }
        this.geoJsonRequests.forEach(request => request.stop());
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }
        if (this.adminLevelsRequest) {
            this.adminLevelsRequest.stop();
        }
    }

    create(regionId) {
        this.destroy();

        if (!regionId) {
            this.setState({ pending: false });
            return;
        }

        this.setState({ pending: true });

        const params = createParamsForAdminLevelsForRegionGET();
        const triggerUrl = createUrlForGeoAreasLoadTrigger(regionId);
        const adminLevelsUrl = createUrlForAdminLevelsForRegion(regionId);

        this.staleCheckCount = 0;
        this.triggerRequest = this.createRequest(
            triggerUrl,
            params,
            () => {
                console.log(`Triggered geo areas loading task for ${regionId}`);
                this.tryRequestToCheckStale();
            },
        );

        this.adminLevelsRequest = this.createRequest(
            adminLevelsUrl,
            params,
            (response) => {
                const stale = response.results.reduce((acc, adminLevel) => (
                    adminLevel.staleGeoAreas || acc
                ), false);

                if (stale) {
                    if (this.staleCheckCount === 0) {
                        this.triggerRequest.start();
                    } else {
                        this.staleRequestTimeout = setTimeout(() => {
                            this.tryRequestToCheckStale();
                        }, 1000);
                    }
                } else {
                    this.setState({
                        pending: false,
                        error: undefined,
                        selectedAdminLevelId: response.results.length > 0 ? `${response.results[0].id}` : '',
                        adminLevels: response.results,
                    }, () => {
                        this.loadGeoJsons();
                    });
                }
            },
        );

        this.adminLevelsRequest.start();
    }

    tryRequestToCheckStale(maxCount = 30) {
        if (this.triggerRequest) {
            this.triggerRequest.stop();
        }

        if (this.staleCheckCount === maxCount) {
            this.setState({
                pending: false,
                error: undefined,
                adminLevels: [],
            });
            return;
        }

        this.staleCheckCount += 1;
        this.adminLevelsRequest.start();
    }

    createRequest = (url, params, onSuccess) => (
        new FgRestBuilder()
            .url(url)
            .params(params)
            .success((response) => {
                try {
                    onSuccess(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: commonStrings.erverErrorText,
                });
            })
            .fatal((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: commonStrings.connectionFailureText,
                });
            })
            .build()
    )

    handleAreaClick = (selection) => {
        const selections = [...this.props.selections];
        const index = selections.findIndex(s => s.key === selection.key);

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
                    .success((response) => {
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
        } = this.state;

        if (error) {
            return (
                <div styleName="message">
                    { error }
                </div>
            );
        }

        if (adminLevels && adminLevels.length > 0 && selectedAdminLevelId) {
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
                    />
                    <div styleName="bottom-bar">
                        <SegmentButton
                            data={
                                adminLevels.map(al => ({
                                    label: al.title,
                                    value: `${al.id}`,
                                }))
                            }
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
                {commonStrings.mapNotAvailable}
            </div>
        );
    }

    render() {
        const {
            className,
        } = this.props;
        const {
            pending,
        } = this.state;

        return (
            <div
                className={className}
                styleName="region-map"
            >
                {
                    (pending && (
                        <LoadingAnimation />
                    )) || (
                        this.renderContent()
                    )
                }
            </div>
        );
    }
}
