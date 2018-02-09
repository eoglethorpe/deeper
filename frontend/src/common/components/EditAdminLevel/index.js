import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import schema from '../../../common/schema';
import { BgRestBuilder } from '../../../public/utils/rest';
import { UploadBuilder } from '../../../public/utils/upload';

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

import { iconNames } from '../../../common/constants';
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
    countriesStringsSelector,
    notificationStringsSelector,
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
    countriesStrings: PropTypes.func.isRequired,
    notificationStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    adminLevelDetail: {},
};

const mapStateToProps = state => ({
    countriesStrings: countriesStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addAdminLevelForRegion: params => dispatch(addAdminLevelForRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
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
            adminLevelsOfRegion: this.calculateOtherAdminLevels(props.adminLevelsOfRegion),
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
                adminLevelsOfRegion: this.calculateOtherAdminLevels(nextProps.adminLevelsOfRegion),
            });
        }
    }

    componentWillUnmount() {
        if (this.requestForAlForRegion) {
            this.requestForAlForRegion.stop();
        }
        if (this.uploader) {
            this.uploader.stop();
        }
    }

    keySelector = row => row.id
    labelSelector = row => row.title

    calculateOtherAdminLevels = adminLevels => adminLevels.filter(adminLevel => (
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
                        title: this.props.notificationStrings('adminLevelEdit'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('adminLevelEditSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('adminLevelEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelEditFailure'),
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
                    title: this.props.notificationStrings('adminLevelEdit'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelEditFatal'),
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
                        title: this.props.notificationStrings('adminLevelCreate'),
                        type: notify.type.SUCCESS,
                        message: this.props.notificationStrings('adminLevelCreateSuccess'),
                        duration: notify.duration.MEDIUM,
                    });
                    this.props.onClose();
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                notify.send({
                    title: this.props.notificationStrings('adminLevelCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelCreateFailure'),
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
                    title: this.props.notificationStrings('adminLevelCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelCreateFatal'),
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

    handleGeoFileInputChange = (files, { invalidFiles }) => {
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

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(files[0])
            .url(urlForUpload)
            .params(() => createParamsForFileUpload())
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                this.setState({
                    formValues: { ...this.state.formValues, geoShapeFile: response.id },
                    pristine: true,
                });
            })
            .progress((progress) => {
                console.warn(progress);
            })
            .build();
        // TODO: notify on fatal and failure
        this.uploader.start();
    }

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
                    value={formValues}
                    error={formFieldErrors}
                >
                    {
                        pending && <LoadingAnimation />
                    }
                    <NonFieldErrors errors={formErrors} />
                    <div styleName="admin-level-details" >
                        <TextInput
                            formname="level"
                            label={this.props.countriesStrings('adminLevelLabel')}
                            placeholder={this.props.countriesStrings('adminLevelPlaceholder')}
                            styleName="text-input"
                            type="number"
                            disabled={pending}
                            min={0}
                            autoFocus
                        />
                        <TextInput
                            formname="title"
                            label={this.props.countriesStrings('adminLevelNameLabel')}
                            placeholder={this.props.countriesStrings('adminLevelNamePlaceholder')}
                            styleName="text-input"
                            disabled={pending}
                        />
                        <TextInput
                            formname="nameProp"
                            label={this.props.countriesStrings('namePropertyLabel')}
                            placeholder={this.props.countriesStrings('namePropertyPlaceholder')}
                            styleName="text-input"
                            disabled={pending}
                        />
                        <TextInput
                            formname="codeProp"
                            label={this.props.countriesStrings('pcodePropertyLabel')}
                            placeholder={this.props.countriesStrings('pcodePropertyPlaceholder')}
                            styleName="text-input"
                            disabled={pending}
                        />
                        <TextInput
                            formname="parentNameProp"
                            label={this.props.countriesStrings('parentNamePropLabel')}
                            placeholder={this.props.countriesStrings('parentNamePropPlaceholder')}
                            styleName="text-input"
                            disabled={pending}
                        />
                        <TextInput
                            formname="parentCodeProp"
                            label={this.props.countriesStrings('parentCodePropLabel')}
                            placeholder={this.props.countriesStrings('parentCodePropPlaceholder')}
                            styleName="text-input"
                            disabled={pending}
                        />
                        <SelectInput
                            keySelector={this.keySelector}
                            labelSelector={this.labelSelector}
                            options={adminLevelsOfRegion}
                            optionsIdentifier="select-input-inside-modal"
                            showHintAndError={false}
                            formname="parent"
                            label={this.props.countriesStrings('parentAdminLevelLabel')}
                            placeholder={this.props.countriesStrings('parentAdminLevelPlaceholder')}
                            styleName="text-input"
                            disabled={pending}
                        />
                        <FileInput
                            styleName="geo-file"
                            onChange={this.handleGeoFileInputChange}
                            error={formFieldErrors.geoShapeFile}
                            disabled={pending}
                            accept=".zip, .json, .geojson"
                        >
                            {
                                formValues.geoShapeFile ? (
                                    <span styleName="show">
                                        <i className={iconNames.documentText} />
                                        {this.props.countriesStrings('geoShapeFile')}
                                    </span>
                                ) : (
                                    <span styleName="load">
                                        <i className={iconNames.uploadFa} />
                                        {this.props.countriesStrings('loadGeoShapeFile')}
                                    </span>
                                )
                            }
                            <DeepGallery
                                onlyFileName
                                galleryId={formValues.geoShapeFile}
                            />
                        </FileInput>
                        <HiddenInput formname="geoShapeFile" />
                    </div>
                    <div styleName="action-buttons">
                        <DangerButton
                            disabled={pending}
                            onClick={onClose}
                            type="button"
                        >
                            {this.props.countriesStrings('cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            styleName="save-btn"
                            disabled={pending || !pristine}
                        >
                            {this.props.countriesStrings('saveChangesButtonLabel')}
                        </PrimaryButton>
                    </div>
                </Form>
            </div>
        );
    }
}
