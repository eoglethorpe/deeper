import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class ProjectGeneral extends React.PureComponent {
    render() {
        return (
            <div>
                Project General
            </div>
        );
    }
}
