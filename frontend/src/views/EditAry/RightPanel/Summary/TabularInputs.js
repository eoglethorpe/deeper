import React from 'react';
import PropTypes from 'prop-types';

import List from '../../../../vendor/react-store/components/View/List';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    rowFieldTitles: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    columnFieldTitles: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    rowSubFieldTitles: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    classNames: PropTypes.object.isRequired,
    inputModifier: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

export default class TabularInputs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderHeader = (k, data) => {
        const { classNames } = this.props;

        return (
            <th
                key={data}
                className={classNames.header}
            >
                {data}
            </th>
        );
    }

    renderHead = () => {
        const {
            columnFieldTitles,
            classNames,
        } = this.props;

        const {
            head,
            row,
        } = classNames;

        return (
            <thead className={head}>
                <tr className={row}>
                    <List
                        data={columnFieldTitles}
                        modifier={this.renderHeader}
                    />
                </tr>
            </thead>
        );
    }

    renderCell = (columnTitle, columnIndex, rowIndex, subRowIndex) => {
        if (columnIndex === 0) {
            return null;
        }

        const {
            classNames,
            inputModifier,
        } = this.props;

        return (
            <td
                className={classNames.cell}
                key={columnTitle}
            >
                {
                    inputModifier(
                        columnIndex - 1,
                        rowIndex,
                        subRowIndex,
                    )
                }
            </td>
        );
    }

    renderRowSubField = (rowIndex, subRowTitle, subRowIndex) => {
        const {
            columnFieldTitles,
            classNames,
        } = this.props;

        const {
            row,
            cell,
        } = classNames;

        const renderCell = (k, columnTitle, columnIndex) => (
            this.renderCell(columnTitle, columnIndex, rowIndex, subRowIndex)
        );

        return (
            <tr
                key={subRowTitle}
                className={row}
            >
                <td className={cell}>
                    {subRowTitle}
                </td>
                <List
                    data={columnFieldTitles}
                    modifier={renderCell}
                />
            </tr>
        );
    }

    renderRow = (k, rowTitle, rowIndex) => {
        const {
            rowSubFieldTitles,
            classNames,
        } = this.props;

        const {
            row,
            sectionTitle,
        } = classNames;

        const renderRowSubField = (dummy, subRowTitle, subRowIndex) => (
            this.renderRowSubField(rowIndex, subRowTitle, subRowIndex)
        );

        return (
            <React.Fragment key={rowTitle}>
                <tr className={row}>
                    <td
                        className={sectionTitle}
                        colSpan="4"
                    >
                        {rowTitle}
                    </td>
                </tr>
                <List
                    data={rowSubFieldTitles}
                    modifier={renderRowSubField}
                />
            </React.Fragment>
        );
    }

    render() {
        const {
            rowFieldTitles,
            classNames,
        } = this.props;

        const {
            wrapper,
            table,
            body,
        } = classNames;

        const Head = this.renderHead;

        return (
            <div className={wrapper}>
                <table className={table}>
                    <Head />
                    <tbody className={body}>
                        <List
                            data={rowFieldTitles}
                            modifier={this.renderRow}
                        />
                    </tbody>
                </table>
            </div>
        );
    }
}
