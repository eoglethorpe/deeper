import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import {
    TextArea,
    RadioInput,
} from '../../../../../public/components/Input';

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

    componentWillMount() {
        this.update(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.update(nextProps);
    }

    update = (props) => {
        const { id, attribute, api } = props;

        if (!attribute) {
            const attr = {
                type: api.getEntryType(),
                excerpt: api.getEntryExcerpt(),
                image: api.getEntryImage(),
            };
            api.getEntryModifier().setAttribute(id, attr).apply();
        }
    }

    handleEntryTypeChange = (value) => {
        const { id, api, attribute } = this.props;
        api.getEntryModifier()
            .setType(value)
            .setAttribute(id, { ...attribute, type: value })
            .apply();
    }

    handleExcerptChange = (value) => {
        const { id, api, attribute } = this.props;
        api.getEntryModifier()
            .setExcerpt(value)
            .setAttribute(id, { ...attribute, excerpt: value })
            .apply();
    }

    render() {
        const {
            attribute,
        } = this.props;

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
                            alt="Entry"
                        />
                    )
                }
            </div>
        );
    }
}
