import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import { countriesString } from '../../../../common/constants';


const propTypes = {
    countryId: PropTypes.number.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class CountryMediaSources extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { countryId } = this.props;
        return (
            <div>{countriesString.mediaTabLabel}{countryId}</div>
        );
    }
}
