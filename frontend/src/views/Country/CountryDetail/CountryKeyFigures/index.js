import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../vendor/react-store/utils/rest';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import PrimaryButton from '../../../../vendor/react-store/components/Action/Button/PrimaryButton';
import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import Form from '../../../../vendor/react-store/components/Input/Form';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';
import NonFieldErrors from '../../../../vendor/react-store/components/Input/NonFieldErrors';

import {
    transformResponseErrorToFormError,
    createParamsForRegionPatch,
    createUrlForRegion,
    createUrlForRegionWithField,
    createParamsForUser,
} from '../../../../rest';
import {
    countryDetailSelector,
    setRegionDetailsAction,
    countriesStringsSelector,
} from '../../../../redux';
import { iconNames } from '../../../../constants';
import schema from '../../../../schema';

import styles from './styles.scss';

const propTypes = {
    regionDetail: PropTypes.shape({
        id: PropTypes.number.isRequired,
        code: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        keyFigures: PropTypes.shape({}),
    }).isRequired,
    setRegionDetails: PropTypes.func.isRequired,
    countriesStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    regionDetail: countryDetailSelector(state, props),
    countriesStrings: countriesStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class CountryKeyFigures extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pristine: false,
            pending: false,
            formErrors: {},
            formFieldErrors: {},
            formValues: props.regionDetail.keyFigures || {},
            dataLoading: true,
        };

        this.schema = {
            fields: {
                index: [],
                geoRank: [],
                geoScore: [],
                geoScoreU5m: [],
                rank: [],
                u5m: [],
                numberOfRefugees: [],
                percentageUprootedPeople: [],
                geoScoreUprooted: [],
                numberIdp: [],
                numberReturnedRefugees: [],
                riskClass: [],
                hazardAndExposure: [],
                vulnerability: [],
                informRiskIndex: [],
                lackOfCopingCapacity: [],
            },
        };

        this.regionKeyFiguresRequest = this.createRegionKeyFiguresRequest(props.regionDetail.id);
    }

    componentWillMount() {
        this.regionKeyFiguresRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        this.resetForm(nextProps);
    }

    componentWillUnmount() {
        if (this.regionKeyFiguresRequest) {
            this.regionKeyFiguresRequest.stop();
        }
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
        // Stop old patch request
        if (this.regionDetailPatchRequest) {
            this.regionDetailPatchRequest.stop();
        }

        // Create new patch request
        const data = {
            keyFigures: values,
        };

        this.regionDetailPatchRequest =
            this.createRequestForRegionDetailPatch(this.props.regionDetail.id, data);
        this.regionDetailPatchRequest.start();
    };

    createRegionKeyFiguresRequest = (regionId) => {
        const urlForRegionForKeyFigures = createUrlForRegionWithField(regionId, ['key_figures']);

        const regionRequest = new FgRestBuilder()
            .url(urlForRegionForKeyFigures)
            .params(() => createParamsForUser())
            .preLoad(() => { this.setState({ dataLoading: true }); })
            .postLoad(() => { this.setState({ dataLoading: false }); })
            .success((response) => {
                try {
                    schema.validate(response, 'region');
                    this.props.setRegionDetails({
                        regionDetails: response,
                        regionId,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return regionRequest;
    }

    createRequestForRegionDetailPatch = (regionId, data) => {
        const urlForRegion = createUrlForRegion(regionId);
        const regionDetailPatchRequest = new FgRestBuilder()
            .url(urlForRegion)
            .params(() => createParamsForRegionPatch(data))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .postLoad(() => {
                this.setState({ pending: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'regionPatchResponse');
                    this.props.setRegionDetails({
                        regionDetails: response,
                        regionId,
                    });
                    this.setState({ pristine: false });
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
                    pending: false,
                });
            })
            .fatal((response) => {
                console.info('FATAL:', response);
                this.setState({
                    formErrors: { errors: ['Error while trying to save region detail.'] },
                    pending: false,
                });
            })
            .build();
        return regionDetailPatchRequest;
    }

    handleFormCancel = () => {
        // TODO: use prompt
        this.resetForm(this.props);
    }

    resetForm = (props) => {
        this.setState({
            formErrors: {},
            formFieldErrors: {},
            formValues: props.regionDetail.keyFigures || {},
            pending: false,
            pristine: false,
        });
    };

    render() {
        const {
            pristine,
            pending,
            formValues,
            formErrors,
            formFieldErrors,
            dataLoading,
        } = this.state;

        return (
            <Form
                className={styles.keyFigures}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                schema={this.schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
                disabled={pending}
            >
                { (pending || dataLoading) && <LoadingAnimation /> }
                <header className={styles.header}>
                    <NonFieldErrors formerror="" />
                    <div className={styles.actionButtons}>
                        <DangerButton
                            type="button"
                            onClick={this.handleFormCancel}
                            disabled={pending || !pristine}
                        >
                            {this.props.countriesStrings('cancelButtonLabel')}
                        </DangerButton>
                        <PrimaryButton disabled={pending || !pristine} >
                            {this.props.countriesStrings('saveChangesButtonLabel')}
                        </PrimaryButton>
                    </div>
                </header>
                <div className={styles.section}>
                    <h3>
                        {this.props.countriesStrings('humanDevelopmentIndexLabel')}
                        <a
                            href="http://www.hdr.undp.org/en/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className={`${iconNames.link} ${styles.icon}`}
                                // FIXME: use strings
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label={this.props.countriesStrings('indexLabel')}
                        className={styles.textInput}
                        type="number"
                        step="any"
                        min="0"
                        max="1"
                        formname="index"
                    />
                    <TextInput
                        label={this.props.countriesStrings('geoRankLabel')}
                        className={styles.textInput}
                        readOnly
                        formname="geoRank"
                    />
                    <TextInput
                        label={this.props.countriesStrings('geoScoreLabel')}
                        className={styles.textInput}
                        readOnly
                        formname="geoScore"
                    />
                    <TextInput
                        label={this.props.countriesStrings('rankLabel')}
                        className={styles.textInput}
                        formname="rank"
                    />
                </div>
                <div className={styles.section}>
                    <h3>
                        {this.props.countriesStrings('underFiveMortalityLabel')}
                        <a
                            href="http://www.inform-index.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className={`${iconNames.link} ${styles.icon}`}
                                // FIXME: use strings
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label={this.props.countriesStrings('u5mLabel')}
                        className={styles.textInput}
                        formname="u5m"
                        type="number"
                    />
                    <TextInput
                        label={this.props.countriesStrings('geoScoreLabel')}
                        className={styles.textInput}
                        readOnly
                        formname="geoScoreU5m"
                    />
                </div>
                <div className={styles.section}>
                    <h3>
                        {this.props.countriesStrings('uprootedPeopleLabel')}
                        <a
                            href="http://www.inform-index.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className={`${iconNames.link} ${styles.icon}`}
                                // FIXME: use strings
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label={this.props.countriesStrings('numberOfRefugeesLabel')}
                        className={styles.textInput}
                        formname="numberOfRefugees"
                    />
                    <TextInput
                        label={this.props.countriesStrings('percentageUprootedPeopleLabel')}
                        className={styles.textInput}
                        readOnly
                        formname="percentageUprootedPeople"
                    />
                    <TextInput
                        label={this.props.countriesStrings('geoScoreLabel')}
                        className={styles.textInput}
                        readOnly
                        formname="geoScoreUprooted"
                    />
                    <TextInput
                        label={this.props.countriesStrings('numberIdpLabel')}
                        className={styles.textInput}
                        formname="numberIdp"
                    />
                    <TextInput
                        label={this.props.countriesStrings('numberReturnedRefugeesLabel')}
                        className={styles.textInput}
                        formname="numberReturnedRefugees"
                    />
                </div>
                <div className={styles.section}>
                    <h3>
                        {this.props.countriesStrings('informScoreLabel')}
                        <a
                            href="http://www.hdr.undp.org/en/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className={`${iconNames.link} ${styles.icon}`}
                                // FIXME: use strings
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label={this.props.countriesStrings('riskClassLabel')}
                        className={styles.textInput}
                        formname="riskClass"
                    />
                    <TextInput
                        label={this.props.countriesStrings('informRiskIndexLabel')}
                        className={styles.textInput}
                        formname="informRiskIndex"
                    />
                    <TextInput
                        label={this.props.countriesStrings('hazardAndExposureLabel')}
                        className={styles.textInput}
                        formname="hazardAndExposure"
                    />
                    <TextInput
                        label={this.props.countriesStrings('vulnerabilityLabel')}
                        className={styles.textInput}
                        formname="vulnerability"
                    />
                    <TextInput
                        label={this.props.countriesStrings('lackOfCopingCapacityLabel')}
                        className={styles.textInput}
                        formname="lackOfCopingCapacity"
                    />
                </div>
            </Form>
        );
    }
}
