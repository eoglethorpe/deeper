import CSSModules from 'react-css-modules';
import React from 'react';

import { Table } from '../../../public/components/View';
import {
    // pageTitles,
    strings,

    leadsString,
    countriesString,
    notificationStrings,
    userStrings,
    projectStrings,
    ceStrings,
    exportStrings,
    afStrings,
    loginStrings,
    apiStrings,
    entryStrings,
    fourHundredFourStrings,
    homescreenStrings,
    commonStrings,
} from '../../../common/constants';

import styles from './styles.scss';

// Merge duplicates (manually)

// *Identify duplicates on lang/en.js
// *Identify usage count on lang/en.js
// *Find entry in lang/eng (sort in order of word-count and alphabetically)
// *Identify undefined import on strings
// Identify duplicate import on strings (not important)

// Add/Delete entry in lang/en (ewan)
// Find entry in strings (no sort)
// Add/Delete entry in strings (dev)
// Add category for strings
// Browse category for strings

// Get inverted map
const invertedStrings = {};
Object.keys(strings).forEach((key) => {
    const value = strings[key].toLowerCase();
    invertedStrings[value] = key;
});

// Calculate usage count and identify bad import
const usageCountStrings = {};
Object.keys(strings).forEach((key) => {
    usageCountStrings[key] = 0;
});
const pageStrings = [
    leadsString,
    countriesString,
    notificationStrings,
    userStrings,
    projectStrings,
    ceStrings,
    exportStrings,
    afStrings,
    loginStrings,
    apiStrings,
    entryStrings,
    fourHundredFourStrings,
    homescreenStrings,
    commonStrings,
];
pageStrings.forEach((pageString) => {
    Object.keys(pageString).forEach((pageStringKey) => {
        const value = pageString[pageStringKey];
        if (!value) {
            console.warn('Undefined for ', pageStringKey);
            return;
        }
        const keyFromInvertedStrings = invertedStrings[value.toLowerCase()];
        if (keyFromInvertedStrings) {
            usageCountStrings[keyFromInvertedStrings] += 1;
        }
    });
});

// Get array of strings
const stringArrayForDisplay = Object.keys(strings)
    .reduce(
        (acc, id) => acc.concat({ id, value: strings[id] }),
        [],
    )
    .map(({ id, value }) => ({
        id,
        value,
        usageCount: usageCountStrings[id],
    }));
    /*
    .filter(({ usageCount }) => (
        usageCount > 0
    ));
    */

const propTypes = {
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class Ary extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'id',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.id.localeCompare(b.id),
            },
            {
                key: 'value',
                label: 'String',
                order: 2,
                sortable: true,
                comparator: (a, b) => (
                    (a.value.split(' ').length - b.value.split(' ').length) ||
                    a.value.localeCompare(b.value)
                ),
            },
            {
                key: 'usageCount',
                label: 'Usage Count',
                order: 3,
                sortable: true,
                comparator: (a, b) => a.usageCount - b.usageCount,
            },
        ];
        this.defaultSort = {
            key: 'usageCount',
            order: 'dsc',
        };
    }

    keyExtractor = e => e.id;

    render() {
        // { pageTitles.ary }
        return (
            <div>
                <Table
                    data={stringArrayForDisplay}
                    headers={this.headers}
                    keyExtractor={this.keyExtractor}
                    defaultSort={this.defaultSort}
                />
            </div>
        );
    }
}
