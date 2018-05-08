import PropTypes from 'prop-types';
import React from 'react';

import _ts from '../../../../ts';

import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number.isRequired,
};

export default class CountryPopulationData extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { countryId } = this.props;
        const underConstructionText = _ts('common', 'underConstructionLabel');
        const populationDataLabel = _ts('countries', 'populationTabLabel');

        return (
            <div className={styles.countryPopulation}>
                <div>
                    {populationDataLabel} #{countryId}
                </div>
                <div className={styles.underConstruction}>
                    {underConstructionText}
                </div>
            </div>
        );
    }
}
