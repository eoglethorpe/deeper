import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class CountryGeneral extends React.PureComponent {
    static propTypes = {
        iso: PropTypes.string.isRequired,
    }

    render() {
        const { iso } = this.props;
        return (
            <div>General {iso}</div>
        );
    }
}
