import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import schema from '../../../common/schema';
import { BgRestBuilder } from '../../../public/utils/rest';
import { Uploader } from '../../../public/utils/upload';

import {
    DangerButton,
    PrimaryButton,
} from '../../../public/components/Action';
import {
    Form,
    TextInput,
    requiredCondition,
    integerCondition,
    greaterThanOrEqualToCondition,
    NonFieldErrors,
    HiddenInput,
    FileInput,
    SelectInput,
} from '../../../public/components/Input';
import {
    LoadingAnimation,
} from '../../../public/components/View';
import DeepGallery from '../../../common/components/DeepGallery';

import {
    countriesString,
    notificationStrings,
} from '../../../common/constants';
import notify from '../../notify';


import {
    transformResponseErrorToFormError,
    createParamsForAdminLevelsForRegionPOST,
    createParamsForAdminLevelsForRegionPATCH,
    createParamsForFileUpload,
    createUrlForAdminLevel,
    urlForAdminLevels,
    urlForUpload,
} from '../../../common/rest';
import {
    addAdminLevelForRegionAction,
} from '../../../common/redux';
import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number.isRequired,
    adminLevelsOfRegion: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    adminLevelDetail: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
        level: PropTypes.number,
        nameProp: PropTypes.string,
        codeProp: PropTypes.string,
        parentNameProp: PropTypes.string,
        parentCodeProp: PropTypes.string,
        region: PropTypes.number,
        parent: PropTypes.number,
        geoShapeFile: PropTypes.number,
    }),
    onClose: PropTypes.func.isRequired,
    addAdminLevelForRegion: PropTypes.func.isRequired,
};

const defaultProps = {
    adminLevelDetail: {},
};

const mapDispatchToProps = dispatch => ({
    addAdminLevelForRegion: params => dispatch(addAdminLevelForRegionAction(params)),
});


