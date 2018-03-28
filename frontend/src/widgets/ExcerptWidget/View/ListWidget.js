import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { afStringsSelector } from '../../../redux';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

import styles from './styles.scss';

const IMAGE = 'image';

const propTypes = {
    entry: PropTypes.shape({
        id: PropTypes.number,
        excerpt: PropTypes.string,
        image: PropTypes.string,
        entryType: PropTypes.string,
    }).isRequired,
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    attribute: undefined,
};


const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError(WidgetError)
@connect(mapStateToProps)
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

        const { afStrings } = this.props;
        const altText = afStrings('altEntryLabel');

        return (
            <div className={styles.excerptListView}>
                {
                    attribute.type === IMAGE ? (
                        <img
                            alt={altText}
                            className={styles.image}
                            src={attribute.image}
                        />
                    ) : (
                        <p className={styles.text}>
                            {attribute.excerpt}
                        </p>
                    )
                }
            </div>
        );
    }
}
