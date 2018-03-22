import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { countriesStringsSelector } from '../../../../redux';

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
        return (
            <div>
                {this.props.countriesStrings('mediaTabLabel')} {countryId}
            </div>
        );
    }
}
