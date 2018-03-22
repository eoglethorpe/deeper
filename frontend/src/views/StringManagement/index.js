import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    compareBoolean,
    compareStringAsNumber,
    compareStringByWordCount,
    compareString,
    compareNumber,
} from '../../vendor/react-store/utils/common';
import ListView from '../../vendor/react-store/components/View/List/ListView';
import Table from '../../vendor/react-store/components/View/Table';
import {
    allStringsSelector,
    viewStringsSelector,
    problemsWithRawStringsSelector,
} from '../../redux';


import styles from './styles.scss';

// TODO:
// Search
// Add/Delete entry

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    viewStrings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    problemsWithAllStrings: PropTypes.array.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    allStrings: allStringsSelector(state),
    viewStrings: viewStringsSelector(state),
    problemsWithAllStrings: problemsWithRawStringsSelector(state),
});

@connect(mapStateToProps)
export default class StringManagement extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = e => e.id;
    static keyExtractor2 = e => e.name;

    constructor(props) {
        super(props);

        this.state = {
            mode: 'string', // string or view
            viewName: undefined,
        };

        this.headers = [
            {
                key: 'id',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => compareStringAsNumber(a.id, b.id),
            },
            {
                key: 'value',
                label: 'String',
                order: 2,
                sortable: true,
                comparator: (a, b) => (
                    compareStringByWordCount(a.value, b.value) ||
                    compareString(a.value, b.value)
                ),
            },
            {
                key: 'referenceCount',
                label: 'Refs',
                order: 3,
                sortable: true,
                comparator: (a, b) => compareNumber(a.referenceCount, b.referenceCount),
            },
            {
                key: 'duplicated',
                label: 'Duplicated',
                order: 4,
                sortable: true,
                comparator: (a, b) => (
                    compareBoolean(!!a.duplicated, !!b.duplicated, -1) ||
                    compareStringByWordCount(a.value, b.value) ||
                    compareString(a.value, b.value)
                ),
                modifier: a => (a.duplicated ? a.duplicated : '-'),
            },
        ];
        this.headers2 = [
            {
                key: 'name',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.name, b.name),
            },
            {
                key: 'value',
                label: 'String',
                order: 2,
                sortable: true,
                comparator: (a, b) => (
                    compareStringByWordCount(a.value, b.value) ||
                    compareString(a.value, b.value)
                ),
            },
            {
                key: 'referenceCount',
                label: 'Refs',
                order: 3,
                sortable: true,
                comparator: (a, b) => compareNumber(a.referenceCount, b.referenceCount),
            },
        ];

        this.defaultSort = {
            key: 'value',
            order: 'asc',
        };
        this.defaultSort2 = {
            key: 'name',
            order: 'asc',
        };
    }

    renderError = (key, err) => (
        <div
            key={err.key}
            className={`${styles.msgbox} ${styles[err.type]}`}
        >
            <div className={styles.title}>
                {err.title}
            </div>
            <div className={styles.description}>
                {err.description}
            </div>
        </div>
    )

    render() {
        return (
            <div className={styles.stringPanel}>
                <div className={styles.sidebar}>
                    <h2 className={styles.heading}>
                        String Management
                    </h2>
                    <button
                        className={`${styles['sidebar-button']} ${this.state.mode === 'string' ? styles.active : ''}`}
                        onClick={() => { this.setState({ mode: 'string' }); }}
                    >
                        All Strings
                    </button>
                    { Object.keys(this.props.viewStrings).map(viewName => (
                        <button
                            key={viewName}
                            className={`${styles['sidebar-button']} ${this.state.mode === 'view' && this.state.viewName === viewName ? styles.active : ''}`}
                            onClick={() => { this.setState({ mode: 'view', viewName }); }}
                        >
                            { viewName }
                        </button>
                    )) }
                </div>
                <div className={styles.stringDetail}>
                    {
                        this.state.mode === 'string' && ([
                            <div
                                className={styles.content}
                                key="content"
                            >
                                <Table
                                    data={this.props.allStrings}
                                    headers={this.headers}
                                    keyExtractor={StringManagement.keyExtractor}
                                    defaultSort={this.defaultSort}
                                />
                            </div>,
                            <ListView
                                key="sidebar-right"
                                className={styles.sidebarRight}
                                data={this.props.problemsWithAllStrings}
                                modifier={this.renderError}
                                keyExtractor={StringManagement.keyExtractor}
                            />,
                        ])
                    }
                    {
                        this.state.mode === 'view' && (
                            <div className={styles.content} >
                                <Table
                                    data={this.props.viewStrings[this.state.viewName]}
                                    headers={this.headers2}
                                    keyExtractor={StringManagement.keyExtractor2}
                                    defaultSort={this.defaultSort2}
                                />
                            </div>
                        )
                    }
                </div>
            </div>
        );
    }
}
