import React from 'react';
import CSSModules from 'react-css-modules';
import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class StructureSection extends React.PureComponent {
    render() {
        return (
            <div>
                <h2>Structure</h2>
            </div>
        );
    }
}
