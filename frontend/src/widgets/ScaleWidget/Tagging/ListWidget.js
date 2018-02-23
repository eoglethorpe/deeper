import PropTypes from 'prop-types';
import React from 'react';

import ListView from '../../../vendor/react-store/components/View/List/ListView';

import BoundError from '../../../components/BoundError';
import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
    data: undefined,
};

const emptyObject = {};
const emptyList = [];

@BoundError
export default class ScaleTaggingList extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.createScaleUnits(props);
    }

    componentDidMount() {
        const { attribute, data, api, entryId, id } = this.props;
        if (data) {
            if ((attribute || emptyObject).selectedScale === undefined) {
                const newSelectedScale = data.value;
                const newAttribute = {
                    ...attribute,
                    selectedScale: newSelectedScale,
                };
                api.getEntryModifier(entryId)
                    .setAttribute(id, newAttribute)
                    .apply();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        const {
            attribute: newAttribute,
            data: newData,
        } = nextProps;

        const {
            attribute: oldAttribute,
            data: oldData,
        } = this.props;

        if (oldAttribute !== newAttribute || oldData !== newData) {
            this.createScaleUnits(nextProps);
        }
    }

    getActiveSelectionClassName = (scaleUnit) => {
        const classNames = [
            styles['scale-unit'],
        ];

        if (scaleUnit.selected) {
            classNames.push(styles.selected);
        }

        return classNames.join(' ');
    }

    getScale = (key, scaleUnit) => (
        <button
            key={key}
            onClick={() => this.handleScaleClick(key)}
            title={scaleUnit.title}
            className={this.getActiveSelectionClassName(scaleUnit)}
            style={{ backgroundColor: scaleUnit.color }}
        />
    )

    createScaleUnits = ({ data = emptyObject, attribute = emptyObject }) => {
        const scaleUnits = data.scaleUnits || emptyList;
        const { selectedScale } = attribute;
        this.scaleUnits = scaleUnits.map(s => ({
            ...s,
            selected: selectedScale === s.key,
        }));
    }

    handleScaleClick = (selectedScale) => {
        const { api, id, entryId } = this.props;
        const attribute = { selectedScale };
        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .apply();
    }

    render() {
        return (
            <ListView
                className={styles.list}
                data={this.scaleUnits}
                keyExtractor={ScaleTaggingList.rowKeyExtractor}
                modifier={this.getScale}
            />
        );
    }
}
