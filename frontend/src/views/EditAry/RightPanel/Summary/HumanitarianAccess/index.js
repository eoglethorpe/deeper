import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import SelectInput from '../../../../../vendor/react-store/components/Input/SelectInput';
import HierarchicalMultiSelectInput from '../../../../../vendor/react-store/components/Input/HierarchicalMultiSelectInput';

import {
    priorityIssuesSelector,
    affectedLocationsSelector,
} from '../../../../../redux';
import _ts from '../../../../../ts';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    priorityIssues: PropTypes.arrayOf(PropTypes.object).isRequired,
    affectedLocations: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    priorityIssues: priorityIssuesSelector(state),
    affectedLocations: affectedLocationsSelector(state),
});

@connect(mapStateToProps)
export default class HumanitarianAccess extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static nodeIdSelector = d => d.id;
    static nodeLabelSelector = d => d.title;
    static nodeChildrenSelector = d => d.children;

    constructor(props) {
        super(props);

        this.rowFieldTitles = [
            _ts('assessmentSummary', 'priorityIssue'),
            _ts('assessmentSummary', 'affectedLocation'),
        ];

        this.columnFieldTitles = [
            '',
            _ts('assessmentSummary', 'limitedAccessPopulation'),
            _ts('assessmentSummary', 'restrictedAccessPopulation'),
            _ts('assessmentSummary', 'humanitarianAccessPopulation'),
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
            'humanitarian-access',
            styles.humanitarianAccess,
        ];

        return classNames.join(' ');
    }

    renderInput = (column, row, subRow) => {
        const {
            priorityIssues,
            affectedLocations,
        } = this.props;

        if (row === 0) {
            return (
                <HierarchicalMultiSelectInput
                    faramElementName={`priority-issue-${subRow}-${column}`}
                    showHintAndError={false}
                    options={priorityIssues}
                    keySelector={HumanitarianAccess.nodeIdSelector}
                    labelSelector={HumanitarianAccess.nodeLabelSelector}
                    childrenSelector={HumanitarianAccess.nodeChildrenSelector}
                />
            );
        } else if (row === 1) {
            return (
                <SelectInput
                    faramElementName={`affected-location-${subRow}-${column}`}
                    showHintAndError={false}
                    options={affectedLocations}
                    labelSelector={HumanitarianAccess.nodeLabelSelector}
                    keySelector={HumanitarianAccess.nodeIdSelector}
                />
            );
        }

        return null;
    }

    render() {
        const className = this.getClassName();

        return (
            <FaramGroup faramElementName="humanitarianAccess">
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
