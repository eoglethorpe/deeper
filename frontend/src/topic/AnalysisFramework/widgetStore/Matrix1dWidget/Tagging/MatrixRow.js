import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

import ListView from '../../../../../public/components/View/List/ListView';

import MatrixCell from './MatrixCell';

const propTypes = {
    title: PropTypes.string,
    tooltip: PropTypes.string,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onCellClick: PropTypes.func,
    onCellDrop: PropTypes.func,
    selectedCells: PropTypes.objectOf(PropTypes.bool),
};

const defaultProps = {
    title: '',
    tooltip: '',
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

    renderCell = (key, data) => (
        <MatrixCell
            key={key}
            onClick={() => this.handleCellClick(key)}
            onDrop={droppedData => this.handleCellDrop(key, droppedData)}
            active={this.props.selectedCells[key]}
        >
            { data.value }
        </MatrixCell>
    )

    render() {
        const { cells } = this.state;
        const {
            tooltip,
            title,
        } = this.props;

        return (
            <div
                styleName="matrix-row"
            >
                <div
                    styleName="title"
                    title={tooltip}
                >
                    { title }
                </div>
                <ListView
                    data={cells}
                    className={styles.cells}
                    keyExtractor={MatrixRow.cellKeyExtractor}
                    modifier={this.renderCell}
                />
            </div>
        );
    }
}
