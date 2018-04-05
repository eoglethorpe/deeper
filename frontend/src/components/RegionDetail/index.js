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
    countriesStringsSelector,
    notificationStringsSelector,
    commonStringsSelector,
} from '../../redux';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    regionDetail: PropTypes.shape({
        formValues: PropTypes.object,
        formFieldErrors: PropTypes.object,
        formErrors: PropTypes.object,
        pristine: PropTypes.bool,
    }),
    setRegionDetails: PropTypes.func.isRequired,
    countryId: PropTypes.number.isRequired,
    projectId: PropTypes.number,
    dataLoading: PropTypes.bool,
    countriesStrings: PropTypes.func.isRequired,
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
    countriesStrings: countriesStringsSelector(state),
    notificationStrings: notificationStringsSelector(state),
    commonStrings: commonStringsSelector(state),
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
                        {this.props.countriesStrings('regionGeneralInfoLabel')}
                    </h4>
                </header>
                <NonFieldErrors
                    formerror=""
                    className={styles.nonFieldErrors}
                />
                <div className={styles.inputContainer}>
                    <TextInput
                        formname="code"
                        label={this.props.countriesStrings('countryCodeLabel')}
                        placeholder={this.props.countriesStrings('countryCodePlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="title"
                        label={this.props.countriesStrings('countryNameLabel')}
                        placeholder={this.props.countriesStrings('countryNamePlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:wbRegion"
                        label={this.props.countriesStrings('wbRegionLabel')}
                        placeholder={this.props.countriesStrings('wbRegionPlaceholer')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:wbIncomeRegion"
                        label={this.props.countriesStrings('wbIncomeRegionLabel')}
                        placeholder={this.props.countriesStrings('wbIncomeRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:ochaRegion"
                        label={this.props.countriesStrings('ochaRegionLabel')}
                        placeholder={this.props.countriesStrings('ochaRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:echoRegion"
                        label={this.props.countriesStrings('echoRegionLabel')}
                        placeholder={this.props.countriesStrings('echoRegionPlaceholder')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:unGeoRegion"
                        label={this.props.countriesStrings('unGeoRegionLabel')}
                        placeholder={this.props.countriesStrings('unGeoRegionPlaceholer')}
                        className={styles.textInput}
                    />
                    <TextInput
                        formname="regionalGroups:unGeoSubregion"
                        label={this.props.countriesStrings('unGeoSubregionLabel')}
                        placeholder={this.props.countriesStrings('unGeoSubregionPlaceholer')}
                        className={styles.textInput}
                    />
                </div>
            </Form>
        );
    }
}
