import CSSModules from 'react-css-modules';
import React from 'react';

import {
    TextArea,
    RadioInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

const TEXT = 'text';
const IMAGE = 'image';

@CSSModules(styles)
export default class ExcerptTextOverview extends React.PureComponent {
    constructor(props) {
        super(props);

        const options = [
            { key: TEXT, label: 'Text' },
            { key: IMAGE, label: 'Image' },
        ];

        this.options = options;

        this.state = {
            excerptType: TEXT,
        };
    }

    handleProjectTypeChange = (value) => {
        this.setState({
            excerptType: value,
        });
    }

    render() {
        const {
            excerptType,
        } = this.state;

        return (
            <div styleName="excerpt-overview">
                <RadioInput
                    options={this.options}
                    onChange={this.handleProjectTypeChange}
                    styleName="radio-input"
                    value={excerptType}
                    name="lead-type"
                />
                {
                    excerptType === TEXT ? (
                        <TextArea
                            styleName="textarea"
                            disabled
                            showLabel={false}
                            showHintAndError={false}
                        />
                    ) : (
                        <div styleName="image">
                            Image
                        </div>
                    )
                }
            </div>
        );
    }
}
