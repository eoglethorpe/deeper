import PropTypes from 'prop-types';
import React from 'react';
import mapboxgl from 'mapbox-gl';

import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

const propTypes = {
    className: PropTypes.string,
    onAreaClick: PropTypes.func,
    selections: PropTypes.arrayOf(PropTypes.string),
    geoJson: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    geoJsonBounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    thickness: PropTypes.number,
    pending: PropTypes.bool,
};

const defaultProps = {
    className: '',
    onAreaClick: undefined,
    selections: [],
    geoJson: undefined,
    geoJsonBounds: undefined,
    thickness: 1,
    pending: false,
};


const createPolygonFilter = (selections, operator = 'in') => {
    if (!selections || selections.length === 0) {
        return [
            'all',
            ['==', '$type', 'Polygon'],
            ['in', 'pk', ''],
        ];
    }

    return [
        'all',
        ['==', '$type', 'Polygon'],
        [
            operator,
            'pk',
            ...selections,
        ],
    ];
};


const createPointFilter = (selections, operator = 'in') => {
    if (!selections || selections.length === 0) {
        return [
            'all',
            ['==', '$type', 'Point'],
            ['in', 'pk', ''],
        ];
    }

    return [
        'all',
        ['==', '$type', 'Point'],
        [
            operator,
            'pk',
            ...selections,
        ],
    ];
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
                    this.loadGeoJson(
                        this.props.geoJson,
                        this.props.geoJsonBounds,
                        this.props.thickness,
                    );
                    this.setSelections(this.props.selections);
                });
            }
        });

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
        });

        map.on('zoom', (e) => {
            if (e.originalEvent) {
                popup.setLngLat(map.unproject([
                    e.originalEvent.offsetX,
                    e.originalEvent.offsetY - 8,
                ]));
            }
        });

        map.on('mousemove', 'geojson', (e) => {
            const feature = e.features[0];
            map.setFilter('geojson-hover', createPolygonFilter([feature.properties.pk], '=='));
            map.getCanvas().style.cursor = 'pointer';

            popup.setLngLat(map.unproject([
                e.point.x,
                e.point.y - 8,
            ])).setHTML(feature.properties.title);
        });

        map.on('mouseenter', 'geojson', (e) => {
            const feature = e.features[0];
            popup.setHTML(feature.properties.title)
                .addTo(map);
        });

        map.on('mouseleave', 'geojson', () => {
            map.setFilter('geojson-hover', createPolygonFilter(undefined, '=='));
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

        map.on('mousemove', 'point', (e) => {
            const feature = e.features[0];
            map.setFilter('point-hover', createPointFilter([feature.properties.pk], '=='));
            map.getCanvas().style.cursor = 'pointer';

            popup.setLngLat(map.unproject([
                e.point.x,
                e.point.y - 8,
            ])).setHTML(feature.properties.title);
        });

        map.on('mouseenter', 'point', (e) => {
            const feature = e.features[0];
            popup.setHTML(feature.properties.title)
                .addTo(map);
        });

        map.on('mouseleave', 'point', () => {
            map.setFilter('point-hover', createPointFilter(undefined, '=='));
            map.getCanvas().style.cursor = '';

            popup.remove();
        });

        map.on('click', 'point', (e) => {
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
            this.loadGeoJson(
                nextProps.geoJson,
                nextProps.geoJsonBounds,
                nextProps.thickness,
            );
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
                map.removeLayer('outline');
                map.removeLayer('geojson-selected');
                map.removeLayer('geojson-hover');
                map.removeLayer('point');
                map.removeLayer('point-selected');
                map.removeLayer('point-hover');
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
            map.setFilter('geojson-selected', createPolygonFilter(selections));
            map.setFilter('point-selected', createPointFilter(selections));
        }
    }

    loadGeoJson(geoJson, bounds, thickness) {
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
            map.setPaintProperty('outline', 'line-width', Math.max(thickness, 1));
            return;
        }

        const basePaint = {
            'fill-color': '#088',
            'fill-opacity': 0.5,
        };

        map.addSource('geojson', {
            type: 'geojson',
            data: geoJson,
        });
        map.addLayer({
            id: 'geojson',
            type: 'fill',
            source: 'geojson',
            paint: basePaint,
        });
        map.addLayer({
            id: 'outline',
            type: 'line',
            source: 'geojson',
            paint: {
                'line-color': '#fff',
                'line-width': thickness,
            },
            filter: ['==', '$type', 'Polygon'],
        });
        map.addLayer({
            id: 'geojson-selected',
            type: 'fill',
            source: 'geojson',
            paint: {
                ...basePaint,
                'fill-color': '#6e599f',
            },
            filter: createPolygonFilter(undefined),
        });
        map.addLayer({
            id: 'geojson-hover',
            type: 'fill',
            source: 'geojson',
            paint: {
                ...basePaint,
                'fill-color': '#fff',
                'fill-opacity': 0.2,
            },
            filter: createPolygonFilter(undefined, '=='),
        });

        const baseCirclePaint = {
            'circle-radius': 8,
            'circle-color': '#088',
        };
        map.addLayer({
            id: 'point',
            type: 'circle',
            source: 'geojson',
            paint: baseCirclePaint,
            filter: ['==', '$type', 'Point'],
        });
        map.addLayer({
            id: 'point-selected',
            type: 'circle',
            source: 'geojson',
            paint: {
                ...baseCirclePaint,
                'circle-color': '#6e599f',
            },
            filter: createPointFilter(undefined),
        });
        map.addLayer({
            id: 'point-hover',
            type: 'circle',
            source: 'geojson',
            paint: {
                ...baseCirclePaint,
                'circle-color': '#fff',
                'circle-opacity': 0.2,
            },
            filter: createPointFilter(undefined, '=='),
        });
        this.layerAdded = true;
    }

    render() {
        const {
            className,
            pending,
        } = this.props;

        return (
            <div
                className={className}
                ref={(el) => { this.mapContainer = el; }}
                style={{ position: 'relative' }}
            >
                {(pending || !this.state.map) && (
                    <LoadingAnimation />
                )}
            </div>
        );
    }
}
