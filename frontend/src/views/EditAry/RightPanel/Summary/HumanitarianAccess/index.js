import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import InputGroup from '../../../../../vendor/react-store/components/Input/InputGroup';
import SelectInput from '../../../../../vendor/react-store/components/Input/SelectInput';
import OrganigramSelectInput from '../../../../../components/OrganigramSelectInput';

import TabularInputs from '../TabularInputs';
import styles from './styles.scss';

import {
    priorityIssuesSelector,
    affectedLocationsSelector,
} from '../../../../../redux';

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

    renderInput = (column, row, subRow) => {
        const {
            priorityIssues,
            affectedLocations,
        } = this.props;

        if (row === 0) {
            return (
                <OrganigramSelectInput
                    inputName={`priority-issue-${subRow}-${column}`}
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
                    inputName={`affected-location-${subRow}-${column}`}
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
            <InputGroup inputName="humanitarianAccess">
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
            </InputGroup>
        );
    }
}
