import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import SelectInput from '../../../../../vendor/react-store/components/Input/SelectInput';
import TextInput from '../../../../../vendor/react-store/components/Input/TextInput';
import OrganigramSelectInput from '../../../../../components/OrganigramSelectInput';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

import {
    affectedGroupsSelector,
    specificNeedGroupsSelector,
    assessmentSummaryStringsSelector,
} from '../../../../../redux';

const propTypes = {
    className: PropTypes.string,
    sectorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    affectedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    specificNeedGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    assessmentSummaryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    affectedGroups: affectedGroupsSelector(state),
    specificNeedGroups: specificNeedGroupsSelector(state),
    assessmentSummaryStrings: assessmentSummaryStringsSelector(state),
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

        const { assessmentSummaryStrings } = props;
        this.rowFieldTitles = [
            assessmentSummaryStrings('prioritySector'),
            assessmentSummaryStrings('affectedGroup'),
            assessmentSummaryStrings('specificNeedGroup'),
        ];

        this.columnFieldTitles = [
            ' ',
            assessmentSummaryStrings('moderateAssistancePopulation'),
            assessmentSummaryStrings('severeAssistancePopulation'),
            assessmentSummaryStrings('assistancePopulation'),
        ];

        this.rowSubFieldTitles = [
            assessmentSummaryStrings('rank1Title'),
            assessmentSummaryStrings('rank2Title'),
            assessmentSummaryStrings('rank3Title'),
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
