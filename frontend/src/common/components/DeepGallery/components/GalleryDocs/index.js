import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    createUrlForGoogleViewer,
} from '../../../../../common/rest/external';

import styles from './styles.scss';

export const supportedMimeType = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint', 'application/vnd.ms-excel', 'application/xml',
    'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

const propTypes = {
    className: PropTypes.string,
    docUrl: PropTypes.string,
    mimeType: PropTypes.string,
    isSameOrigin: PropTypes.bool,
};

const defaultProps = {
    className: '',
    docUrl: undefined,
    mimeType: undefined,
    isSameOrigin: false,
};

@CSSModules(styles, { allowMultiple: true })
export default class GalleryDocs extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            docUrl,
            mimeType,
            isSameOrigin,
        } = this.props;

        const googleDriveViewerUrl = createUrlForGoogleViewer(docUrl);
        const isHttps = !!docUrl.match(/^https:\/\//) || window.location.hostname === 'localhost';

        const classNames = [
            className,
            'gallery-docs',
            styles['gallery-docs'],
        ];

        return (
            <div className={classNames.join(' ')}>
                {
                    mimeType === 'application/pdf' && !isSameOrigin && isHttps ?
                        <iframe
                            className="doc"
                            styleName="doc"
                            title={docUrl}
                            src={docUrl}
                        />
                        : <iframe
                            className="doc"
                            styleName="doc"
                            title={docUrl}
                            src={googleDriveViewerUrl}
                            sandbox="allow-scripts allow-same-origin allow-popups"
                        />
                }
            </div>
        );
    }
}
