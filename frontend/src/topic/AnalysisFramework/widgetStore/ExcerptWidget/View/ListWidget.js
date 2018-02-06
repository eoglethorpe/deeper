import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { afStringsSelector } from '../../../../../common/redux';
import BoundError from '../../../../../common/components/BoundError';

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

@BoundError
@connect(mapStateToProps)
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
                    attribute.type === IMAGE ? (
                        <img
                            styleName="image"
                            src={attribute.image}
                            alt={this.props.afStrings('altEntryLabel')}
                        />
                    ) : (
                        <span styleName="textarea">
                            {attribute.excerpt}
                        </span>
                    )
                }
            </div>
        );
    }
}
