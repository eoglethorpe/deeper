import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import {
    TextArea,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

const TEXT = 'excerpt';

const propTypes = {
    attribute: PropTypes.object,      // eslint-disable-line
};

const defaultProps = {
    attribute: undefined,
};

@CSSModules(styles)
export default class ExcerptTextList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            attribute,
        } = this.props;

        if (!attribute) {
            return null;
        }

        return (
            <div styleName="excerpt-list-view">
                {
                    attribute.type === TEXT ? (
                        <TextArea
                            styleName="textarea"
                            showLabel={false}
                            showHintAndError={false}
                            value={attribute.excerpt}
                            readOnly
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
