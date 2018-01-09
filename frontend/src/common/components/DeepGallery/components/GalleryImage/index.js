import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import {
    iconNames,
    commonStrings,
} from '../../../../../common/constants';

export const supportedMimeType = ['image/png', 'image/jpeg', 'image/fig'];

const propTypes = {
    className: PropTypes.string,
    imageUrl: PropTypes.string,
};

const defaultProps = {
    className: '',
    imageUrl: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class GalleryImage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            imageUrl,
        } = this.props;

        return (
            <div
                styleName="gallery-image"
                className={`gallery-image ${className}`}
            >
                {
                    imageUrl ? (
                        <img
                            alt={commonStrings.altUser}
                            className="image"
                            styleName="image"
                            src={imageUrl}
                        />
                    ) : (
                        <span
                            styleName="image-alt"
                            className={`image-alt ${iconNames.user}`}
                        />
                    )
                }
            </div>
        );
    }
}
