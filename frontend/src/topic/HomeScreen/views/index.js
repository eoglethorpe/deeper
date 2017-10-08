import CSSModules from 'react-css-modules';
// import PropTypes from 'prop-types';
import React from 'react';
import Helmet from 'react-helmet';
import { pageTitles } from '../../../common/utils/labels';


import { ImageInput } from '../../../public/components/FileInput';

import styles from './styles.scss';

const propTypes = {
};

@CSSModules(styles, { allowMultiple: true })
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div styleName="home-screen">
                <Helmet>
                    <title>{ pageTitles.dashboard }</title>
                </Helmet>
                <div>
                    <ImageInput
                        styleName="image-input"
                        showPreview
                    />
                </div>
            </div>
        );
    }
}
