import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { BgRestBuilder } from '../../vendor/react-store/utils/rest';
import { UploadBuilder } from '../../vendor/react-store/utils/upload';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import HiddenInput from '../../vendor/react-store/components/Input/HiddenInput';
import FileInput from '../../vendor/react-store/components/Input/FileInput';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import Faram, {
    greaterThanOrEqualToCondition,
    requiredCondition,
    integerCondition,
} from '../../vendor/react-store/components/Input/Faram';

import { InternalGallery } from '../../components/DeepGallery';
import {
    alterResponseErrorToFaramError,
    createParamsForAdminLevelsForRegionPOST,
    createParamsForAdminLevelsForRegionPATCH,
    createParamsForFileUpload,
    createUrlForAdminLevel,
    urlForAdminLevels,
    urlForUpload,
} from '../../rest';
import {
    addAdminLevelForRegionAction,
    countriesStringsSelector,
    notificationStringsSelector,
} from '../../redux';
import schema from '../../schema';
import { iconNames } from '../../constants';

import notify from '../../notify';
import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number,
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
    countryId: undefined,
};

const mapStateToProps = state => ({
    countriesStrings: countriesStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    addAdminLevelForRegion: params => dispatch(addAdminLevelForRegionAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class EditAdminLevel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            faramErrors: {},
            faramValues: this.props.adminLevelDetail,
            pending: false,
            pristine: true,
            adminLevelsOfRegion: this.calculateOtherAdminLevels(props.adminLevelsOfRegion),
        };

        this.schema = {
            fields: {
                title: [requiredCondition],
                level: [requiredCondition, integerCondition, greaterThanOrEqualToCondition(0)],
                nameProp: [],
                codeProp: [],
                parentNameProp: [],
                parentCodeProp: [],
                parent: [],
                geoShapeFile: [],
            },
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
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                this.setState({
                    // FIXME: use strings
                    faramErrors: { $internal: ['Error while trying to save admin level.'] },
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
                // FIXME: no need to notify with farams
                notify.send({
                    title: this.props.notificationStrings('adminLevelCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelCreateFailure'),
                    duration: notify.duration.MEDIUM,
                });
                const faramErrors = alterResponseErrorToFaramError(response.errors);
                this.setState({ faramErrors });
            })
            .fatal(() => {
                // FIXME: no need to notify with farams
                notify.send({
                    title: this.props.notificationStrings('adminLevelCreate'),
                    type: notify.type.ERROR,
                    message: this.props.notificationStrings('adminLevelCreateFatal'),
                    duration: notify.duration.SLOW,
                });
                this.setState({
                    // FIXME: use strings
                    faramErrors: { $internal: ['Error while trying to create admin level.'] },
                });
            })
            .build();
        return requestForAdminLevelsCreateForRegion;
    }

    // FORM RELATED
    changeCallback = (faramValues, faramErrors) => {
        this.setState({
            faramValues,
            faramErrors,
            pristine: false,
        });
    };

    failureCallback = (faramErrors) => {
        this.setState({ faramErrors });
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
                { ...values, region: countryId },
                adminLevelId,
            );
        } else {
            // CREATE
            this.requestForAlForRegion = this.createAlForRegionCreateRequest(
                { ...values, region: countryId },
            );
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
                    faramValues: { ...this.state.faramValues, geoShapeFile: response.id },
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
            faramErrors,
            faramValues,
            pending,
            pristine,
            adminLevelsOfRegion,
        } = this.state;

        return (
            <div className={styles.formContainer}>
                <Faram
                    className={styles.editAdminLevelForm}
                    onChange={this.changeCallback}
                    onValidationFailure={this.failureCallback}
                    onValidationSuccess={this.successCallback}

                    schema={this.schema}
                    value={faramValues}
                    error={faramErrors}
                    disabled={pending}
                >
                    {
                        pending && <LoadingAnimation />
                    }
                    <NonFieldErrors faramElementName="" />
                    <div className={styles.adminLevelDetails} >
                        <TextInput
                            faramElementName="level"
                            label={this.props.countriesStrings('adminLevelLabel')}
                            placeholder={this.props.countriesStrings('adminLevelPlaceholder')}
                            className={styles.textInput}
                            type="number"
                            min={0}
                            autoFocus
                        />
                        <TextInput
                            faramElementName="title"
                            label={this.props.countriesStrings('adminLevelNameLabel')}
                            placeholder={this.props.countriesStrings('adminLevelNamePlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="nameProp"
                            label={this.props.countriesStrings('namePropertyLabel')}
                            placeholder={this.props.countriesStrings('namePropertyPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="codeProp"
                            label={this.props.countriesStrings('pcodePropertyLabel')}
                            placeholder={this.props.countriesStrings('pcodePropertyPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="parentNameProp"
                            label={this.props.countriesStrings('parentNamePropLabel')}
                            placeholder={this.props.countriesStrings('parentNamePropPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="parentCodeProp"
                            label={this.props.countriesStrings('parentCodePropLabel')}
                            placeholder={this.props.countriesStrings('parentCodePropPlaceholder')}
                            className={styles.textInput}
                        />
                        <SelectInput
                            keySelector={this.keySelector}
                            labelSelector={this.labelSelector}
                            options={adminLevelsOfRegion}
                            optionsIdentifier="select-input-inside-modal"
                            showHintAndError={false}
                            faramElementName="parent"
                            label={this.props.countriesStrings('parentAdminLevelLabel')}
                            placeholder={this.props.countriesStrings('parentAdminLevelPlaceholder')}
                            className={styles.selectInput}
                        />
                        <FileInput
                            className={styles.geoFile}
                            onChange={this.handleGeoFileInputChange}
                            error={faramErrors.geoShapeFile}
                            accept=".zip, .json, .geojson"
                        >
                            <span className={styles.load}>
                                <i className={iconNames.uploadFa} />
                                {this.props.countriesStrings('loadGeoShapeFile')}
                            </span>
                        </FileInput>
                        {
                            faramValues.geoShapeFile &&
                            <InternalGallery
                                onlyFileName
                                galleryId={faramValues.geoShapeFile}
                            />
                        }
                        <span
                            className={iconNames.help}
                            title={this.props.countriesStrings('geoshapeTooltip')}
                        />
                        <HiddenInput faramElementName="geoShapeFile" />
                    </div>
                    <div className={styles.actionButtons}>
                        <DangerButton onClick={onClose}>
                            {this.props.countriesStrings('cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton
                            className={styles.saveBtn}
                            type="submit"
                            disabled={pending || pristine}
                        >
                            {this.props.countriesStrings('saveChangesButtonLabel')}
                        </PrimaryButton>
                    </div>
                </Faram>
            </div>
        );
    }
}
