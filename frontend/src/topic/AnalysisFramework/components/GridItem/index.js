import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';

const propTypes = {

};

@CSSModules(styles, { allowMultiple: true })
export default class GridItem extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        // TODO: write propTypes
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
