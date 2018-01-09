import PropTypes from 'prop-types';
import React from 'react';

import mapboxgl from 'mapbox-gl';

import {
    LoadingAnimation,
} from '../../../public/components/View';

const propTypes = {
    className: PropTypes.string,
    onAreaClick: PropTypes.func,
    selections: PropTypes.arrayOf(PropTypes.string),
    geoJson: PropTypes.object,  // eslint-disable-line
    geoJsonBounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
};

const defaultProps = {
    className: '',
    onAreaClick: undefined,
    selections: [],
    geoJson: undefined,
    geoJsonBounds: undefined,
};


export default class GeoJsonMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            map: undefined,
        };
    }

    componentDidMount() {
        this.mounted = true;

        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
        const map = new mapboxgl.Map({
            center: [50, 10],
            container: this.mapContainer,
            style: process.env.REACT_APP_MAPBOX_STYLE,
            zoom: 2,
        });

        map.on('load', () => {
            if (this.mounted) {
                this.setState({ map }, () => {
                    this.loadGeoJson(this.props.geoJson, this.props.geoJsonBounds);
                    this.setSelections(this.props.selections);
                });
            }
        });

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
        });

        map.on('mousemove', 'geojson', (e) => {
            const feature = e.features[0];
            map.setFilter('geojson-hover', ['==', 'pk', feature.properties.pk]);
            map.getCanvas().style.cursor = 'pointer';

            popup.setLngLat([
                e.lngLat.lng,
                e.lngLat.lat + 0.1,
            ]).setHTML(feature.properties.title);
        });

        map.on('mouseenter', 'geojson', (e) => {
            const feature = e.features[0];
            popup.setHTML(feature.properties.title)
                .addTo(map);
        });

        map.on('mouseleave', 'geojson', () => {
            map.setFilter('geojson-hover', ['==', 'pk', '']);
            map.getCanvas().style.cursor = '';

            popup.remove();
        });

        map.on('click', 'geojson', (e) => {
            if (this.props.onAreaClick) {
                const feature = e.features[0];
                this.props.onAreaClick(
                    feature.properties.pk,
                );
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.geoJson !== nextProps.geoJson) {
            this.loadGeoJson(nextProps.geoJson, nextProps.geoJsonBounds);
        }

        if (this.props.selections !== nextProps.selections) {
            this.setSelections(nextProps.selections);
        }
    }

    componentWillUnmount() {
        const { map } = this.state;
        if (map) {
            if (this.layerAdded) {
                map.removeLayer('geojson');
                map.removeLayer('geojson-selected');
                map.removeLayer('geojson-hover');
                map.removeSource('geojson');
                this.layerAdded = false;
            }
            map.remove();
            this.setState({ map: undefined });
        }

        this.mounted = false;
    }

    setSelections(selections) {
        const { map } = this.state;
        if (!map) {
            return;
        }

        if (this.layerAdded) {
            if (selections.length === 0) {
                map.setFilter('geojson-selected', ['in', 'pk', '']);
            } else {
                map.setFilter('geojson-selected', [
                    'in',
                    'pk',
                    ...selections,
                ]);
            }
        }
    }

    loadGeoJson(geoJson, bounds) {
        const { map } = this.state;
        if (!geoJson || !map) {
            return;
        }

        if (bounds) {
            map.fitBounds(bounds, { padding: 48 });
        }

        if (this.layerAdded) {
            map.getSource('geojson').setData({
                type: 'FeatureCollection',
                features: [],
            });
            map.getSource('geojson').setData(geoJson);
            return;
        }

        map.addSource('geojson', {
            type: 'geojson',
            data: geoJson,
        });
        map.addLayer({
            id: 'geojson',
            type: 'fill',
            source: 'geojson',
            paint: {
                'fill-color': '#088',
                'fill-opacity': 0.5,
            },
        });
        map.addLayer({
            id: 'geojson-selected',
            type: 'fill',
            source: 'geojson',
            paint: {
                'fill-color': '#6e599f',
                'fill-opacity': 0.5,
            },
            filter: ['in', 'pk', ''],
        });
        map.addLayer({
            id: 'geojson-hover',
            type: 'fill',
            source: 'geojson',
            paint: {
                'fill-color': '#fff',
                'fill-opacity': 0.2,
            },
            filter: ['==', 'pk', ''],
        });
        this.layerAdded = true;
    }

    render() {
        const {
            className,
        } = this.props;

        return (
            <div
                className={className}
                ref={(el) => { this.mapContainer = el; }}
                style={{ position: 'relative' }}
            >
                {!this.state.map && (
                    <LoadingAnimation />
                )}
            </div>
        );
    }
}
