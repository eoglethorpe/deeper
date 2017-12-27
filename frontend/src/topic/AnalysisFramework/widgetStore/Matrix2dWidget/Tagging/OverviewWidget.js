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

    handleCellClick = (key, cellKey) => {
        const { api, id, attribute } = this.props;
        const settings = { $auto: {
            [key]: { $auto: {
                [cellKey]: {
                    $apply: item => !item,
                },
            } },
        } };
        api.setEntryAttribute(id, update(attribute, settings));
    }

    handleCellDrop = (key, cellKey, text) => {
        const { api, id } = this.props;
        const existing = api.getEntryForExcerpt(text);

        if (existing) {
            const settings = { $auto: {
                [key]: { $auto: {
                    [cellKey]: {
                        $set: true,
                    },
                } },
            } };
            api.selectEntryAndSetAttribute(
                existing.data.id,
                id,
                update(api.getEntryAttribute(id, existing.data.id), settings),
            );
        } else {
            api.addExcerpt(text, id, {
                [key]: {
                    [cellKey]: true,
                },
            });
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

