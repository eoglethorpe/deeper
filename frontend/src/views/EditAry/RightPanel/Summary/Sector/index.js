import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import SelectInput from '../../../../../vendor/react-store/components/Input/SelectInput';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import OrganigramSelectInput from '../../../../../components/OrganigramSelectInput';

import {
    affectedGroupsSelector,
    specificNeedGroupsSelector,
} from '../../../../../redux';
import _ts from '../../../../../ts';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    sectorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    specificNeedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    affectedGroups: affectedGroupsSelector(state),
    specificNeedGroups: specificNeedGroupsSelector(state),
});

@connect(mapStateToProps)
export default class Sector extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static nodeIdSelector = d => d.id;
    static nodeLabelSelector = d => d.title;
    static nodeChildrenSelector = d => d.children;

    constructor(props) {
        super(props);

        this.rowFieldTitles = [
            _ts('assessmentSummary', 'prioritySector'),
            _ts('assessmentSummary', 'affectedGroup'),
            _ts('assessmentSummary', 'specificNeedGroup'),
        ];

        this.columnFieldTitles = [
            ' ',
            _ts('assessmentSummary', 'moderateAssistancePopulation'),
            _ts('assessmentSummary', 'severeAssistancePopulation'),
            _ts('assessmentSummary', 'assistancePopulation'),
        ];

        this.rowSubFieldTitles = [
            _ts('assessmentSummary', 'rank1Title'),
            _ts('assessmentSummary', 'rank2Title'),
            _ts('assessmentSummary', 'rank3Title'),
        ];
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

    renderInput = (column, row, subRow) => {
        const {
            affectedGroups,
            specificNeedGroups,
        } = this.props;

        if (row === 0) {
            return (
                <TextInput
                    faramElementName={`priority-sector-${subRow}-${column}`}
                    showHintAndError={false}
                />
            );
        } else if (row === 1) {
            return (
                <OrganigramSelectInput
                    faramElementName={`affected-group-${subRow}-${column}`}
                    showHintAndError={false}
                    data={affectedGroups}
                    idSelector={Sector.nodeIdSelector}
                    labelSelector={Sector.nodeLabelSelector}
                    childrenSelector={Sector.nodeChildrenSelector}
                />
            );
        } else if (row === 2) {
            return (
                <SelectInput
                    faramElementName={`specific-need-group-${subRow}-${column}`}
                    showHintAndError={false}
                    options={specificNeedGroups}
                    labelSelector={Sector.nodeLabelSelector}
                    keySelector={Sector.nodeIdSelector}
                />
            );
        }

        return null;
    }

    render() {
        const { sectorId } = this.props;
        const className = this.getClassName();

        return (
            <FaramGroup faramElementName={`sector-${sectorId}`}>
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
                    inputModifier={this.renderInput}
                />
            </FaramGroup>
        );
    }
}
