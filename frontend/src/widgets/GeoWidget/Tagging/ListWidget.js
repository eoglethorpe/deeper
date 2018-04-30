import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import GeoSelection from '../../../components/GeoSelection';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

import {
    geoOptionsForProjectSelector,
    regionsForProjectSelector,
} from '../../../redux';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    geoOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    attribute: undefined,
    geoOptions: {},
    regions: [],
};

const mapStateToProps = (state, props) => ({
    geoOptions: geoOptionsForProjectSelector(state, props),
    regions: regionsForProjectSelector(state, props),
});

const emptyList = [];

@BoundError(WidgetError)
@connect(mapStateToProps)
export default class GeoTaggingList extends React.PureComponent {
    static valueKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static calcFlatValues = values => (
        values.map(v => v.key)
    )

    constructor(props) {
        super(props);
        const values = (props.attribute && props.attribute.values) || emptyList;
        const flatValues = GeoTaggingList.calcFlatValues(values);

        this.state = {
            values,
            flatValues,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            const values = (nextProps.attribute && nextProps.attribute.values) || emptyList;
            const flatValues = GeoTaggingList.calcFlatValues(values);

            this.setState({
                values,
                flatValues,
            });
        }
    }

    handleGeoSelectionChange = (flatValues, values) => {
        this.setState({
            values,
            flatValues,
        });

        const { api, id, entryId } = this.props;
        const attribute = { values };
        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .apply();
    }

    render() {
        const {
            flatValues,
        } = this.state;
        const {
            geoOptions,
            regions,
        } = this.props;

        return (
            <GeoSelection
                className={styles.geoSelect}
                disabled={false}
                onChange={this.handleGeoSelectionChange}
                geoOptions={geoOptions}
                regions={regions}
                value={flatValues}
            />
        );
    }
}
