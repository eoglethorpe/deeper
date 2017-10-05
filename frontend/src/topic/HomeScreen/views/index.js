import CSSModules from 'react-css-modules';
// import PropTypes from 'prop-types';
import React from 'react';

import { ImageInput } from '../../../public/components/FileInput';
import SelectInput from '../../../public/components/SelectInput';

import styles from './styles.scss';

const propTypes = {
};

@CSSModules(styles, { allowMultiple: true })
export default class HomeScreen extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        return (
            <div styleName="home-screen">
                <div>
                    <ImageInput
                        styleName="image-input"
                        showPreview
                    />
                </div>
                <div>
                    <SelectInput />
                </div>
            </div>
        );
    }
}