@connect(undefined, mapDispatchToProps)
@CSSModules(styles)
export default class EditAdminLevel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: this.props.adminLevelDetail,
            pending: false,
            pristine: false,
            adminLevelsOfRegion: this.otherAdminLevels(props.adminLevelsOfRegion),
        };

        this.elements = [
            'title',
            'level',
            'nameProp',
            'codeProp',
            'parentNameProp',
            'parentCodeProp',
            'parent',
            'geoShapeFile',
        ];

        this.validations = {
            title: [requiredCondition],
            level: [requiredCondition, integerCondition, greaterThanOrEqualToCondition(0)],
            nameProp: [],
            codeProp: [],
            parentNameProp: [],
            parentCodeProp: [],
            parent: [],
            geoShapeFile: [],
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props !== nextProps) {
            this.setState({
                adminLevelsOfRegion: this.otherAdminLevels(nextProps.adminLevelsOfRegion),
            });
        }
    }

    otherAdminLevels = adminLevels => adminLevels.filter(adminLevel => (
        adminLevel.id !== this.props.adminLevelDetail.id &&
        adminLevel.parent !== this.props.adminLevelDetail.id
    ))

    createAlForRegionUpdateRequest = (data, adminLevelId) => {
        const urlForAdminLevel = createUrlForAdminLevel(adminLevelId);
        const requestForAdminLevelsUpdateForRegion = new BgRestBuilder()
            .url(urlForAdminLevel)
            .params(() => createParamsForAdminLevelsForRegionPATCH(data))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'adminLevelPatchResponse');
                    this.props.addAdminLevelForRegion({
                        adminLevel: response,
                        regionId: data.region,
                    });
                    notify.send({
                        title: notificationStrings.adminLevelEdit,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.adminLevelEditSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: notificationStrings.adminLevelEdit,
                    type: notify.type.ERROR,
                    message: notificationStrings.adminLevelEditFailure,
                    duration: notify.duration.SLOW,
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
                    title: notificationStrings.adminLevelEdit,
                    type: notify.type.ERROR,
                    message: notificationStrings.adminLevelEditFatal,
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: ['Error while trying to save admin level.'],
                });
            })
            .build();
        return requestForAdminLevelsUpdateForRegion;
    }

    createAlForRegionCreateRequest = (data) => {
        const requestForAdminLevelsCreateForRegion = new BgRestBuilder()
            .url(urlForAdminLevels)
            .params(() => createParamsForAdminLevelsForRegionPOST(data))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'adminLevelPostResponse');
                    this.props.addAdminLevelForRegion({
                        adminLevel: response,
                        regionId: data.region,
                    });
                    notify.send({
                        title: notificationStrings.adminLevelCreate,
                        type: notify.type.SUCCESS,
                        message: notificationStrings.adminLevelCreateSuccess,
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: notificationStrings.adminLevelCreate,
                    type: notify.type.ERROR,
                    message: notificationStrings.adminLevelCreateFailure,
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
                    title: notificationStrings.adminLevelCreate,
                    type: notify.type.ERROR,
                    message: notificationStrings.adminLevelCreateFatal,
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    formErrors: ['Error while trying to create admin level.'],
                });
            })
            .build();
        return requestForAdminLevelsCreateForRegion;
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
        if (this.requestForAlForRegion) {
            this.requestForAlForRegion.stop();
        }

        const countryId = this.props.countryId || this.props.adminLevelDetail.region;
        const adminLevelId = this.props.adminLevelDetail.id;

        if (adminLevelId) {
            // UPDATE
            this.requestForAlForRegion = this.createAlForRegionUpdateRequest(
                { ...values, region: countryId }, adminLevelId);
        } else {
            // CREATE
            this.requestForAlForRegion = this.createAlForRegionCreateRequest(
                { ...values, region: countryId });
        }
        this.requestForAlForRegion.start();
    };

    handleGeoFileInputChange = (files) => {
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
                formValues: { ...this.state.formValues, geoShapeFile: response.id },
                pristine: true,
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

    keySelector = row => row.id
    labelSelector = row => row.title

    render() {
        const { onClose } = this.props;
        const {
            formFieldErrors,
            formErrors,
            formValues,
            pending,
            pristine,
            adminLevelsOfRegion,
        } = this.state;

        return (
            <div styleName="form-container">
                <Form
                    styleName="edit-admin-level-form"
                    changeCallback={this.changeCallback}
                    failureCallback={this.failureCallback}
                    successCallback={this.successCallback}
                    elements={this.elements}
                    validations={this.validations}
                >
                    {
                        pending && <LoadingAnimation />
                    }
                    <NonFieldErrors errors={formErrors} />
                    <div
                        styleName="admin-level-details"
                    >
                        <TextInput
                            value={`${formValues.level}`}
                            formname="level"
                            label={countriesString.adminLevelLabel}
                            placeholder={countriesString.adminLevelPlaceholder}
                            styleName="text-input"
                            type="number"
                            error={formFieldErrors.level}
                            disabled={pending}
                        />
                        <TextInput
                            value={formValues.title}
                            formname="title"
                            label={countriesString.adminLevelNameLabel}
                            placeholder={countriesString.adminLevelNamePlaceholder}
                            styleName="text-input"
                            error={formFieldErrors.title}
                            disabled={pending}
                        />
                        <TextInput
                            value={formValues.nameProp || undefined}
                            formname="nameProp"
                            label={countriesString.namePropertyLabel}
                            placeholder={countriesString.namePropertyPlaceholder}
                            styleName="text-input"
                            error={formFieldErrors.nameProp}
                            disabled={pending}
                        />
                        <TextInput
                            value={formValues.codeProp || undefined}
                            formname="codeProp"
                            label={countriesString.pcodePropertyLabel}
                            placeholder={countriesString.pcodePropertyPlaceholder}
                            styleName="text-input"
                            error={formFieldErrors.codeProp}
                            disabled={pending}
                        />
                        <TextInput
                            value={formValues.parentNameProp || undefined}
                            formname="parentNameProp"
                            label={countriesString.parentNamePropLabel}
                            placeholder={countriesString.parentNamePropPlaceholder}
                            styleName="text-input"
                            error={formFieldErrors.parentNameProp}
                            disabled={pending}
                        />
                        <TextInput
                            value={formValues.parentCodeProp || undefined}
                            formname="parentCodeProp"
                            label={countriesString.parentCodePropLabel}
                            placeholder={countriesString.parentCodePropPlaceholder}
                            styleName="text-input"
                            error={formFieldErrors.parentCodeProp}
                            disabled={pending}
                        />
                        <SelectInput
                            keySelector={this.keySelector}
                            labelSelector={this.labelSelector}
                            options={adminLevelsOfRegion}
                            optionsIdentifier="select-input-inside-modal"
                            showHintAndError={false}
                            value={formValues.parent || undefined}
                            formname="parent"
                            label={countriesString.parentAdminLevelLabel}
                            placeholder={countriesString.parentAdminLevelPlaceholder}
                            styleName="text-input"
                            error={formFieldErrors.parent}
                            disabled={pending}
                        />
                        <FileInput
                            // TODO: only shape files
                            styleName="geo-file"
                            onChange={this.handleGeoFileInputChange}
                            error={formFieldErrors.geoShapeFile}
                            disabled={pending}
                        >
                            {formValues.geoShapeFile ? 'GEO Shape File: ' : 'Load GEO Shape File'}
                            <DeepGallery onlyFileName galleryId={formValues.geoShapeFile} />
                        </FileInput>
                        <HiddenInput
                            value={formValues.geoShapeFile || undefined}
                            formname="geoShapeFile"
                        />
                    </div>
                    <div styleName="action-buttons">
                        <DangerButton
                            disabled={pending}
                            onClick={onClose}
                            type="button"
                        >
                            {countriesString.cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton
                            styleName="save-btn"
                            disabled={pending || !pristine}
                        >
                            {countriesString.saveChangesButtonLabel}
                        </PrimaryButton>
                    </div>
                </Form>
            </div>
        );
    }
}
