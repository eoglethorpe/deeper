import CSSModules from 'react-css-modules';
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
@CSSModules(styles, { allowMultiple: true })
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
