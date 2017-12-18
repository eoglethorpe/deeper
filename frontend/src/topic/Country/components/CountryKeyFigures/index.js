import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../public/utils/rest';
import schema from '../../../../common/schema';
import {
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    Form,
    TextInput,
    NonFieldErrors,
} from '../../../../public/components/Input';
import {
    DangerButton,
    PrimaryButton,
} from '../../../../public/components/Action';
import {
    transformResponseErrorToFormError,
    createParamsForRegionPatch,
    createUrlForRegion,
    createUrlForRegionWithField,
    createParamsForUser,
} from '../../../../common/rest';
import {
    iconNames,
    countriesString,
} from '../../../../common/constants';
import {
    countryDetailSelector,
    setRegionDetailsAction,
} from '../../../../common/redux';
import styles from './styles.scss';

const propTypes = {
    regionDetail: PropTypes.shape({
        id: PropTypes.number.isRequired,
        code: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        keyFigures: PropTypes.shape({}),
    }).isRequired,
    setRegionDetails: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    regionDetail: countryDetailSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class CountryKeyFigures extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pristine: false,
            pending: false,
            formErrors: [],
            formFieldErrors: {},
            formValues: props.regionDetail.keyFigures || {},
            dataLoading: true,
        };

        this.elements = [
            'index',
            'geoRank',
            'geoScore',
            'geoScoreU5m',
            'rank',
            'u5m',
            'numberOfRefugees',
            'percentageUprootedPeople',
            'geoScoreUprooted',
            'numberIdp',
            'numberReturnedRefugees',
            'riskClass',
            'hazardAndExposure',
            'vulnerability',
            'informRiskIndex',
            'lackOfCopingCapacity',
        ];

        this.validations = {
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
                    formErrors: ['Error while trying to save region detail.'],
                    pending: false,
                });
            })
            .build();
        return regionDetailPatchRequest;
    }

    successCallback = (values) => {
        console.log(values);
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

    handleFormCancel = () => {
        // TODO: use prompt
        this.resetForm(this.props);
    }

    resetForm = (props) => {
        this.setState({
            formErrors: [],
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
                styleName="key-figures"
                changeCallback={this.changeCallback}
                elements={this.elements}
                failureCallback={this.failureCallback}
                successCallback={this.successCallback}
                validations={this.validations}
            >
                { (pending || dataLoading) && <LoadingAnimation /> }
                <header styleName="header">
                    <NonFieldErrors errors={formErrors} />
                    <div styleName="action-buttons">
                        <DangerButton
                            type="button"
                            onClick={this.handleFormCancel}
                            disabled={pending || !pristine}
                        >
                            {countriesString.cancelButtonLabel}
                        </DangerButton>
                        <PrimaryButton disabled={pending || !pristine} >
                            {countriesString.saveChangesButtonLabel}
                        </PrimaryButton>
                    </div>
                </header>
                <div styleName="section">
                    <h3>
                        {countriesString.humanDevelopmentIndexLabel}
                        <a
                            href="http://www.hdr.undp.org/en/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className={iconNames.link}
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label={countriesString.indexLabel}
                        styleName="text-input"
                        type="number"
                        step="any"
                        min="0"
                        max="1"
                        formname="index"
                        value={formValues.index}
                        error={formFieldErrors.index}
                    />
                    <TextInput
                        label={countriesString.geoRankLabel}
                        styleName="text-input"
                        readOnly
                        formname="geoRank"
                        value={formValues.geoRank}
                        error={formFieldErrors.geoRank}
                    />
                    <TextInput
                        label={countriesString.geoScoreLabel}
                        styleName="text-input"
                        readOnly
                        formname="geoScore"
                        value={formValues.geoScore}
                        error={formFieldErrors.geoScore}
                    />
                    <TextInput
                        label={countriesString.rankLabel}
                        styleName="text-input"
                        formname="rank"
                        value={formValues.rank}
                        error={formFieldErrors.rank}
                    />
                </div>
                <div styleName="section">
                    <h3>
                        {countriesString.underFiveMortalityLabel}
                        <a
                            href="http://www.inform-index.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className={iconNames.link}
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label={countriesString.u5mLabel}
                        styleName="text-input"
                        formname="u5m"
                        value={formValues.u5m}
                        error={formFieldErrors.u5m}
                        type="number"
                    />
                    <TextInput
                        label={countriesString.geoScoreLabel}
                        styleName="text-input"
                        readOnly
                        formname="geoScoreU5m"
                        value={formValues.geoScoreU5m}
                        error={formFieldErrors.geoScoreU5m}
                    />
                </div>
                <div styleName="section">
                    <h3>
                        {countriesString.uprootedPeopleLabel}
                        <a
                            href="http://www.inform-index.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className={iconNames.link}
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label={countriesString.numberOfRefugeesLabel}
                        styleName="text-input"
                        formname="numberOfRefugees"
                        value={formValues.numberOfRefugees}
                        error={formFieldErrors.numberOfRefugees}
                    />
                    <TextInput
                        label={countriesString.percentageUprootedPeopleLabel}
                        styleName="text-input"
                        readOnly
                        formname="percentageUprootedPeople"
                        value={formValues.percentageUprootedPeople}
                        error={formFieldErrors.percentageUprootedPeople}
                    />
                    <TextInput
                        label={countriesString.geoScoreLabel}
                        styleName="text-input"
                        readOnly
                        formname="geoScoreUprooted"
                        value={formValues.geoScoreUprooted}
                        error={formFieldErrors.geoScoreUprooted}
                    />
                    <TextInput
                        label={countriesString.numberIdpLabel}
                        styleName="text-input"
                        formname="numberIdp"
                        value={formValues.numberIdp}
                        error={formFieldErrors.numberIdp}
                    />
                    <TextInput
                        label={countriesString.numberReturnedRefugeesLabel}
                        styleName="text-input"
                        formname="numberReturnedRefugees"
                        value={formValues.numberReturnedRefugees}
                        error={formFieldErrors.numberReturnedRefugees}
                    />
                </div>
                <div styleName="section">
                    <h3>
                        {countriesString.informScoreLabel}
                        <a
                            href="http://www.hdr.undp.org/en/countries"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span
                                className={iconNames.link}
                                styleName="icon"
                                title="Click to open"
                            />
                        </a>
                    </h3>
                    <TextInput
                        label={countriesString.riskClassLabel}
                        styleName="text-input"
                        formname="riskClass"
                        value={formValues.riskClass}
                        error={formFieldErrors.riskClass}
                    />
                    <TextInput
                        label={countriesString.informRiskIndexLabel}
                        styleName="text-input"
                        formname="informRiskIndex"
                        value={formValues.informRiskIndex}
                        error={formFieldErrors.informRiskIndex}
                    />
                    <TextInput
                        label={countriesString.hazardAndExposureLabel}
                        styleName="text-input"
                        formname="hazardAndExposure"
                        value={formValues.hazardAndExposure}
                        error={formFieldErrors.hazardAndExposure}
                    />
                    <TextInput
                        label={countriesString.vulnerabilityLabel}
                        styleName="text-input"
                        formname="vulnerability"
                        value={formValues.vulnerability}
                        error={formFieldErrors.vulnerability}
                    />
                    <TextInput
                        label={countriesString.lackOfCopingCapacityLabel}
                        styleName="text-input"
                        formname="lackOfCopingCapacity"
                        value={formValues.lackOfCopingCapacity}
                        error={formFieldErrors.lackOfCopingCapacity}
                    />
                </div>
            </Form>
        );
    }
}
