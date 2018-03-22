import PropTypes from 'prop-types';
import React from 'react';

import { createUrlForGoogleViewer } from '../../../../rest/external';
import styles from './styles.scss';

export { galleryDocsMimeType as supportedMimeType } from '../../../../config/deepMimeTypes';

const propTypes = {
    className: PropTypes.string,
    docUrl: PropTypes.string,
    mimeType: PropTypes.string,
    canShowIframe: PropTypes.bool,
    notHttps: PropTypes.bool,
};

const defaultProps = {
    className: '',
    docUrl: undefined,
    mimeType: undefined,
    canShowIframe: true,
    notHttps: false,
};

/*
 * Gallery viewer component for Docs [galleryDocsMimeType]
 */
export default class GalleryDocs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            docUrl,
            mimeType,
            canShowIframe,
            notHttps,
        } = this.props;

        if (!docUrl) {
            return <div />;
        }

        const googleDriveViewerUrl = createUrlForGoogleViewer(docUrl);

        const classNames = [
            className,
            'gallery-docs',
            styles['gallery-docs'],
        ];

        return (
            <div className={classNames.join(' ')}>
                {
                    mimeType === 'application/pdf' && canShowIframe && !notHttps ?
                        <iframe
                            className={`doc ${styles.doc}`}
                            title={docUrl}
                            src={docUrl}
                        />
                        : <iframe
                            className={`doc ${styles.doc}`}
                            title={docUrl}
                            src={googleDriveViewerUrl}
                            sandbox="allow-scripts allow-same-origin allow-popups"
                        />
                }
            </div>
        );
    }
}
