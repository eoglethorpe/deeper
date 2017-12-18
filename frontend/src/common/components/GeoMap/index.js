import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import {
    LoadingAnimation,
} from '../../../public/components/View';

const propTypes = {
    className: PropTypes.string,
};
const defaultProps = {
    className: '',
};


@CSSModules(styles, { allowMultiple: true })
export default class GeoMap extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
            error: false,
        };
    }

    renderContent() {
        const {
            error,
        } = this.state;

        if (error) {
            return (
                <div styleName="message">
                    Map Error
                </div>
            );
        }

        return (
            <div styleName="message">
                Map not available
            </div>
        );
    }

    render() {
        const {
            className,
        } = this.props;
        const {
            pending,
        } = this.state;

        return (
            <div
                className={className}
                styleName="geo-map"
            >
                {
                    (pending && (
                        <LoadingAnimation />
                    )) || (
                        this.renderContent()
                    )
                }
            </div>
        );
    }
}
