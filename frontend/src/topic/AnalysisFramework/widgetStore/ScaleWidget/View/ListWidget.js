import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    ListView,
} from '../../../../../public/components/View';

import styles from './styles.scss';

const propTypes = {
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
export default class ScaleViewWidget extends React.PureComponent {
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
            title={data.title}
            className={this.getActiveSelectionStyle(key)}
            style={{ backgroundColor: data.color }}
        />
    )

    render() {
        const { data } = this.props;

        return (
            <div styleName="scales">
                <ListView
                    styleName="scale"
                    data={(data || emptyObject).scaleUnits || emptyList}
                    keyExtractor={ScaleViewWidget.rowKeyExtractor}
                    modifier={this.getScale}
                />
            </div>
        );
    }
}
