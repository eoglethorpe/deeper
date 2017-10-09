import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    countryId: PropTypes.string.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class CountryMediaSources extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { countryId } = this.props;
        return (
            <div>Media Sources {countryId}</div>
        );
    }
}
