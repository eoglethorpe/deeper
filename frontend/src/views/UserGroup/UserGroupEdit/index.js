/**
 * @author thenav56 <navinayer56@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import Form, { requiredCondition } from '../../../vendor/react-store/components/Input/Form';
import NonFieldErrors from '../../../vendor/react-store/components/Input/NonFieldErrors';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import TextArea from '../../../vendor/react-store/components/Input/TextArea';

import schema from '../../../schema';
import {
    transformResponseErrorToFormError,
    createParamsForUserGroupsPatch,
    createUrlForUserGroup,
} from '../../../rest';
import {
    setUserGroupAction,
    notificationStringsSelector,
    userStringsSelector,
} from '../../../redux';
import notify from '../../../notify';

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

const defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    setUserGroup: params => dispatch(setUserGroupAction(params)),
});

const mapStateToProps = state => ({
    notificationStrings: notificationStringsSelector(state),
    userStrings: userStringsSelector(state),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserGroupEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: {},
            formFieldErrors: {},
            formValues: {
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

    createRequestForUserGroupPatch = (userGroupId, { title, description }) => {
        const urlForUserGroup = createUrlForUserGroup(userGroupId);
        const userGroupCreateRequest = new FgRestBuilder()
            .url(urlForUserGroup)
            .params(() => createParamsForUserGroupsPatch({ title, description }))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userGroupCreateResponse');
                    this.props.setUserGroup({
                        userGroup: response,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userGroupEdit'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userGroupEditSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('userGroupEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userGroupEditFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.notificationStrings('userGroupEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userGroupEditFatal'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    // FIXME: use strings
                    formErrors: { errors: ['Error while trying to save user group.'] },
                });
            })
            .build();
        return userGroupCreateRequest;
    }

    // FORM RELATED

    changeCallback = (values, formFieldErrors, formErrors) => {
        this.setState({
            formValues: values,
            formFieldErrors,
            formErrors,
            pristine: true,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        this.setState({
            formFieldErrors,
            formErrors,
        });
    };

    successCallback = (values) => {
        if (this.userGroupCreateRequest) {
            this.userGroupCreateRequest.stop();
        }

        this.userGroupCreateRequest = this.createRequestForUserGroupPatch(
            this.props.userGroup.id,
            values,
        );
        this.userGroupCreateRequest.start();
    };

    // BUTTONS
    handleFormClose = () => {
        this.props.handleModalClose();
    }

    render() {
        const {
            formValues,
            formErrors,
            formFieldErrors,
            pending,
            pristine,
        } = this.state;

        return (
            <Form
                className={styles.userGroupEditForm}
                schema={this.schema}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors formerror="" />
                <TextInput
                    label={this.props.userStrings('addUserGroupModalLabel')}
                    formname="title"
                    placeholder={this.props.userStrings('addUserGroupModalPlaceholder')}
                    autoFocus
                />
                <TextArea
                    label={this.props.userStrings('userGroupModalDescriptionLabel')}
                    formname="description"
                    className={styles.description}
                    placeholder={this.props.userStrings('addUserGroupModalPlaceholder')}
                    rows={3}
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        type="button"
                        onClick={this.handleFormClose}
                    >
                        {this.props.userStrings('modalCancel')}
                    </DangerButton>
                    <PrimaryButton disabled={pending || !pristine} >
                        {this.props.userStrings('modalSave')}
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
