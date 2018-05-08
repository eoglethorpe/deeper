import PropTypes from 'prop-types';
import React from 'react';

import TextInput from '../../vendor/react-store/components/Input/TextInput';
import NonFieldErrors from '../../vendor/react-store/components/Input/NonFieldErrors';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import FaramGroup from '../../vendor/react-store/components/Input/Faram/FaramGroup';

import _ts from '../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    dataLoading: PropTypes.bool,
};

const defaultProps = {
    className: '',
    dataLoading: false,
};

export default class RegionDetail extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            dataLoading,
        } = this.props;

        const classNames = `${className} ${styles.regionDetailForm}`;

        return (
            <div className={classNames} >
                { dataLoading && <LoadingAnimation /> }
                <header className={styles.header}>
                    <h4 className={styles.heading} >
                        {_ts('countries', 'regionGeneralInfoLabel')}
                    </h4>
                </header>
                <NonFieldErrors faramElement />
                <div className={styles.inputContainer}>
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
                        <TextInput
                            faramElementName="wbRegion"
                            label={_ts('countries', 'wbRegionLabel')}
                            placeholder={_ts('countries', 'wbRegionPlaceholer')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="wbIncomeRegion"
                            label={_ts('countries', 'wbIncomeRegionLabel')}
                            placeholder={_ts('countries', 'wbIncomeRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="ochaRegion"
                            label={_ts('countries', 'ochaRegionLabel')}
                            placeholder={_ts('countries', 'ochaRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="echoRegion"
                            label={_ts('countries', 'echoRegionLabel')}
                            placeholder={_ts('countries', 'echoRegionPlaceholder')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="unGeoRegion"
                            label={_ts('countries', 'unGeoRegionLabel')}
                            placeholder={_ts('countries', 'unGeoRegionPlaceholer')}
                            className={styles.textInput}
                        />
                        <TextInput
                            faramElementName="unGeoSubregion"
                            label={_ts('countries', 'unGeoSubregionLabel')}
                            placeholder={_ts('countries', 'unGeoSubregionPlaceholer')}
                            className={styles.textInput}
                        />
                    </FaramGroup>
                </div>
            </div>
        );
    }
}
