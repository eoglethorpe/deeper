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
    regionId: PropTypes.number.isRequired,
    selections: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func,
};

const defaultProps = {
    className: '',
    selections: [],
    onSelect: undefined,
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
        this.create();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.regionId !== nextProps.regionId) {
            this.create();
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

    create() {
        const {
            regionId,
        } = this.props;

        this.destroy();
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
                    error: 'Server error',
                });
            })
            .fatal((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: 'Failed connecting to server',
                });
            })
            .build()
    )

    handleAreaClick = (pk) => {
        const selections = [...this.props.selections];
        const index = selections.indexOf(pk);

        if (index === -1) {
            selections.push(pk);
        } else {
            selections.splice(index, 1);
        }

        if (this.props.onSelect) {
            this.props.onSelect(selections);
        }
    }

    handleAdminLevelSelection = (id) => {
        this.setState({
            selectedAdminLevelId: id,
        });
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
                        this.setState({ geoJsons });
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
        this.create();
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
                            onPress={this.handleAdminLevelSelection}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div styleName="message">
                Map not available
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
