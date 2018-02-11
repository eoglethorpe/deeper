import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    compareBoolean,
    compareStringAsNumber,
    compareStringByWordCount,
    compareString,
    compareNumber,
} from '../../../public/utils/common';
import Table from '../../../public/components/View/Table';
import {
    selectedRawStringsSelector,
    selectedViewStringsSelector,
} from '../../../common/redux';

import styles from './styles.scss';

let usedMaps = {};
try {
    /* eslint-disable global-require */
    /* eslint-disable import/no-unresolved */
    usedMaps = require('../../../usage').default;
    /* eslint-enable global-require */
    /* eslint-enable import/no-unresolved */
} catch (ex) {
    console.warn(ex);
}

// TODO:
// Identify strings to be translated
//      (change language to np, anything not set by user must be translated)

// Search
// Add/Delete entry in lang/en (ewan)
// Find entry in strings (no sort)
// Add/Delete entry in strings (dev)
// Add category for strings
// Browse category for strings

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    selectedRawStrings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selectedViewStrings: PropTypes.object.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    selectedRawStrings: selectedRawStringsSelector(state),
    selectedViewStrings: selectedViewStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Ary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const {
            selectedRawStrings: strings,
            selectedViewStrings: views,
        } = this.props;
        this.errors = [];

        // Get duplicated strings
        const duplicatedRawStrings = {};
        {
            const invertedStrings = {};
            Object.keys(strings).forEach((stringId) => {
                const value = strings[stringId].toLowerCase();
                const oldId = invertedStrings[value];
                if (oldId) {
                    // duplicated
                    duplicatedRawStrings[stringId] = oldId;
                } else {
                    invertedStrings[value] = stringId;
                }
            });
        }

        // Initialize reference count
        const stringsReferenceCount = {};
        Object.keys(strings).forEach((stringId) => {
            stringsReferenceCount[stringId] = 0;
        });
        // Calculate reference count
        Object.keys(views).forEach((viewName) => {
            const view = views[viewName];

            Object.keys(view).forEach((stringName) => {
                const stringId = view[stringName];
                const totalReferencesInCode = (usedMaps[viewName] && usedMaps[viewName][stringName])
                    ? usedMaps[viewName][stringName].length
                    : 0;

                // Identify non-referenced string in code
                if (totalReferencesInCode <= 0) {
                    this.errors.push(`WARNING: ${viewName}:${stringName} not used.`);
                }

                // Identify bad-referenced string in view
                if (stringId && strings[stringId]) {
                    stringsReferenceCount[stringId] += totalReferencesInCode;
                } else {
                    this.errors.push(`ERROR: Value not defined for ${viewName}:${stringName} id=${stringId}`);
                }
            });
        });

        // Identify bad-referenced string in code
        Object.keys(usedMaps).forEach((viewName) => {
            const view = usedMaps[viewName] || {};

            Object.keys(view).forEach((stringName) => {
                const stringId = views[viewName][stringName];
                // Identify bad-referenced string in view
                if (!stringId || !strings[stringId]) {
                    this.errors.push(`ERROR: Value not defined for ${viewName}:${stringName} id=${stringId}`);
                }
            });
        });

        // Get array of strings
        this.stringArrayForDisplay = Object.keys(strings)
            .reduce(
                (acc, id) => acc.concat({ id, value: strings[id] }),
                [],
            )
            .map(({ id, value }) => ({
                id,
                value,
                referenceCount: stringsReferenceCount[id],
                duplicated: duplicatedRawStrings[id],
            }));


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
                label: 'Reference Count',
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
    }

    keyExtractor = e => e.id;

    render() {
        return (
            <div>
                <div>
                    {
                        this.errors.map(string => (
                            <p key={string}>
                                {string}
                            </p>
                        ))
                    }
                </div>
                <Table
                    data={this.stringArrayForDisplay}
                    headers={this.headers}
                    keyExtractor={this.keyExtractor}
                    defaultSort={this.defaultSort}
                />
            </div>
        );
    }
}
