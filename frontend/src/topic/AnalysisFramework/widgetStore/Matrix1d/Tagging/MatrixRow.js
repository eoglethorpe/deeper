import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from '../styles.scss';

import MatrixCell from './MatrixCell';
import {
    ListView,
} from '../../../../../public/components/View';

const propTypes = {
    title: PropTypes.string,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onCellClick: PropTypes.func,
    onCellDrop: PropTypes.func,
    selectedCells: PropTypes.objectOf(PropTypes.bool),
};

const defaultProps = {
    title: undefined,
    onChange: undefined,
    onCellClick: undefined,
    onCellDrop: undefined,
    selectedCells: {},
};

@CSSModules(styles)
export default class MatrixRow extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static cellKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            cells: props.cells,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            cells: nextProps.cells,
        });
    }

    getCell = (key, data) => (
        <MatrixCell
            key={key}
            onClick={() => this.handleCellClick(key)}
            onDrop={(text) => { this.handleCellDrop(key, text); }}
            active={this.props.selectedCells[key]}
        >
            { data.value }
        </MatrixCell>
    )

    handleCellClick = (key) => {
        this.props.onCellClick(key);
    }

    handleCellDrop = (key, text) => {
        this.props.onCellDrop(key, text);
    }

    handleCellValueInputChange = (key, value) => {
        const newCells = [...this.state.cells];

        const cellIndex = newCells.findIndex(d => d.key === key);
        newCells[cellIndex].value = value;

        this.props.onChange(newCells);
    }

    render() {
        const {
            cells,
        } = this.state;

        return (
            <div
                styleName="matrix-row"
            >
                <div styleName="title">
                    { this.props.title }
                </div>
                <ListView
                    data={cells}
                    className={styles.cells}
                    keyExtractor={MatrixRow.cellKeyExtractor}
                    modifier={this.getCell}
                />
            </div>
        );
    }
}