import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles.scss';

import {
    ListView,
} from '../../../../../public/components/View';

import update from '../../../../../public/utils/immutable-update';

import MatrixRow from './MatrixRow';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line
    filters: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
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
            showEditModal: false,
            rows: props.data || [],
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            rows: nextProps.data || [],
        });
    }

    getRow = (key, data) => (
        <MatrixRow
            key={key}
            title={data.title}
            cells={data.cells}
            onCellClick={cellKey => this.handleCellClick(key, cellKey)}
            onCellDrop={(cellKey, text) => this.handleCellDrop(key, cellKey, text)}
            selectedCells={this.props.attribute ? this.props.attribute[key] : {}}
        />
    )

    getFilterData = (attribute) => {
        const filterValues = [];

        Object.keys(attribute).forEach((key) => {
            const row = attribute[key];

            let rowExists = false;
            Object.keys(row).forEach((cellKey) => {
                if (row[cellKey]) {
                    rowExists = true;
                    filterValues.push(cellKey);
                }
            });

            if (rowExists) {
                filterValues.push(key);
            }
        });

        return {
            values: filterValues,
            number: undefined,
        };
    }

    handleCellClick = (key, cellKey) => {
        const { api, id, filters, attribute } = this.props;
        const settings = { $auto: {
            [key]: { $auto: {
                [cellKey]: {
                    $apply: item => !item,
                },
            } },
        } };

        const newAttribute = update(attribute, settings);
        api.getEntryModifier()
            .setAttribute(id, newAttribute)
            .setFilterData(filters[0].id, this.getFilterData(newAttribute))
            .apply();
    }

    handleCellDrop = (key, cellKey, text) => {
        const { api, id, filters } = this.props;
        const existing = api.getEntryForExcerpt(text);

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
                .setFilterData(filters[0].id, this.getFilterData(attribute))
                .apply();
        } else {
            const attribute = {
                [key]: {
                    [cellKey]: true,
                },
            };
            api.getEntryBuilder()
                .setExcerpt(text)
                .addAttribute(id, attribute)
                .addFilterData(filters[0].id, this.getFilterData(attribute))
                .apply();
        }
    }

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
                    modifier={this.getRow}
                />
            </div>
        );
    }
}

