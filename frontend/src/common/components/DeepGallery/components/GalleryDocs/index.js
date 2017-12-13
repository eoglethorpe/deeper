import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import {
    LoadingAnimation,
} from '../../../../../public/components/View';

export const supportedMimeType = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel', 'application/xml',
    'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

const propTypes = {
    className: PropTypes.string,
    pending: PropTypes.bool,
    docUrl: PropTypes.string,
    mimeType: PropTypes.string,
};

const defaultProps = {
    className: '',
    pending: true,
    docUrl: undefined,
    mimeType: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class GalleryDocs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            pending,
            docUrl,
            mimeType,
        } = this.props;

        const googleDriveViewerUrl = 'https://drive.google.com/viewerng/viewer' +
            `?url=${docUrl}&pid=explorer&efh=false&a=v&chrome=false&embedded=true`;

        return (
            <div
                styleName="gallery-docs"
                className={`gallery-docs ${className}`}
            >
                {
                    pending && (
                        <LoadingAnimation />
                    )
                }
                {
                    mimeType === 'application/pdf' ?
                        <iframe
                            styleName="doc"
                            title={docUrl}
                            src={docUrl}
                        />
                        : <iframe
                            styleName="doc"
                            title={docUrl}
                            src={googleDriveViewerUrl}
                        />
                }
            </div>
        );
    }
}
