import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import TextInput from '../../vendor/react-store/components/Input/TextInput';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import Form, {
    requiredCondition,
} from '../../vendor/react-store/components/Input/Form';

import {
    regionDetailSelector,
    setRegionDetailsAction,
} from '../../redux';
import _ts from '../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionDetail: PropTypes.shape({
        id: PropTypes.number,
        versionId: PropTypes.versionId,
        public: PropTypes.public,
        formValues: PropTypes.object,
        formFieldErrors: PropTypes.object,
        formErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }),
    setRegionDetails: PropTypes.func.isRequired,
    countryId: PropTypes.number.isRequired,
    projectId: PropTypes.number,
    dataLoading: PropTypes.bool,
};

const defaultProps = {
    className: '',
    regionDetail: {
        formValues: {},
        formFieldErrors: {},
        formErrors: {},
        pristine: false,
    },
    dataLoading: false,
    projectId: undefined,
};

const mapStateToProps = (state, props) => ({
    regionDetail: regionDetailSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setRegionDetails: params => dispatch(setRegionDetailsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class RegionDetail extends React.PureComponent {
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

        const { projectId } = this.props;

        if (projectId) {
            this.props.setRegionDetails({
                regionDetails,
                regionId: this.props.countryId,
                projectId,
            });
        } else {
            this.props.setRegionDetails({
                regionDetails,
                regionId: this.props.countryId,
            });
        }
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
                className={`${className} ${styles.regionDetailForm}`}
                changeCallback={this.changeCallback}
                failureCallback={this.failureCallback}
                schema={this.schema}
                fieldErrors={formFieldErrors}
                formErrors={formErrors}
                value={formValues}
            >
                { dataLoading && <LoadingAnimation /> }
                <header className={styles.header}>
                    <h4 className={styles.heading} >
                        {_ts('countries', 'regionGeneralInfoLabel')}
                    </h4>
                </header>
                <NonFieldErrors
                    formerror=""
                    className={styles.nonFieldErrors}
                />
                <div className={styles.inputContainer}>
                    <TextInput
                        formname="code"
                        label={_ts('countries', 'countryCodeLabel')}
                        placeholder={_ts('countries', 'countryCodePlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="title"
                        label={_ts('countries', 'countryNameLabel')}
                        placeholder={_ts('countries', 'countryNamePlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:wbRegion"
                        label={_ts('countries', 'wbRegionLabel')}
                        placeholder={_ts('countries', 'wbRegionPlaceholer')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:wbIncomeRegion"
                        label={_ts('countries', 'wbIncomeRegionLabel')}
                        placeholder={_ts('countries', 'wbIncomeRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:ochaRegion"
                        label={_ts('countries', 'ochaRegionLabel')}
                        placeholder={_ts('countries', 'ochaRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:echoRegion"
                        label={_ts('countries', 'echoRegionLabel')}
                        placeholder={_ts('countries', 'echoRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:unGeoRegion"
                        label={_ts('countries', 'unGeoRegionLabel')}
                        placeholder={_ts('countries', 'unGeoRegionPlaceholer')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:unGeoSubregion"
                        label={_ts('countries', 'unGeoSubregionLabel')}
                        placeholder={_ts('countries', 'unGeoSubregionPlaceholer')}
                        className={styles.textInput}
                    />
                </div>
            </Form>
        );
    }
}
