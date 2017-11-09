import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    Table,
} from '../../../../public/components/View';
import {
    TextInput,
} from '../../../../public/components/Input';
import {
    PrimaryButton,
    TransparentAccentButton,
    TransparentButton,
} from '../../../../public/components/Action';
import styles from './styles.scss';

const propTypes = {

};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class MembersTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.memberHeaders = [
            {
                key: 'name',
                label: 'Name',
                order: 1,
            },
            {
                key: 'email',
                label: 'Email',
                order: 2,
            },
            {
                key: 'rights',
                label: 'Rights',
                order: 3,
            },
            {
                key: 'joinedAt',
                label: 'Joined At',
                order: 4,
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: row => (
                    <div className="actions">
                        <TransparentButton
                            onClick={() => this.handleRemoveMemberClick(row)}
                        >
                            <i className="ion-ios-trash" />
                        </TransparentButton>
                        <TransparentButton >
                            <i className="ion-ios-locked" />
                        </TransparentButton>
                        <TransparentAccentButton >
                            <i className="ion-forward" />
                        </TransparentAccentButton>
                    </div>
                ),
            },
        ];

        this.memberData = [
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: 'Jacky',
                actions: 'Jacky',
            },
            {
                name: 'Safar',
                email: 'safar@safar.com',
                rights: 'Noob',
                joinedAt: '2010-2-1',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: 'Jacky',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: '2010-2-1',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: 'Jacky',
                actions: 'Jacky',
            },
            {
                name: 'Safar',
                email: 'safar@safar.com',
                rights: 'Noob',
                joinedAt: '2010-2-1',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: 'Jacky',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: '2010-2-1',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: 'Jacky',
                actions: 'Jacky',
            },
            {
                name: 'Safar',
                email: 'safar@safar.com',
                rights: 'Noob',
                joinedAt: '2010-2-1',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: 'Jacky',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: '2010-2-1',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: 'Jacky',
                actions: 'Jacky',
            },
            {
                name: 'Safar',
                email: 'safar@safar.com',
                rights: 'Noob',
                joinedAt: '2010-2-1',
            },
            {
                name: 'Jacky',
                email: 'jacky@jacky.com',
                rights: 'Super Admin',
                joinedAt: 'Jacky',
            },

        ];
    }

    handleRemoveMemberClick = (row) => {
        console.log(row);
    };

    render() {
        return (
            <div styleName="members">
                <div styleName="header">
                    <TextInput
                        placeholder="Search Member"
                        type="search"
                        styleName="search-input"
                        showLabel={false}
                        showHintAndError={false}
                    />
                    <div styleName="pusher" />
                    <div styleName="add-button">
                        <PrimaryButton>
                            Add New Member
                        </PrimaryButton>
                    </div>
                </div>
                <div styleName="content">
                    <Table
                        data={this.memberData}
                        headers={this.memberHeaders}
                        keyExtractor={rowData => rowData.id}
                    />
                </div>
            </div>
        );
    }
}
