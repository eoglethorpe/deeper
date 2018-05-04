import React, { Fragment } from 'react';
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
    linkStringsSelector,
    problemsWithStringsSelector,
    linkKeysSelector,
} from '../../redux';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    linkStrings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    problemsWithStrings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    linkKeys: PropTypes.array.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    allStrings: allStringsSelector(state),
    linkStrings: linkStringsSelector(state),
    problemsWithStrings: problemsWithStringsSelector(state),
    linkKeys: linkKeysSelector(state),
});

const emptyArray = [];

@connect(mapStateToProps)
export default class StringManagement extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = e => e.id;
    static keyExtractor2 = e => e.name;

    constructor(props) {
        super(props);

        this.state = {
            linkName: undefined,
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
        this.defaultSort = {
            key: 'value',
            order: 'asc',
        };

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
                key: 'valueId',
                label: 'String Id',
                order: 3,
                sortable: false,
            },
            {
                key: 'referenceCount',
                label: 'Refs',
                order: 4,
                sortable: true,
                comparator: (a, b) => compareNumber(a.referenceCount, b.referenceCount),
            },
        ];
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

    renderLeftPane = () => {
        const { linkName } = this.state;
        const { linkKeys } = this.props;
        return (
            <div className={styles.sidebar}>
                <h2 className={styles.heading}>
                    String Management
                </h2>
                <button
                    className={`${styles.sidebarButton} ${linkName === undefined ? styles.active : ''}`}
                    onClick={() => { this.setState({ linkName: undefined }); }}
                >
                    { (this.props.problemsWithStrings.$common || emptyArray).length } ALL
                </button>
                { linkKeys.map(name => (
                    <button
                        key={name}
                        className={`${styles.sidebarButton} ${linkName === name ? styles.active : ''}`}
                        onClick={() => { this.setState({ linkName: name }); }}
                        type="button"
                    >
                        { (this.props.problemsWithStrings[name] || emptyArray).length } { name }
                    </button>
                )) }
            </div>
        );
    }

    renderStringsTable = () => (
        <div className={styles.content}>
            <Table
                data={this.props.allStrings}
                headers={this.headers}
                keyExtractor={StringManagement.keyExtractor}
                defaultSort={this.defaultSort}
            />
        </div>
    )

    renderLinksTable = () => (
        <div className={styles.content} >
            <Table
                data={this.props.linkStrings[this.state.linkName] || emptyArray}
                headers={this.headers2}
                keyExtractor={StringManagement.keyExtractor2}
                defaultSort={this.defaultSort2}
            />
        </div>
    )

    render() {
        const LeftPane = this.renderLeftPane;
        const StringsTable = this.renderStringsTable;
        const LinksTable = this.renderLinksTable;

        const { linkName } = this.state;
        const { problemsWithStrings } = this.props;

        const problems = problemsWithStrings[linkName || '$common'] || emptyArray;

        return (
            <div className={styles.stringPanel}>
                <LeftPane />
                <div className={styles.stringDetail}>
                    { linkName ? <LinksTable /> : <StringsTable /> }
                    <ListView
                        className={styles.sidebarRight}
                        data={problems}
                        modifier={this.renderError}
                        keyExtractor={StringManagement.keyExtractor}
                    />
                </div>
            </div>
        );
    }
}
