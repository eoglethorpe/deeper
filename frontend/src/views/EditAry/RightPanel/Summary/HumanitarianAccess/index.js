import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FaramGroup from '../../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import SelectInput from '../../../../../vendor/react-store/components/Input/SelectInput';
import OrganigramSelectInput from '../../../../../components/OrganigramSelectInput';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

import {
    priorityIssuesSelector,
    affectedLocationsSelector,
    assessmentSummaryStringsSelector,
} from '../../../../../redux';

const propTypes = {
    className: PropTypes.string,
    priorityIssues: PropTypes.arrayOf(PropTypes.object).isRequired,
    affectedLocations: PropTypes.arrayOf(PropTypes.object).isRequired,
    assessmentSummaryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    priorityIssues: priorityIssuesSelector(state),
    affectedLocations: affectedLocationsSelector(state),
    assessmentSummaryStrings: assessmentSummaryStringsSelector(state),
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

        const { assessmentSummaryStrings } = props;
        this.rowFieldTitles = [
            assessmentSummaryStrings('priorityIssue'),
            assessmentSummaryStrings('affectedLocation'),
        ];

        this.columnFieldTitles = [
            '',
            assessmentSummaryStrings('limitedAccessPopulation'),
            assessmentSummaryStrings('restrictedAccessPopulation'),
            assessmentSummaryStrings('humanitarianAccessPopulation'),
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
                <OrganigramSelectInput
                    faramElementName={`priority-issue-${subRow}-${column}`}
                    showHintAndError={false}
                    data={priorityIssues}
                    idSelector={HumanitarianAccess.nodeIdSelector}
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
