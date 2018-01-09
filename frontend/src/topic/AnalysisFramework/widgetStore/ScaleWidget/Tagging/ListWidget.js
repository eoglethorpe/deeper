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
    api: PropTypes.object.isRequired,      // eslint-disable-line
    attribute: PropTypes.object,      // eslint-disable-line
    data: PropTypes.object,      // eslint-disable-line
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
        updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.attribute !== nextProps.attribute) {
            updateAttribute(nextProps);
        }
    }

    getActiveSelectionStyle = (key) => {
        const { selectedScale } = this.props.attribute || emptyObject;
        const scaleUnitStyle = ['scale-unit'];
        if (selectedScale === key) {
            scaleUnitStyle.push('selected');
        }
        const styleNames = scaleUnitStyle.map(d => styles[d]);
        return styleNames.join(' ');
    }

    getScale = (key, data) => (
        <button
            key={key}
            onClick={() => this.handleScaleClick(key)}
            title={data.title}
            className={this.getActiveSelectionStyle(key)}
            style={{ backgroundColor: data.color }}
        />
    )

    createFilterData = (attribute) => {
        const { data } = this.props;
        return {
            values: undefined,
            number: attribute.selectedScale && (
                data.scaleUnits.findIndex(s => s.key === attribute.selectedScale) + 1
            ),
        };
    }

    createExportData = (attribute) => {
        const { data } = this.props;
        const scale = data.scaleUnits.find(s => s.key === attribute.selectedScale);
        return {
            excel: {
                value: scale ? scale.title : '',
            },
        };
    }

    handleScaleClick = (selectedScale) => {
        const { api, id, entryId } = this.props;
        const attribute = { selectedScale };
        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .apply();
    }

    render() {
        const { data } = this.props;

        return (
            <div styleName="scales">
                <ListView
                    styleName="scale"
                    data={(data || emptyObject).scaleUnits || emptyList}
                    keyExtractor={ScaleTaggingList.rowKeyExtractor}
                    modifier={this.getScale}
                />
            </div>
        );
    }
}
