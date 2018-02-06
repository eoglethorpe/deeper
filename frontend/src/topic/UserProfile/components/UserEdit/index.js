/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author thenav56 <navinayer56@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import DeepGallery from '../../../../common/components/DeepGallery';

import {
    Form,
    NonFieldErrors,
    ImageInput,
    TextInput,
    HiddenInput,
    requiredCondition,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    LoadingAnimation,
} from '../../../../public/components/View';

import { FgRestBuilder } from '../../../../public/utils/rest';
import { UploadBuilder } from '../../../../public/utils/upload';

import schema from '../../../../common/schema';
import {
    transformResponseErrorToFormError,
    createParamsForFileUpload,
    createParamsForUserPatch,
    createUrlForUserPatch,
    urlForUpload,
} from '../../../../common/rest';
import {
    setUserInformationAction,
    notificationStringsSelector,
    userStringsSelector,
} from '../../../../common/redux';
import notify from '../../../../common/notify';

import styles from './styles.scss';

const propTypes = {
    userId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    handleModalClose: PropTypes.func.isRequired,
    setUserInformation: PropTypes.func.isRequired,
    userInformation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    notificationStrings: PropTypes.func.isRequired,
    userStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    notificationStrings: notificationStringsSelector(state),
    userStrings: userStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserInformation: params => dispatch(setUserInformationAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class UserEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: this.props.userInformation,
            pending: false,
            pristine: false,
            showGalleryImage: true,
        };

        this.elements = [
            'firstName',
            'lastName',
            'organization',
            'displayPicture',
        ];

        this.validations = {
            firstName: [requiredCondition],
            lastName: [requiredCondition],
            organization: [requiredCondition],
            displayPicture: [],
        };
    }

    componentWillUnmount() {
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }
        if (this.uploader) {
            this.uploader.stop();
        }
    }

    createRequestForUserPatch = (userId, { firstName, lastName, organization, displayPicture }) => {
        const urlForUser = createUrlForUserPatch(userId);
        const userPatchRequest = new FgRestBuilder()
            .url(urlForUser)
            .params(
                () => createParamsForUserPatch({
                    firstName, lastName, organization, displayPicture,
                }),
            )
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'userPatchResponse');
                    this.props.setUserInformation({
                        userId,
                        information: response,
                    });
                    notify.send({
                        title: this.props.notificationStrings('userProfileEdit'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('userEditSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('userProfileEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userEditFailure'),
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
                    title: this.props.notificationStrings('userProfileEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userEditFatal'),
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    // FIXME: use strings
                    formErrors: ['Error while trying to save user.'],
                });
            })
            .build();
        return userPatchRequest;
    }

    // FORM RELATED

    changeCallback = (values, { formErrors, formFieldErrors }) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
            pristine: true,
        });
    };

    failureCallback = ({ formErrors, formFieldErrors }) => {
        this.setState({
            formFieldErrors: { ...this.state.formFieldErrors, ...formFieldErrors },
            formErrors,
        });
    };

    successCallback = (values) => {
        // Stop old patch request
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }

        const userId = this.props.userId;
        // Create new patch request and start it
        this.userPatchRequest = this.createRequestForUserPatch(userId, values);
        this.userPatchRequest.start();
    };

    // BUTTONS
    handleFormClose = () => {
        this.props.handleModalClose();
    }

    // Image Input Change
    handleImageInputChange = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            notify.send({
                title: this.props.notificationStrings('fileSelection'),
                type: notify.type.WARNING,
                message: this.props.notificationStrings('invalidFileSelection'),
                duration: notify.duration.SLOW,
            });
        }

        if (files.length <= 0) {
            console.warn('No files selected');
            return;
        }

        const file = files[0];

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload({ is_public: true }))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                this.setState({
                    formValues: { ...this.state.formValues, displayPicture: response.id },
                    pristine: true,
                    pending: false,
                });
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: this.props.notificationStrings('userProfileEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userEditImageUploadFailure'),
                    duration: notify.duration.SLOW,
                });
            })
            .fatal((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: this.props.notificationStrings('userProfileEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('userEditImageUploadFailure'),
                    duration: notify.duration.SLOW,
                });
            })
            .progress((progress) => {
                console.warn(progress);
            })
            .build();
        this.uploader.start();
    }

    render() {
        const {
            formValues,
            formErrors = [],
            formFieldErrors,
            pending,
            pristine,
            showGalleryImage,
        } = this.state;

        return (
            <Form
                styleName="user-profile-edit-form"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validations={this.validations}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors errors={formErrors} />
                {/*
                    TODO: Pass image src to ImageInput using advanced File Component
                */}
                <HiddenInput
                    formname="displayPicture"
                    value={formValues.displayPicture}
                    error={formFieldErrors.displayPicture}
                />
                {
                    showGalleryImage && (
                        <DeepGallery
                            styleName="gallery-image"
                            galleryId={formValues.displayPicture}
                        />
                    )
                }
                <ImageInput
                    showPreview={!showGalleryImage}
                    showStatus={false}
                    styleName="display-picture"
                    onChange={this.handleImageInputChange}
                    disabled={pending}
                    accept="image/png, image/jpeg, image/fig, image/gif"
                />
                <TextInput
                    label={this.props.userStrings('firstNameLabel')}
                    formname="firstName"
                    placeholder={this.props.userStrings('firstNamePlaceholder')}
                    value={formValues.firstName}
                    error={formFieldErrors.firstName}
                    disabled={pending}
                    autoFocus
                />
                <TextInput
                    label={this.props.userStrings('lastNameLabel')}
                    formname="lastName"
                    placeholder={this.props.userStrings('lastNamePlaceholder')}
                    value={formValues.lastName}
                    error={formFieldErrors.lastName}
                    disabled={pending}
                />
                <TextInput
                    label={this.props.userStrings('organizationLabel')}
                    formname="organization"
                    placeholder={this.props.userStrings('organizationPlaceholder')}
                    value={formValues.organization}
                    error={formFieldErrors.organization}
                    disabled={pending}
                />
                <div styleName="action-buttons">
                    <DangerButton
                        onClick={this.handleFormClose}
                        type="button"
                        disabled={pending}
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
