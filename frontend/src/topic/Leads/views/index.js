import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Table from '../../../public/components/Table';
import { pageTitles } from '../../../common/utils/labels';
import { PrimaryButton } from '../../../public/components/Button';
import styles from './styles.scss';

const mapStateToProps = state => ({
    state,
});

const mapDispatchToProps = dispatch => ({
    dispatch,
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Leads extends React.PureComponent {
    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'createdOn',
                label: 'Created on',
                order: 1,
            },
            {
                key: 'createdBy',
                label: 'Created by',
                order: 2,
            },
            {
                key: 'title',
                label: 'Title',
                order: 3,
            },
            {
                key: 'published',
                label: 'Published',
                order: 4,
            },
            {
                key: 'confidentiality',
                label: 'Confidentiality',
                order: 5,
            },
            {
                key: 'source',
                label: 'Source',
                order: 6,
            },
            {
                key: 'numberOfEntries',
                label: 'No. of entries',
                order: 7,
            },
            {
                key: 'status',
                label: 'Status',
                order: 8,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 9,
            },
        ];

        this.data = [
            {
                createdOn: 17263871623,
                createdBy: 'Frozen Helium',
                title: 'Family reunification in Greece with spouse in Syria',
                published: 1230129312,
                confidentiality: 'Confidential',
                source: 'Bla bla',
                numberOfEntries: 12,
                status: 'Pending',
                actions: 'GG WP',
            },
            {
                createdOn: 78923230239,
                createdBy: 'Bibek Dahal',
                title: 'Voluntary return home and coming back to the EU',
                published: 981274203420,
                confidentiality: 'Public',
                source: 'News that moves',
                numberOfEntries: 6,
                status: 'Processed',
                actions: 'GG WP',
            },
        ];
    }

    render() {
        return (
            <div styleName="leads">
                <header styleName="header">
                    <h1>{ pageTitles.leads }</h1>
                    <PrimaryButton>Add lead</PrimaryButton>
                </header>
                <div styleName="filters">
                    Filters
                </div>
                <div styleName="table-container">
                    <Table
                        headers={this.headers}
                        data={this.data}
                    />
                </div>
                <footer styleName="footer">
                    Footer
                </footer>
            </div>
        );
    }
}
