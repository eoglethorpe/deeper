import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.scss';
import {
    afStrings,
} from '../../../../../common/constants';

const TEXT = 'excerpt';

const propTypes = {
    entry: PropTypes.shape({
        id: PropTypes.number,
        excerpt: PropTypes.string,
        image: PropTypes.string,
        entryType: PropTypes.string,
    }).isRequired,
    attribute: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class ExcerptTextList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getAttribute() {
        const { attribute, entry } = this.props;
        if (!attribute) {
            return {
                type: entry.entryType,
                excerpt: entry.excerpt,
                image: entry.image,
            };
        }

        return attribute;
    }

    render() {
        const attribute = this.getAttribute();
        if (!attribute) {
            return null;
        }

        return (
            <div styleName="excerpt-list-view">
                {
                    attribute.type === TEXT ? (
                        <span styleName="textarea">
                            {attribute.excerpt}
                        </span>
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
