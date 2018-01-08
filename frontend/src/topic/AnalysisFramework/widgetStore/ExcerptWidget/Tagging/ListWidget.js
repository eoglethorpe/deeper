import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import {
    TextArea,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

const TEXT = 'excerpt';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired,      // eslint-disable-line
    attribute: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class ExcerptList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getAttribute = () => {
        const { api, attribute, entryId } = this.props;
        if (!attribute) {
            return {
                type: api.getEntryType(entryId),
                excerpt: api.getEntryExcerpt(entryId),
                image: api.getEntryImage(entryId),
            };
        }
        return attribute;
    }

    handleExcerptChange = (value) => {
        const { id, api, entryId } = this.props;
        const attribute = this.getAttribute();
        api.getEntryModifier(entryId)
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
            <div styleName="excerpt-list">
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
