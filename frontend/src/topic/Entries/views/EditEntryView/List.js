import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import {
    Link,
} from 'react-router-dom';

import { pageTitles } from '../../../../common/utils/labels';

import styles from './styles.scss';

const propTypes = {
};

@CSSModules(styles, { allowMultiple: true })
export default class List extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div
                styleName="overview"
            >
                <Helmet>
                    <title>{ `${pageTitles.editEntry} | Overview` }</title>
                </Helmet>
                <div
                    styleName="entry-list"
                >
                    <Link to="/overview">
                        Go to overview
                    </Link>
                </div>
            </div>
        );
    }
}
