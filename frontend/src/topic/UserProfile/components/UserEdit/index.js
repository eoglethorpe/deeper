/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 * @co-author thenav56 <navinayer56@gmail.com>
 */

import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import GalleryImage from '../../../../common/components/GalleryImage';

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
import { Uploader } from '../../../../public/utils/upload';

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
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    userId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    handleModalClose: PropTypes.func.isRequired,
    setUserInformation: PropTypes.func.isRequired,
    userInformation: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
};

const mapDispatchToProps = dispatch => ({
    setUserInformation: params => dispatch(setUserInformationAction(params)),
});

@connect(undefined, mapDispatchToProps)
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
            stale: false,
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
            this.uploader.abort();
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
                    this.props.handleModalClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.info('FAILURE:', response);
                const {
                    formFieldErrors,
                    formErrors,
                } = transformResponseErrorToFormError(response.errors);
                this.setState({
                    formFieldErrors,
                    formErrors,
                    pending: true,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
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
            stale: true,
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
    handleImageInputChange = (files) => {
        this.setState({
            pending: true,
        });

        const uploader = new Uploader(
            files[0],
            urlForUpload,
            () => createParamsForFileUpload(),
        );

        uploader.success = (response) => {
            this.setState({
                formValues: { ...this.state.formValues, displayPicture: response.id },
                stale: true,
                pending: false,
            });
        };

        uploader.failure = () => {
            this.setState({
                pending: false,
            });
        };

        uploader.onProgress = (progress) => {
            console.log(progress);
            // TODO: Add progress component
            // console.warn(`Upload Progress: ${progress}`);
        };
        this.uploader = uploader;

        this.uploader.start();
    }

    render() {
        const {
            formValues,
            formErrors = [],
            formFieldErrors,
            pending,
            stale,
            showGalleryImage,
        } = this.state;

        console.log('form values', formValues);

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
                        <GalleryImage
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
                />
                <TextInput
                    label="First Name"
                    formname="firstName"
                    placeholder="John"
                    value={formValues.firstName}
                    error={formFieldErrors.firstName}
                    disabled={pending}
                />
                <TextInput
                    label="Last Name"
                    formname="lastName"
                    placeholder="Doe"
                    value={formValues.lastName}
                    error={formFieldErrors.lastName}
                    disabled={pending}
                />
                <TextInput
                    label="Organization"
                    formname="organization"
                    placeholder="Baroque Works"
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
                        Cancel
                    </DangerButton>
                    <PrimaryButton disabled={pending || !stale} >
                        Save
                    </PrimaryButton>
                </div>
            </Form>
        );
    }
}
