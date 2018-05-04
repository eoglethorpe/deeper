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
    setRegionDetailsAction,
} from '../../../../redux';
import { iconNames } from '../../../../constants';
import _ts from '../../../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string.isRequired,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        versionId: PropTypes.versionId,
        public: PropTypes.public,
        formValues: PropTypes.object,
        formFieldErrors: PropTypes.object,
        formErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }).isRequired,
    dataLoading: PropTypes.bool.isRequired,
    setRegionDetails: PropTypes.func.isRequired,
    countryId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = (state, props) => ({
    regionDetail: regionDetailSelector(state, props),
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

    changeCallback = (formValues, formFieldErrors, formErrors) => {
        const regionDetails = {
            formValues,
            formFieldErrors,
            formErrors,
            pristine: true,
        };
        this.props.setRegionDetails({
            regionDetails,
            regionId: this.props.countryId,
        });
    };

    failureCallback = (formFieldErrors, formErrors) => {
        const regionDetails = {
            formValues: this.props.regionDetail.formValues,
            formFieldErrors,
            formErrors,
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
                { dataLoading && <LoadingAnimation large /> }
                <div className={styles.sections} >
                    <div className={styles.section}>
                        <h3 className={styles.heading} >
                            {_ts('countries', 'humanDevelopmentIndexLabel')}
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
                                label={_ts('countries', 'indexLabel')}
                                type="number"
                                step="any"
                                min="0"
                                max="1"
                                formname="keyFigures:index"
                            />
                            <TextInput
                                label={_ts('countries', 'geoRankLabel')}
                                readOnly
                                formname="keyFigures:geoRank"
                            />
                            <TextInput
                                label={_ts('countries', 'geoScoreLabel')}
                                readOnly
                                formname="keyFigures:geoScore"
                            />
                            <TextInput
                                label={_ts('countries', 'rankLabel')}
                                formname="keyFigures:rank"
                            />
                        </div>
                    </div>
                    <div className={styles.section}>
                        <h3 className={styles.heading} >
                            {_ts('countries', 'underFiveMortalityLabel')}
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
                                label={_ts('countries', 'u5mLabel')}
                                formname="keyFigures:u5m"
                                type="number"
                            />
                            <TextInput
                                label={_ts('countries', 'geoScoreLabel')}
                                readOnly
                                formname="keyFigures:geoScoreU5m"
                            />
                        </div>
                    </div>
                    <div className={styles.section}>
                        <h3 className={styles.heading} >
                            {_ts('countries', 'uprootedPeopleLabel')}
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
                                label={_ts('countries', 'numberOfRefugeesLabel')}
                                formname="keyFigures:numberOfRefugees"
                            />
                            <TextInput
                                label={_ts('countries', 'percentageUprootedPeopleLabel')}
                                readOnly
                                formname="keyFigures:percentageUprootedPeople"
                            />
                            <TextInput
                                label={_ts('countries', 'geoScoreLabel')}
                                readOnly
                                formname="keyFigures:geoScoreUprooted"
                            />
                            <TextInput
                                label={_ts('countries', 'numberIdpLabel')}
                                formname="keyFigures:numberIdp"
                            />
                            <TextInput
                                label={_ts('countries', 'numberReturnedRefugeesLabel')}
                                formname="keyFigures:numberReturnedRefugees"
                            />
                        </div>
                    </div>
                    <div className={styles.section}>
                        <h3 className={styles.heading} >
                            {_ts('countries', 'informScoreLabel')}
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
                                label={_ts('countries', 'riskClassLabel')}
                                formname="keyFigures:riskClass"
                            />
                            <TextInput
                                label={_ts('countries', 'informRiskIndexLabel')}
                                formname="keyFigures:informRiskIndex"
                            />
                            <TextInput
                                label={_ts('countries', 'hazardAndExposureLabel')}
                                formname="keyFigures:hazardAndExposure"
                            />
                            <TextInput
                                label={_ts('countries', 'vulnerabilityLabel')}
                                formname="keyFigures:vulnerability"
                            />
                            <TextInput
                                label={_ts('countries', 'lackOfCopingCapacityLabel')}
                                formname="keyFigures:lackOfCopingCapacity"
                            />
                        </div>
                    </div>
                </div>
            </Form>
        );
    }
}
