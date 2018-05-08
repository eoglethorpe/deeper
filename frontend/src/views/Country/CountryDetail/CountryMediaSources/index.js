import PropTypes from 'prop-types';
import React from 'react';

import _ts from '../../../../ts';

import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number.isRequired,
};

export default class CountryMediaSources extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { countryId } = this.props;
        const underConstructionText = _ts('common', 'underConstructionLabel');
        const mediaTabLabel = _ts('countries', 'mediaTabLabel');

        return (
            <div className={styles.mediaSources}>
                <div>
                    {mediaTabLabel} #{countryId}
                </div>
                <div className={styles.underConstruction}>
                    {underConstructionText}
                </div>
            </div>
        );
    }
}
