import CSSModules from 'react-css-modules';
import React from 'react';
import {
    Link,
} from 'react-router-dom';

import {
    Responsive,
} from '../../../public/components/General';

import styles from './styles.scss';

@Responsive
@CSSModules(styles, { allowMultiple: true })
export default class List extends React.PureComponent {
    render() {
        return (
            <div>
                <Link to="/overview" >
                    Go to overview
                </Link>
            </div>
        );
    }
}
