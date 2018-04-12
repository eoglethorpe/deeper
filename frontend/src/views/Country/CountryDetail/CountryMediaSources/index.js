import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { countriesStringsSelector } from '../../../../redux';
import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.number.isRequired,
    countriesStrings: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    countriesStrings: countriesStringsSelector(state),
});

@connect(mapStateToProps)
export default class CountryMediaSources extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { countryId } = this.props;
        const underConstructionText = 'Under construction';
        const mediaTabLabel = this.props.countriesStrings('mediaTabLabel');

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
