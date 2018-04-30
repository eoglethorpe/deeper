import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import Faram, {
    requiredCondition,
    urlCondition,
} from '../../../../vendor/react-store/components/Input/Faram';
import {
    compareString,
    compareDate,
} from '../../../../vendor/react-store/utils/common';
import update from '../../../../vendor/react-store/utils/immutable-update';
import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import TabularSelectInput from '../../../../vendor/react-store/components/Input/TabularSelectInput';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import List from '../../../../vendor/react-store/components/View/List';
import FormattedDate from '../../../../vendor/react-store/components/View/FormattedDate';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import SuccessButton from '../../../../vendor/react-store/components/Action/Button/SuccessButton';

import ConnectorPatchRequest from '../../requests/ConnectorPatchRequest';
import ConnectorDetailsGetRequest from '../../requests/ConnectorDetailsGetRequest';
import UserListGetRequest from '../../requests/UserListGetRequest';

import {
    connectorDetailsSelector,
    connectorStringsSelector,
    connectorSourceSelector,
    notificationStringsSelector,
    usersInformationListSelector,

    setUsersInformationAction,
    changeUserConnectorDetailsAction,
    setErrorUserConnectorDetailsAction,
    setUserConnectorDetailsAction,
} from '../../../../redux';

import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    connectorId: PropTypes.number,
    connectorStrings: PropTypes.func.isRequired,
    connectorDetails: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    connectorSource: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    users: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    changeUserConnectorDetails: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    setErrorUserConnectorDetails: PropTypes.func.isRequired,
    setUserConnectorDetails: PropTypes.func.isRequired,
    setUsers: PropTypes.func.isRequired,
};

const defaultProps = {
    connectorDetails: {},
    connectorSource: {},
    connectorId: undefined,
};

