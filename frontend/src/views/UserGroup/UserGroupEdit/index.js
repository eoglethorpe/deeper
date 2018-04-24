/**
 * @author thenav56 <ayernavin@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Faram, { requiredCondition } from '../../../vendor/react-store/components/Input/Faram';
import NonFieldErrors from '../../../vendor/react-store/components/Input/NonFieldErrors';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import TextArea from '../../../vendor/react-store/components/Input/TextArea';

import {
    setUserGroupAction,
    notificationStringsSelector,
    userStringsSelector,
} from '../../../redux';

import UserGroupPatchRequest from '../requests/UserGroupPatchRequest';

import styles from './styles.scss';

const propTypes = {
    handleModalClose: PropTypes.func.isRequired,
    userGroup: PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }).isRequired,
    setUserGroup: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {};

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
});

const mapStateToProps = state => ({
    notificationStrings: notificationStringsSelector(state),
    userStrings: userStringsSelector(state),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class UserGroupEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: {
                title: props.userGroup.title,
                description: props.userGroup.description,
            },
            pending: false,
            pristine: false,
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                description: [],
            },
        };
    }

    componentWillUnmount() {
        if (this.userGroupCreateRequest) {
            this.userGroupCreateRequest.stop();
        }
    }

    startRequestForUserGroupPatch = (userGroupId, { title, description }) => {
        if (this.userGroupCreateRequest) {
            this.userGroupCreateRequest.stop();
        }
        const userGroupCreateRequest = new UserGroupPatchRequest({
            setUserGroup: this.props.setUserGroup,
            handleModalClose: this.props.handleModalClose,
            userStrings: this.props.userStrings,
            notificationStrings: this.props.notificationStrings,
            setState: v => this.setState(v),
        });
        this.userGroupCreateRequest = userGroupCreateRequest.create(userGroupId, {
            title, description,
        });
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
        this.startRequestForUserGroupPatch(
            this.props.userGroup.id,
            values,
        );
    };

    // BUTTONS
    handleFaramClose = () => {
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
                className={styles.userGroupEditForm}
                schema={this.schema}
                onChange={this.handleFaramChange}
                onValidationFailure={this.handleFaramValidationFailure}
                onValidationSuccess={this.handleFaramValidationSuccess}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElementName />
                <TextInput
                    label={this.props.userStrings('addUserGroupModalLabel')}
                    faramElementName="title"
                    placeholder={this.props.userStrings('addUserGroupModalPlaceholder')}
                    autoFocus
                />
                <TextArea
                    label={this.props.userStrings('userGroupModalDescriptionLabel')}
                    faramElementName="description"
                    className={styles.description}
                    placeholder={this.props.userStrings('addUserGroupModalPlaceholder')}
                    rows={3}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleFaramClose}>
                        {this.props.userStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {this.props.userStrings('modalSave')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
