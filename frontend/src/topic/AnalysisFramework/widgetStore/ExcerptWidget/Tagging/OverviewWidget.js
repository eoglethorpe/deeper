import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import {
    TextArea,
    RadioInput,
} from '../../../../../public/components/Input';
import {
    afStrings,
} from '../../../../../common/constants';
import styles from './styles.scss';

const TEXT = 'excerpt';
const IMAGE = 'image';

const propTypes = {
    id: PropTypes.number.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    attribute: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class ExcerptTextOverview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const options = [
            { key: TEXT, label: 'Text' },
            { key: IMAGE, label: 'Image' },
        ];

        this.options = options;
    }

    getAttribute = () => {
        const { api, attribute } = this.props;
        if (!attribute) {
            return {
                type: api.getEntryType(),
                excerpt: api.getEntryExcerpt(),
                image: api.getEntryImage(),
            };
        }
        return attribute;
    }

    handleEntryTypeChange = (value) => {
        const { id, api } = this.props;
        const attribute = this.getAttribute();
        api.getEntryModifier()
            .setType(value)
            .setAttribute(id, { ...attribute, type: value })
            .apply();
    }

    handleExcerptChange = (value) => {
        const { id, api } = this.props;
        const attribute = this.getAttribute();
        api.getEntryModifier()
            .setExcerpt(value)
            .setAttribute(id, { ...attribute, excerpt: value })
            .apply();
    }

    render() {
        const attribute = this.getAttribute();
        if (!attribute) {
            return null;
        }

        return (
            <div styleName="excerpt-overview">
                <RadioInput
                    name="entry-type"
                    options={this.options}
                    onChange={this.handleEntryTypeChange}
                    styleName="radio-input"
                    value={attribute.type}
                />
                {
                    attribute.type === TEXT ? (
                        <TextArea
                            onChange={this.handleExcerptChange}
                            styleName="textarea"
                            showLabel={false}
                            showHintAndError={false}
                            value={attribute.excerpt}
                        />
                    ) : (
                        <img
                            styleName="image"
                            src={attribute.image}
                            alt={afStrings.altEntryLabel}
                        />
                    )
                }
            </div>
        );
    }
}
