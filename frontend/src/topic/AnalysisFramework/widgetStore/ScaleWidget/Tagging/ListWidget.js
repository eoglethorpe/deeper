import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    ListView,
} from '../../../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    exportable: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
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
        const { api, id, entryId, exportable } = this.props;
        const attribute = { selectedScale };
        api.getEntryModifier(entryId)
            .setAttribute(id, attribute)
            .setExportData(exportable.id, this.createExportData(attribute))
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
