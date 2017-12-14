import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from '../styles.scss';

import {
    ListView,
} from '../../../../../public/components/View';

import MatrixRow from '../common/MatrixRow';
import { MODE_TAG } from '../common/constants';

const propTypes = {
    // onChange: PropTypes.func.isRequired,
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: [],
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
            mode={MODE_TAG}
            onChange={(value) => { this.handleRowDataChange(key, value); }}
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
                    modifier={this.getRow}
                />
            </div>
        );
    }
}

