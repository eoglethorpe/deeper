import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';

import { reverseRoute } from '../../../../vendor/react-store/utils/common';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';

import {
    iconNames,
    pathNames,
} from '../../../../constants/';
import _ts from '../../../../ts';

import styles from './styles.scss';

const propTypes = {
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    isCurrentUserAdmin: PropTypes.bool.isRequired,

    onRemoveMember: PropTypes.func.isRequired,
    onChangeMemberRole: PropTypes.func.isRequired,
};

const defaultProps = {};

export default class ActionButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getLinks = () => {
        const {
            row,
        } = this.props;

        const userProfile = {
            pathname: reverseRoute(
                pathNames.userProfile,
                {
                    userId: row.member,
                },
            ),
        };

        return { userProfile };
    }

    renderLinkToUserProfile = () => (
        <Link
            className={styles.link}
            title={_ts('user', 'viewMemberLinkTitle')}
            to={this.getLinks().userProfile}
        >
            <i className={iconNames.openLink} />
        </Link>
    )

    render() {
        const {
            row,
            activeUser,
            isCurrentUserAdmin,
            onRemoveMember,
            onChangeMemberRole,
        } = this.props;

        const isAdmin = row.role === 'admin';
        const isCurrentUser = row.member === activeUser.userId;
        if (isCurrentUser || !isCurrentUserAdmin) {
            return this.renderLinkToUserProfile();
        }
        return (
            <Fragment>
                {
                    this.renderLinkToUserProfile()
                }
                <PrimaryButton
                    title={
                        isAdmin
                            ? _ts('user', 'revokeAdminLinkTitle')
                            : _ts('user', 'grantAdminLinkTitle')
                    }
                    onClick={() => onChangeMemberRole(row)}
                    iconName={isAdmin ? iconNames.locked : iconNames.person}
                    smallVerticalPadding
                    transparent
                />
                <DangerButton
                    title={_ts('user', 'deleteMemberLinkTitle')}
                    onClick={() => onRemoveMember(row)}
                    iconName={iconNames.delete}
                    smallVerticalPadding
                    transparent
                />
            </Fragment>
        );
    }
}
