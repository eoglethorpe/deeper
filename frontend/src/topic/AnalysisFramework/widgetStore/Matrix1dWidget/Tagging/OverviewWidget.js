import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import {
    ListView,
} from '../../../../../public/components/View';

import update from '../../../../../public/utils/immutable-update';

import MatrixRow from './MatrixRow';
import { updateAttribute } from './utils';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    data: [],
    attribute: undefined,
};

@CSSModules(styles)
export default class Matrix1dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            rows: props.data || [],
        };
        updateAttribute(props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            this.setState({
                rows: nextProps.data || [],
            });
        }

        if (this.props.attribute !== nextProps.attribute) {
            updateAttribute(nextProps);
        }
    }

    handleCellClick = (key, cellKey) => {
        const { api, id, attribute } = this.props;
        const settings = { $auto: {
            [key]: { $auto: {
                [cellKey]: {
                    $apply: item => !item,
                },
            } },
        } };

        const newAttribute = update(attribute, settings);

        // TODO: complicated cellApplied
        // const cellApplied = !!newAttribute[key][cellKey];

        api.getEntryModifier()
            .setAttribute(id, newAttribute)
            .apply();
    }

    handleCellDrop = (key, cellKey, droppedData) => {
        const { api, id } = this.props;
        const existing = api.getEntryForData(droppedData);

        if (existing) {
            const settings = { $auto: {
                [key]: { $auto: {
                    [cellKey]: {
                        $set: true,
                    },
                } },
            } };

            const attribute = update(api.getEntryAttribute(id, existing.data.id), settings);

            api.selectEntry(existing.data.id);
            api.getEntryModifier(existing.data.id)
                .setAttribute(id, attribute)
                .apply();
        } else {
            const attribute = {
                [key]: {
                    [cellKey]: true,
                },
            };
            api.getEntryBuilder()
                .setData(droppedData)
                .addAttribute(id, attribute)
                .apply();
        }
    }

    renderRow = (key, data) => (
        <MatrixRow
            key={key}
            title={data.title}
            tooltip={data.tooltip}
            cells={data.cells}
            onCellClick={cellKey => this.handleCellClick(key, cellKey)}
            onCellDrop={(cellKey, droppedData) => this.handleCellDrop(key, cellKey, droppedData)}
            selectedCells={this.props.attribute ? this.props.attribute[key] : {}}
        />
    )

    render() {
        const {
            rows,
        } = this.state;

        return (
            <div styleName="tagging-matrix-1d">
                <ListView
                    data={rows}
                    className={styles.rows}
                    keyExtractor={Matrix1dOverview.rowKeyExtractor}
                    modifier={this.renderRow}
                />
            </div>
        );
    }
}

