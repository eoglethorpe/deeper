import React from 'react';
import PropTypes from 'prop-types';

import TextArea from '../../../vendor/react-store/components/Input/TextArea';

import BoundError from '../../../vendor/react-store/components/General/BoundError';

import WidgetError from '../../../components/WidgetError';
import _ts from '../../../ts';

import styles from './styles.scss';

const IMAGE = 'image';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    api: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: undefined,
};

@BoundError(WidgetError)
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
            <div className={styles.list}>
                {
                    attribute.type === IMAGE ? (
                        <img
                            className={styles.image}
                            src={attribute.image}
                            alt={_ts('af', 'altEntryLabel')}
                        />
                    ) : (
                        <TextArea
                            onChange={this.handleExcerptChange}
                            className={styles.textarea}
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
