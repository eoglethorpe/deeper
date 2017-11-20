import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class GridItem extends React.PureComponent {
    render() {
        const {
            gridData,
            key,
        } = this.props;

        return (
            <div
                data-grid={gridData}
                key={key}
                styleName="grid-item"
            >
                Hello World
            </div>
        );
    }
}
