import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './styles.scss';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class MatrixCell extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getStyleName = () => {
        const styleNames = [];
        styleNames.push('matrix-cell');

        return styleNames.join(' ');
    }

    render() {
        const { children } = this.props;

        const styleName = this.getStyleName();

        return (
            <div
                styleName={styleName}
                className={styleName}
            >
                { children }
            </div>
        );
    }
}
