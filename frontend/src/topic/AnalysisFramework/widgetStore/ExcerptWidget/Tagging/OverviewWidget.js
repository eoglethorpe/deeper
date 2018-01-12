import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import {
    TextArea,
} from '../../../../../public/components/Input';
import {
    afStrings,
} from '../../../../../common/constants';
import styles from './styles.scss';

const IMAGE = 'image';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
    entryId: undefined,
};

@CSSModules(styles)
export default class ExcerptTextOverview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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

    handleExcerptChange = (value) => {
        const { id, entryId, api } = this.props;
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
            <div styleName="excerpt-overview">
                {
                    attribute.type === IMAGE ? (
                        <img
                            styleName="image"
                            src={attribute.image}
                            alt={afStrings.altEntryLabel}
                        />
                    ) : (
                        <TextArea
                            onChange={this.handleExcerptChange}
                            styleName="textarea"
                            showLabel={false}
                            showHintAndError={false}
                            value={attribute.excerpt}
                        />
                    )
                }
            </div>
        );
    }
}
