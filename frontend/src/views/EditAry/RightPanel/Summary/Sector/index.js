import React from 'react';
import PropTypes from 'prop-types';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class Sector extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.rowFieldTitles = [
            'Priority issue',
            'Affected group',
            'Specific need group',
        ];

        this.columnFieldTitles = [
            ' ',
            'Population in moderate need of assistance (not life threatening)',
            'Population in severe need of assistance (life threatening)',
            'Population in need of assistance',
        ];

        this.rowSubFieldTitles = ['1', '2', '3'];
    }

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'sector',
            styles.sector,
        ];

        return classNames.join(' ');
    }

    render() {
        const { sectorId } = this.props;
        const className = this.getClassName();

        console.warn(sectorId);

        return (
            <TabularInputs
                rowFieldTitles={this.rowFieldTitles}
                columnFieldTitles={this.columnFieldTitles}
                rowSubFieldTitles={this.rowSubFieldTitles}
                classNames={{
                    wrapper: className,
                    table: styles.table,
                    head: styles.head,
                    body: styles.body,
                    row: styles.row,
                    header: styles.header,
                    cell: styles.cell,
                    sectionTitle: styles.sectionTitle,
                }}
                inputModifier={() => null}
            />
        );
    }
}
