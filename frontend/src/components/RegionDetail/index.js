import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import TextInput from '../../vendor/react-store/components/Input/TextInput';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import FaramGroup from '../../vendor/react-store/components/Input/Faram/FaramGroup';

import {
    regionDetailSelector,
    setRegionDetailsAction,
} from '../../redux';
import _ts from '../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
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

        this.state = {};
    }

    render() {
        const {
            className,
            dataLoading,
        } = this.props;

        return (
            <Fragment>
                { dataLoading && <LoadingAnimation /> }
                <header className={styles.header}>
                    <h4 className={styles.heading} >
                        {_ts('countries', 'regionGeneralInfoLabel')}
                    </h4>
                </header>
                <TextInput
                    faramElementName="code"
                    label={_ts('countries', 'countryCodeLabel')}
                    placeholder={_ts('countries', 'countryCodePlaceholder')}
                    className={styles.textInput}
                />
                <TextInput
                    faramElementName="title"
                    label={_ts('countries', 'countryNameLabel')}
                    placeholder={_ts('countries', 'countryNamePlaceholder')}
                    className={styles.textInput}
                />
                <FaramGroup faramElementName="regionalGroups" >
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
                            faramElementName="regionalGroups:wbRegion"
                            label={_ts('countries', 'wbRegionLabel')}
                            placeholder={_ts('countries', 'wbRegionPlaceholer')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="regionalGroups:wbIncomeRegion"
                            label={_ts('countries', 'wbIncomeRegionLabel')}
                            placeholder={_ts('countries', 'wbIncomeRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="regionalGroups:ochaRegion"
                            label={_ts('countries', 'ochaRegionLabel')}
                            placeholder={_ts('countries', 'ochaRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="regionalGroups:echoRegion"
                            label={_ts('countries', 'echoRegionLabel')}
                            placeholder={_ts('countries', 'echoRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="regionalGroups:unGeoRegion"
                            label={_ts('countries', 'unGeoRegionLabel')}
                            placeholder={_ts('countries', 'unGeoRegionPlaceholer')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="regionalGroups:unGeoSubregion"
                            label={_ts('countries', 'unGeoSubregionLabel')}
                            placeholder={_ts('countries', 'unGeoSubregionPlaceholer')}
                            className={styles.textInput}
                        />
                    </div>
                </FaramGroup>
            </Fragment>
        );
    }
}
