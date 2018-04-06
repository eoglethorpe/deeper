import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import Form, {
    requiredCondition,
} from '../../../../vendor/react-store/components/Input/Form';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';

import {
    regionDetailSelector,
    countriesStringsSelector,
    setRegionDetailsAction,
} from '../../../../redux';
import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string.isRequired,
    regionDetail: PropTypes.shape({
        formValues: PropTypes.object.isRequired,
        formFieldErrors: PropTypes.object.isRequired,
        formErrors: PropTypes.object.isRequired,
        pristine: PropTypes.bool.isRequired,
    }).isRequired,
    dataLoading: PropTypes.bool.isRequired,
    setRegionDetails: PropTypes.func.isRequired,
    countriesStrings: PropTypes.func.isRequired,
    countryId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    regionDetail: regionDetailSelector(state, props),
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

        this.schema = {
            fields: {
                code: [requiredCondition],
                title: [requiredCondition],
                regionalGroups: {
                    fields: {
                        wbRegion: [],
                        wbIncomeRegion: [],
                        ochaRegion: [],
                        echoRegion: [],
                        unGeoRegion: [],
                        unGeoSubregion: [],
                    },
                },
                keyFigures: {
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
                },
            },
        };
    }

    // FORM RELATED

    changeCallback = (values, formFieldErrors, formErrors) => {
        const regionDetails = {
            formValues: {
                ...this.props.regionDetail.formValues,
                ...values,
            },
            formFieldErrors: {
                ...this.props.regionDetail.formFieldErrors,
                ...formFieldErrors,
            },
            formErrors: {
                ...this.props.regionDetail.formErrors,
                ...formErrors,
            },
            pristine: true,
        };
        this.props.setRegionDetails({
            regionDetails,
            regionId: this.props.countryId,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        const regionDetails = {
            formValues: { ...this.props.regionDetail.formValues },
            formFieldErrors: { ...formFieldErrors },
            formErrors: { ...formErrors },
            pristine: true,
        };
        this.props.setRegionDetails({
            regionDetails,
            regionId: this.props.countryId,
        });
    };

    render() {
        const {
            className,
            dataLoading,
        } = this.props;

        const {
            formErrors,
            formFieldErrors,
            formValues,
        } = this.props.regionDetail;

        return (
            <Form
                className={`${className} ${styles.keyFigures}`}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                schema={this.schema}
                value={formValues}
                formErrors={formErrors}
                fieldErrors={formFieldErrors}
            >
                { dataLoading && <LoadingAnimation /> }
                <div className={styles.sections} >
                    <div className={styles.section}>
                        <h3 className={styles.heading} >
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
                        <div className={styles.inputs} >
                            <TextInput
                                label={this.props.countriesStrings('indexLabel')}
                                type="number"
                                step="any"
                                min="0"
                                max="1"
                                formname="keyFigures:index"
                            />
                            <TextInput
                                label={this.props.countriesStrings('geoRankLabel')}
                                readOnly
                                formname="keyFigures:geoRank"
                            />
                            <TextInput
                                label={this.props.countriesStrings('geoScoreLabel')}
                                readOnly
                                formname="keyFigures:geoScore"
                            />
                            <TextInput
                                label={this.props.countriesStrings('rankLabel')}
                                formname="keyFigures:rank"
                            />
                        </div>
                    </div>
                    <div className={styles.section}>
                        <h3 className={styles.heading} >
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
                        <div className={styles.inputs} >
                            <TextInput
                                label={this.props.countriesStrings('u5mLabel')}
                                formname="keyFigures:u5m"
                                type="number"
                            />
                            <TextInput
                                label={this.props.countriesStrings('geoScoreLabel')}
                                readOnly
                                formname="keyFigures:geoScoreU5m"
                            />
                        </div>
                    </div>
                    <div className={styles.section}>
                        <h3 className={styles.heading} >
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
                        <div className={styles.inputs} >
                            <TextInput
                                label={this.props.countriesStrings('numberOfRefugeesLabel')}
                                formname="keyFigures:numberOfRefugees"
                            />
                            <TextInput
                                label={this.props.countriesStrings('percentageUprootedPeopleLabel')}
                                readOnly
                                formname="keyFigures:percentageUprootedPeople"
                            />
                            <TextInput
                                label={this.props.countriesStrings('geoScoreLabel')}
                                readOnly
                                formname="keyFigures:geoScoreUprooted"
                            />
                            <TextInput
                                label={this.props.countriesStrings('numberIdpLabel')}
                                formname="keyFigures:numberIdp"
                            />
                            <TextInput
                                label={this.props.countriesStrings('numberReturnedRefugeesLabel')}
                                formname="keyFigures:numberReturnedRefugees"
                            />
                        </div>
                    </div>
                    <div className={styles.section}>
                        <h3 className={styles.heading} >
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
                        <div className={styles.inputs} >
                            <TextInput
                                label={this.props.countriesStrings('riskClassLabel')}
                                formname="keyFigures:riskClass"
                            />
                            <TextInput
                                label={this.props.countriesStrings('informRiskIndexLabel')}
                                formname="keyFigures:informRiskIndex"
                            />
                            <TextInput
                                label={this.props.countriesStrings('hazardAndExposureLabel')}
                                formname="keyFigures:hazardAndExposure"
                            />
                            <TextInput
                                label={this.props.countriesStrings('vulnerabilityLabel')}
                                formname="keyFigures:vulnerability"
                            />
                            <TextInput
                                label={this.props.countriesStrings('lackOfCopingCapacityLabel')}
                                formname="keyFigures:lackOfCopingCapacity"
                            />
                        </div>
                    </div>
                </div>
            </Form>
        );
    }
}
