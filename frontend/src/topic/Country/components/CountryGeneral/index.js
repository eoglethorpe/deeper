import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import TextInput from '../../../../public/components/TextInput';

const propTypes = {
    iso: PropTypes.string.isRequired,
};

@CSSModules(styles, { allowMultiple: true })
export default class CountryGeneral extends React.PureComponent {
    static propTypes = propTypes;

    render() {
        const { iso } = this.props;
        return (
            <div styleName="country-general">
                <div styleName="form-map-container">
                    <form styleName="details-form">
                        <TextInput
                            label="Country code"
                            placeholder={iso}
                            styleName="text-input"
                        />
                        <TextInput
                            label="Name"
                            placeholder="Enter Country Name"
                            styleName="text-input"
                        />
                        <TextInput
                            label="WB Region"
                            placeholder="Enter WB Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="WB Income Region"
                            placeholder="Enter WB Income Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="OCHA Region"
                            placeholder="Enter OCHA Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="ECHO Region"
                            placeholder="Enter ECHO Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="UN Geographical Region"
                            placeholder="Enter UN Geographical Region"
                            styleName="text-input"
                        />
                        <TextInput
                            label="UN Geographical Sub Region"
                            placeholder="Enter UN Geographical Sub Region"
                            styleName="text-input"
                        />
                    </form>
                    <div styleName="map-container">
                        The map
                    </div>
                </div>
            </div>
        );
    }
}
