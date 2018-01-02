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
