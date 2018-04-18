import React from 'react';
import PropTypes from 'prop-types';

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

    render() {
        const {
            rowFieldTitles,
            columnFieldTitles,
            rowSubFieldTitles,
            classNames,
            inputModifier,
        } = this.props;

        const {
            wrapper,
            table,
            head,
            body,
            row,
            header,
            cell,
            sectionTitle,
        } = classNames;

        return (
            <div className={wrapper}>
                <table className={table}>
                    <thead className={head}>
                        <tr className={row}>
                            {
                                columnFieldTitles.map(
                                    title => (
                                        <th className={header}>
                                            {title}
                                        </th>
                                    ),
                                )
                            }
                        </tr>
                    </thead>
                    <tbody className={body}>
                        {
                            rowFieldTitles.map(
                                (rowTitle, rowIndex) => (
                                    <React.Fragment>
                                        <tr className={row}>
                                            <td
                                                className={sectionTitle}
                                                colSpan="4"
                                            >
                                                {rowTitle}
                                            </td>
                                        </tr>
                                        {
                                            rowSubFieldTitles.map(
                                                (subRowTitle, subRowIndex) => (
                                                    <tr className={row}>
                                                        <td className={cell}>
                                                            {subRowTitle}
                                                        </td>
                                                        {
                                                            columnFieldTitles.map(
                                                                (columnTitle, columnIndex) => (
                                                                    columnIndex === 0 ? (
                                                                        null
                                                                    ) : (
                                                                        <td className={cell}>
                                                                            {
                                                                                inputModifier(
                                                                                    columnIndex - 1,
                                                                                    rowIndex,
                                                                                    subRowIndex,
                                                                                )
                                                                            }
                                                                        </td>
                                                                    )
                                                                ),
                                                            )
                                                        }
                                                    </tr>
                                                ),
                                            )
                                        }
                                    </React.Fragment>
                                ),
                            )
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}