const mapStateToProps = state => ({
    connectorDetails: connectorDetailsSelector(state),
    connectorStrings: connectorStringsSelector(state),
    users: usersInformationListSelector(state),
    connectorSource: connectorSourceSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUsers: params => dispatch(setUsersInformationAction(params)),
    changeUserConnectorDetails: params => dispatch(changeUserConnectorDetailsAction(params)),
    setErrorUserConnectorDetails: params => dispatch(setErrorUserConnectorDetailsAction(params)),
    setUserConnectorDetails: params => dispatch(setUserConnectorDetailsAction(params)),
});

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
export default class ConnectorDetailsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static keySelector = s => s.key;
    static labelSelector = s => s.title;
    static userOptionLabelSelector = (d = {}) => d.displayName;
    static userOptionKeySelector = (d = {}) => d.user;


    constructor(props) {
        super(props);

        this.state = {
            userDataLoading: false,
            connectorDataLoading: false,
            pending: false,
            schema: this.createSchema(props),
        };

        const { faramValues = {} } = this.props.connectorDetails;

        this.usersHeader = [
            {
                key: 'displayName',
                label: this.props.connectorStrings('tableHeaderName'),
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.displayName, b.displayName),
            },
            {
                key: 'email',
                label: this.props.connectorStrings('tableHeaderEmail'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.email, b.email),
            },
            {
                key: 'role',
                label: this.props.connectorStrings('tableHeaderRights'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.role, b.role),
            },
            {
                key: 'addedAt',
                label: this.props.connectorStrings('tableHeaderJoinedAt'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.addedAt, b.addedAt),
                modifier: row => (
                    <FormattedDate date={row.addedAt} mode="dd-MM-yyyy hh:mm" />
                ),
            },
            {
                key: 'actions',
                label: this.props.connectorStrings('tableHeaderActions'),
                order: 5,
                modifier: (row) => {
                    const isAdmin = row.role === 'admin';
                    return (
                        <Fragment>
                            <PrimaryButton
                                smallVerticalPadding
                                key="role-change"
                                title={
                                    isAdmin
                                        ? this.props.connectorStrings('revokeAdminRightsTitle')
                                        : this.props.connectorStrings('grantAdminRightsTitle')
                                }
                                onClick={() => this.handleToggleUserRoleClick(row)}
                                iconName={isAdmin ? iconNames.locked : iconNames.person}
                                transparent
                            />
                            <DangerButton
                                smallVerticalPadding
                                key="delete-member"
                                title={this.props.connectorStrings('deleteMemberLinkTitle')}
                                onClick={() => this.handleDeleteUserClick(row)}
                                iconName={iconNames.delete}
                                transparent
                            />
                        </Fragment>
                    );
                },
            },
        ];
        this.usersOptions = this.getOptionsForUser(this.props.users, faramValues.users);
    }

    componentWillMount() {
        this.startUsersListGetRequest();
    }

    componentWillReceiveProps(nextProps) {
        const {
            connectorSource: newConnectorSource,
            connectorDetails: newConnectorDetails,
            users: newUsers,
        } = nextProps;
        const {
            connectorSource: oldConnectorSource,
            connectorDetails: oldConnectorDetails,
            users: oldUsers,
        } = this.props;
        if (oldConnectorSource !== newConnectorSource) {
            this.setState({
                schema: this.createSchema(newConnectorSource),
            });
        }

        if (newConnectorDetails !== oldConnectorDetails || newUsers !== oldUsers) {
            const { faramValues = {} } = newConnectorDetails;
            this.usersOptions = this.getOptionsForUser(newUsers, faramValues.users);
        }
    }

    componentWillUnmount() {
        if (this.requestForConnectorPatch) {
            this.requestForConnectorPatch.stop();
        }
        if (this.requestForUserList) {
            this.requestForUserList.stop();
        }
        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }
    }

    getOptionsForUser = (users, members) => {
        if (!members) {
            return emptyList;
        }

        if (!users) {
            return members;
        }

        const finalOptions = [...members];

        users.forEach((u) => {
            const memberIndex = members.findIndex(m => m.user === u.id);
            if (memberIndex === -1) {
                finalOptions.push({
                    displayName: u.displayName,
                    email: u.email,
                    role: 'normal',
                    user: u.id,
                });
            }
        });

        return finalOptions.sort((a, b) => compareString(a.displayName, b.displayName));
    }

    createSchema = (props) => {
        const { connectorSource = {} } = props;
        const schema = {
            fields: {
                title: [requiredCondition],
                params: {},
                users: [],
            },
        };
        if ((connectorSource.options || emptyList).length === 0) {
            return schema;
        }
        const paramFields = {};
        connectorSource.options.forEach((o) => {
            const validation = [requiredCondition];
            if (o.fieldType === 'url') {
                validation.push(urlCondition);
            }
            paramFields[o.key] = validation;
        });
        schema.fields.params.fields = paramFields;
        return schema;
    }

    startConnectorPatchRequest = (connectorId, connectorDetails) => {
        if (this.requestForConnectorPatch) {
            this.requestForConnectorPatch.stop();
        }
        const requestForConnectorPatch = new ConnectorPatchRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails: this.props.setUserConnectorDetails,
            notificationStrings: this.props.notificationStrings,
            connectorStrings: this.props.connectorStrings,
            connectorId: this.props.connectorId,
            setConnectorError: this.props.setErrorUserConnectorDetails,
        });

        this.requestForConnectorPatch = requestForConnectorPatch.create(
            connectorId,
            connectorDetails,
        );

        this.requestForConnectorPatch.start();
    }

    startUsersListGetRequest = () => {
        if (this.requestForUserList) {
            this.requestForUserList.stop();
        }
        const requestForUserList = new UserListGetRequest({
            setState: v => this.setState(v),
            notificationStrings: this.props.notificationStrings,
            setUsers: this.props.setUsers,
        });

        this.requestForUserList = requestForUserList.create();
        this.requestForUserList.start();
    }

    startConnectorDetailsRequest = (connectorId) => {
        if (this.requestForConnectorDetails) {
            this.requestForConnectorDetails.stop();
        }
        const requestForConnectorDetails = new ConnectorDetailsGetRequest({
            setState: v => this.setState(v),
            setUserConnectorDetails: this.props.setUserConnectorDetails,
            notificationStrings: this.props.notificationStrings,
            connectorDetails: this.props.connectorDetails,
            isBeingCancelled: true,
        });
        this.requestForConnectorDetails = requestForConnectorDetails.create(connectorId);
        this.requestForConnectorDetails.start();
    }

    handleToggleUserRoleClick = (selectedUser) => {
        const {
            faramValues,
            faramErrors,
        } = this.props.connectorDetails;

        const index = (faramValues.users || emptyList).findIndex(u => u.user === selectedUser.user);
        if (index !== -1) {
            const settings = {
                users: {
                    [index]: {
                        role: {
                            $set: selectedUser.role === 'admin' ? 'normal' : 'admin',
                        },
                    },
                },
            };

            const newFaramValues = update(faramValues, settings);
            this.props.changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId: this.props.connectorId,
            });
        }
    }

    handleDeleteUserClick = (selectedUser) => {
        const {
            faramValues,
            faramErrors,
        } = this.props.connectorDetails;

        const index = (faramValues.users || emptyList).findIndex(u => u.user === selectedUser.user);
        if (index !== -1) {
            const settings = {
                users: {
                    $splice: [[index, 1]],
                },
            };

            const newFaramValues = update(faramValues, settings);
            this.props.changeUserConnectorDetails({
                faramValues: newFaramValues,
                faramErrors,
                connectorId: this.props.connectorId,
            });
        }
    }

    handleFaramChange = (faramValues, faramErrors) => {
        console.warn(faramValues);
        this.props.changeUserConnectorDetails({
            faramValues,
            faramErrors,
            connectorId: this.props.connectorId,
        });
    };

    handleValidationFailure = (faramErrors) => {
        this.props.setErrorUserConnectorDetails({
            faramErrors,
            connectorId: this.props.connectorId,
        });
    };

    handleValidationSuccess = (connectorDetails) => {
        this.startConnectorPatchRequest(this.props.connectorId, connectorDetails);
    };

    handleFormCancel = () => {
        this.startConnectorDetailsRequest(this.props.connectorId);
    };

    renderParamInput = (key, data) => {
        if (data.fieldType === 'string' || data.fieldType === 'url') {
            return (
                <TextInput
                    key={data.key}
                    faramElementName={data.key}
                    label={data.title}
                />
            );
        }
        return null;
    }

    render() {
        const {
            schema,
            pending,
            connectorDataLoading,
            userDataLoading,
        } = this.state;

        const {
            faramValues,
            faramErrors,
            pristine,
        } = this.props.connectorDetails;

        const {
            connectorSource,
            connectorStrings,
        } = this.props;

        const {
            usersHeader,
            usersOptions,
        } = this;

        const loading = userDataLoading || connectorDataLoading || pending;

        return (
            <Faram
                className={styles.connectorDetailsForm}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleValidationFailure}
                onValidationSuccess={this.handleValidationSuccess}
                schema={schema}
                value={faramValues}
                error={faramErrors}
                disabled={loading}
            >
                { loading && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    faramElementName="title"
                    label={connectorStrings('connectorTitleLabel')}
                    placeholder="Relief Web"
                    autoFocus
                />
                <FaramGroup faramElementName="params">
                    <List
                        data={connectorSource.options}
                        modifier={this.renderParamInput}
                    />
                </FaramGroup>
                {!(userDataLoading || connectorDataLoading) &&
                    <TabularSelectInput
                        faramElementName="users"
                        options={usersOptions}
                        label={connectorStrings('connectorUsersLabel')}
                        labelSelector={ConnectorDetailsForm.userOptionLabelSelector}
                        keySelector={ConnectorDetailsForm.userOptionKeySelector}
                        tableHeaders={usersHeader}
                        hideRemoveFromListButton
                        hideSelectAllButton
                    />
                }
                <div className={styles.actionButtons}>
                    <DangerButton
                        onClick={this.handleFormCancel}
                        disabled={loading || !pristine}
                    >
                        {connectorStrings('connectorDetailCancelLabel')}
                    </DangerButton>
                    <SuccessButton
                        type="submit"
                        disabled={loading || !pristine}
                    >
                        {connectorStrings('connectorDetailSaveLabel')}
                    </SuccessButton>
                </div>
            </Faram>
        );
    }
}
