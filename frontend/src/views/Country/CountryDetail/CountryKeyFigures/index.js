import PropTypes from 'prop-types';
import React from 'react';

import LoadingAnimation from '../../../../vendor/react-store/components/View/LoadingAnimation';
import FaramGroup from '../../../../vendor/react-store/components/Input/Faram/FaramGroup';
import TextInput from '../../../../vendor/react-store/components/Input/TextInput';

import { iconNames } from '../../../../constants';
import _ts from '../../../../ts';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string.isRequired,
    dataLoading: PropTypes.bool.isRequired,
};

const defaultProps = {
    className: '',
};

export default class CountryKeyFigures extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            dataLoading,
        } = this.props;

        const classNames = `${className} ${styles.keyFigures}`;

        return (
            <FaramGroup faramElementName="keyFigures" >
                <div className={classNames} >
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
                                    faramElementName="index"
                                />
                                <TextInput
                                    label={_ts('countries', 'geoRankLabel')}
                                    readOnly
                                    faramElementName="geoRank"
                                />
                                <TextInput
                                    label={_ts('countries', 'geoScoreLabel')}
                                    readOnly
                                    faramElementName="geoScore"
                                />
                                <TextInput
                                    label={_ts('countries', 'rankLabel')}
                                    faramElementName="rank"
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
                                    faramElementName="u5m"
                                    type="number"
                                />
                                <TextInput
                                    label={_ts('countries', 'geoScoreLabel')}
                                    readOnly
                                    faramElementName="geoScoreU5m"
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
                                    faramElementName="numberOfRefugees"
                                />
                                <TextInput
                                    label={_ts('countries', 'percentageUprootedPeopleLabel')}
                                    readOnly
                                    faramElementName="percentageUprootedPeople"
                                />
                                <TextInput
                                    label={_ts('countries', 'geoScoreLabel')}
                                    readOnly
                                    faramElementName="geoScoreUprooted"
                                />
                                <TextInput
                                    label={_ts('countries', 'numberIdpLabel')}
                                    faramElementName="numberIdp"
                                />
                                <TextInput
                                    label={_ts('countries', 'numberReturnedRefugeesLabel')}
                                    faramElementName="numberReturnedRefugees"
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
                                    faramElementName="riskClass"
                                />
                                <TextInput
                                    label={_ts('countries', 'informRiskIndexLabel')}
                                    faramElementName="informRiskIndex"
                                />
                                <TextInput
                                    label={_ts('countries', 'hazardAndExposureLabel')}
                                    faramElementName="hazardAndExposure"
                                />
                                <TextInput
                                    label={_ts('countries', 'vulnerabilityLabel')}
                                    faramElementName="vulnerability"
                                />
                                <TextInput
                                    label={_ts('countries', 'lackOfCopingCapacityLabel')}
                                    faramElementName="lackOfCopingCapacity"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </FaramGroup>
        );
    }
}
