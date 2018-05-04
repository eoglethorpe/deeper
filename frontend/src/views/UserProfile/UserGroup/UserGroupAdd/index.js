/**
 * @author thenav56 <navinayer56@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram, { requiredCondition } from '../../../../vendor/react-store/components/Input/Faram';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';

import {
    activeUserSelector,
    setUserGroupAction,
} from '../../../../redux';
import _ts from '../../../../ts';

import UserGroupPostRequest from '../../requests/UserGroupPostRequest';

import styles from './styles.scss';

const propTypes = {
    handleModalClose: PropTypes.func.isRequired,
    setUserGroup: PropTypes.func.isRequired,
    activeUser: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

const mapStateToProps = state => ({
    activeUser: activeUserSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class UserGroupAdd extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {},
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
            },
        };
    }

    componentWillUnmount() {
        if (this.userGroupCreateRequest) {
            this.userGroupCreateRequest.stop();
        }
    }

    startRequestForUserGroupCreate = (values, userId) => {
        if (this.userGroupCreateRequest) {
            this.userGroupCreateRequest.stop();
        }
        const userGroupCreateRequest = new UserGroupPostRequest({
            setUserGroup: this.props.setUserGroup,
            handleModalClose: this.props.handleModalClose,
            setState: v => this.setState(v),
        });
        this.userGroupCreateRequest = userGroupCreateRequest.create(values, userId);
        this.userGroupCreateRequest.start();
    }

    handleFaramChange = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: true,
        });
    };

    handleFaramValidationFailure = (faramErrors) => {
        this.setState({ faramErrors });
    };

    handleFaramValidationSuccess = (values) => {
        const { userId } = this.props.activeUser;
        this.startRequestForUserGroupCreate(values, userId);
    };

    // BUTTONS
    handleFormClose = () => {
        this.props.handleModalClose();
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pending,
            pristine,
        } = this.state;

        return (
            <Faram
                className={styles.userGroupAddForm}

                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}

                schema={this.schema}
                value={faramValues}
                errors={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <TextInput
                    label={_ts('user', 'addUserGroupModalLabel')}
                    faramElementName="title"
                    placeholder={_ts('user', 'addUserGroupModalPlaceholder')}
                    autoFocus
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleFormClose}>
                        {_ts('user', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('user', 'modalCreate')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
