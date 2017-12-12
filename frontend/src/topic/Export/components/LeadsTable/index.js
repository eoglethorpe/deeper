import React from 'react';
import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';

import styles from './styles.scss';
import {
    Table,
    FormattedDate,
} from '../../../../public/components/View';
import {
    TransparentButton,
} from '../../../../public/components/Action';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

@CSSModules(styles, { allowMultiple: true })
export default class FilterSection extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.data = [
            {
                id: 1,
                title: 'Power price hike likely this month | Dhaka Tribune',
                publishedOn: 125412312,
            },
            {
                id: 2,
                title: 'Hill cutting rampant in Khagrachhari | Dhaka Tribune',
                publishedOn: 525412312,
            },
            {
                id: 3,
                title: 'Power price hike likely this month | Dhaka Tribune',
                publishedOn: 125412312,
            },
            {
                id: 4,
                title: 'Hill cutting rampant in Khagrachhari | Dhaka Tribune',
                publishedOn: 525412312,
            },
            {
                id: 5,
                title: 'Power price hike likely this month | Dhaka Tribune',
                publishedOn: 125412312,
            },
            {
                id: 6,
                title: 'Hill cutting rampant in Khagrachhari | Dhaka Tribune',
                publishedOn: 525412312,
            },
            {
                id: 7,
                title: 'Power price hike likely this month | Dhaka Tribune',
                publishedOn: 125412312,
            },
            {
                id: 8,
                title: 'Hill cutting rampant in Khagrachhari | Dhaka Tribune',
                publishedOn: 525412312,
            },
            {
                id: 9,
                title: 'Power price hike likely this month | Dhaka Tribune',
                publishedOn: 125412312,
            },
        ];
        this.leadsHeaders = [
            {
                key: 'title',
                label: 'Title',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'publishedOn',
                label: 'Created On',
                order: 2,
                sortable: true,
                comparator: (a, b) => a.publishedOn - b.publishedOn,
                modifier: row => <FormattedDate date={row.publishedOn} mode="dd-MM-yyyy" />,

            },
            {
                key: 'actions',
                label: 'Actions',
                order: 3,
                modifier: row => (
                    <div className="actions">
                        <TransparentButton
                            className="select-btn"
                            onClick={() => this.handleLeadsSelect(row)}
                            disabled
                        >
                            <i className="ion-checkmark" />
                        </TransparentButton>
                    </div>
                ),
            },
        ];
    }

    handleLeadsSelect = (row) => {
        console.log(row);
    };

    render() {
        return (
            <div
                className={this.props.className}
                styleName="leads-overview"
            >
                <div styleName="leads-table">
                    <Table
                        data={this.data}
                        headers={this.leadsHeaders}
                        keyExtractor={rowData => rowData.id}
                    />
                </div>
            </div>
        );
    }
}
