import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

import {
    editArySelectedSectorsSelector,
    assessmentSectorsSelector,
} from '../../../../../redux';

const propTypes = {
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    selectedSectors: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    sectors: PropTypes.array.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    selectedSectors: editArySelectedSectorsSelector(state),
    sectors: assessmentSectorsSelector(state),
});

const mapDispatchToProps = (/* dispatch */) => ({
});

@connect(mapStateToProps, mapDispatchToProps)
export default class CrossSector extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.rowFieldTitles = [
            'Priority sector',
            'Affected group',
            'Specific need group',
        ];

        this.columnFieldTitles = [
            ' ',
            'Population in moderate need of assistance (not life threatening) (do not know)',
            'Population in severe need of assistance (life threatening) (do not know)',
            'Population in need of assistance (do not know)',
        ];

        this.rowSubFieldTitles = ['1', '2', '3'];
    }

    getClassName = (empty = false) => {
        const { className } = this.props;
        const classNames = [
            className,
            'cross-sector',
            styles.crossSector,
        ];

        if (empty) {
            classNames.push('empty');
            classNames.push(styles.empty);
        }

        return classNames.join(' ');
    }

    render() {
        const {
            sectors,
            selectedSectors,
        } = this.props;


        if (selectedSectors.length < 3) {
            const className = this.getClassName(true);
            const emptyText = 'Select at least 3 sectors in Methodology';

            return (
                <div className={className}>
                    { emptyText }
                </div>
            );
        }

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
