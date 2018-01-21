import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    ListView,
} from '../../../../../public/components/View';

import styles from './styles.scss';
import { updateAttribute } from './utils';

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

@CSSModules(styles)
export default class ScaleTaggingList extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.createScaleUnits(props);
        updateAttribute(props);
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
        if (this.props.attribute !== nextProps.attribute) {
            updateAttribute(nextProps);
        }

        if (this.props.attribute !== nextProps.attribute ||
            this.props.data !== nextProps.data) {
            this.createScaleUnits(nextProps);
        }
    }

    getActiveSelectionStyle = (scaleUnit) => {
        const scaleUnitStyle = ['scale-unit'];
        if (scaleUnit.selected) {
            scaleUnitStyle.push('selected');
        }
        const styleNames = scaleUnitStyle.map(d => styles[d]);
        return styleNames.join(' ');
    }

    getScale = (key, scaleUnit) => (
        <button
            key={key}
            onClick={() => this.handleScaleClick(key)}
            title={scaleUnit.title}
            className={this.getActiveSelectionStyle(scaleUnit)}
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
            <div styleName="scales">
                <ListView
                    styleName="scale"
                    data={this.scaleUnits}
                    keyExtractor={ScaleTaggingList.rowKeyExtractor}
                    modifier={this.getScale}
                />
            </div>
        );
    }
}
