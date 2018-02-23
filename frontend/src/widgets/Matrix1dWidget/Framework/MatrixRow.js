import PropTypes from 'prop-types';
import React from 'react';

import ListView from '../../../vendor/react-store/components/View/List/ListView';

import MatrixCell from './MatrixCell';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    cells: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    title: undefined,
    onChange: undefined,
    selectedCells: {},
};

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
        if (this.props.cells !== nextProps.cells) {
            this.setState({ cells: nextProps.cells });
        }
    }

    renderCell = (key, data) => (
        <MatrixCell key={key}>
            { data.value }
        </MatrixCell>
    )

    render() {
        const { cells } = this.state;
        const { title } = this.props;

        return (
            <div className={styles['matrix-row']}>
                <div className={styles.title}>
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
