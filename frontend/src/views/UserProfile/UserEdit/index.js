/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author thenav56 <navinayer56@gmail.com>
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { InternalGallery } from '../../../components/DeepGallery';

import Faram, { requiredCondition } from '../../../vendor/react-store/components/Input/Faram';
import NonFieldErrors from '../../../vendor/react-store/components/Input/NonFieldErrors';
import ImageInput from '../../../vendor/react-store/components/Input/FileInput/ImageInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import HiddenInput from '../../../vendor/react-store/components/Input/HiddenInput';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';

import { setUserInformationAction } from '../../../redux';
import _ts from '../../../ts';
import notify from '../../../notify';

import UserPatchRequest from '../requests/UserPatchRequest';
import UserImageUploadRequest from '../requests/UserImageUploadRequest';
import styles from './styles.scss';

const propTypes = {
    userId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    handleModalClose: PropTypes.func.isRequired,
    setUserInformation: PropTypes.func.isRequired,
    userInformation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    setUserInformation: params => dispatch(setUserInformationAction(params)),
});

@connect(undefined, mapDispatchToProps)
export default class UserEdit extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: this.props.userInformation,
            pending: false,
            pristine: false,
            showGalleryImage: true,
        };

        this.schema = {
            fields: {
                firstName: [requiredCondition],
                lastName: [requiredCondition],
                organization: [requiredCondition],
                displayPicture: [],
            },
        };
    }

    componentWillUnmount() {
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }
        if (this.userImageUploader) {
            this.userImageUploader.stop();
        }
    }

    startRequestForUserPatch = (userId, values) => {
        if (this.userPatchRequest) {
            this.userPatchRequest.stop();
        }
        const userPatchRequest = new UserPatchRequest({
            setUserInformation: this.props.setUserInformation,
            handleModalClose: this.props.handleModalClose,
            setState: v => this.setState(v),
        });
        this.userPatchRequest = userPatchRequest.create(userId, values);
        this.userPatchRequest.start();
    }

    startRequestForUserImageUpload = (file) => {
        if (this.userImageUploader) {
            this.userImageUploader.stop();
        }
        const userImageUploader = new UserImageUploadRequest({
            handleImageUploadSuccess: this.handleImageUploadSuccess,
            setState: v => this.setState(v),
        });
        this.userImageUploader = userImageUploader.create(file);
        this.userImageUploader.start();
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
        const userId = this.props.userId;
        this.startRequestForUserPatch(userId, values);
    };

    // BUTTONS
    handleFaramClose = () => {
        this.props.handleModalClose();
    }

    // Image Input Change
    handleImageInputChange = (files, { invalidFiles }) => {
        if (invalidFiles > 0) {
            notify.send({
                title: _ts('notification', 'fileSelection'),
                type: notify.type.WARNING,
                message: _ts('notification', 'invalidFileSelection'),
                duration: notify.duration.SLOW,
            });
        }

        if (files.length <= 0) {
            console.warn('No files selected');
            return;
        }

        const file = files[0];
        this.startRequestForUserImageUpload(file);
    }

    handleImageUploadSuccess = (displayPicture) => {
        this.setState({
            faramValues: { ...this.state.faramValues, displayPicture },
            pristine: true,
            pending: false,
        });
    }

    render() {
        const {
            faramValues,
            faramErrors,
            pending,
            pristine,
            showGalleryImage,
        } = this.state;

        return (
            <Faram
                className={styles.userProfileEditForm}
                onChange={this.handleFaramChange}
                onValidationSuccess={this.handleFaramValidationSuccess}
                onValidationFailure={this.handleFaramValidationFailure}
                schema={this.schema}
                value={faramValues}
                error={faramErrors}
                disabled={pending}
            >
                { pending && <LoadingAnimation /> }
                <NonFieldErrors faramElement />
                <HiddenInput faramElementName="displayPicture" />
                {
                    showGalleryImage && faramValues.displayPicture && (
                        <InternalGallery
                            className={styles.galleryImage}
                            galleryId={faramValues.displayPicture}
                        />
                    )
                }
                <ImageInput
                    className={`${styles.galleryImageSelect} ${styles.displayPicture}`}
                    showPreview={!showGalleryImage}
                    showStatus={false}
                    onChange={this.handleImageInputChange}
                    accept="image/png, image/jpeg, image/fig, image/gif"
                />
                <TextInput
                    label={_ts('user', 'firstNameLabel')}
                    faramElementName="firstName"
                    placeholder={_ts('user', 'firstNamePlaceholder')}
                    autoFocus
                />
                <TextInput
                    label={_ts('user', 'lastNameLabel')}
                    faramElementName="lastName"
                    placeholder={_ts('user', 'lastNamePlaceholder')}
                />
                <TextInput
                    label={_ts('user', 'organizationLabel')}
                    faramElementName="organization"
                    placeholder={_ts('user', 'organizationPlaceholder')}
                />
                <div className={styles.actionButtons}>
                    <DangerButton onClick={this.handleFaramClose}>
                        {_ts('user', 'modalCancel')}
                    </DangerButton>
                    <PrimaryButton
                        disabled={pending || !pristine}
                        type="submit"
                    >
                        {_ts('user', 'modalSave')}
                    </PrimaryButton>
                </div>
            </Faram>
        );
    }
}
