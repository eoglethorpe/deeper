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

export default class HumanitarianAccess extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.rowFieldTitles = [
            'Priority issue',
            'Affected location',
        ];

        this.columnFieldTitles = [
            ' ',
            'Population with limited access',
            'Population with restricted access',
            'Population with humanitarian access constraints',
        ];

        this.rowSubFieldTitles = ['1', '2', '3'];
    }

    getClassName = () => {
        const { className } = this.props;
        const classNames = [
            className,
            'humanitarian-access',
            styles.humanitarianAccess,
        ];

        return classNames.join(' ');
    }

    render() {
        const className = this.getClassName();

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
