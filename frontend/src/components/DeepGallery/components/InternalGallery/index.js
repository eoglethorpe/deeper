import PropTypes from 'prop-types';
import React from 'react';

import { FgRestBuilder } from '../../../../vendor/react-store/utils/rest';

import {
    createUrlForGalleryFile,
    createParamsForGet,
} from '../../../../rest';
import { iconNames } from '../../../../constants';
import _ts from '../../../../ts';

import GalleryViewer from '../GalleryViewer';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    galleryId: PropTypes.number,
    onlyFileName: PropTypes.bool,
    pendingLabel: PropTypes.string,
    notFoundMessage: PropTypes.string,
};

const defaultProps = {
    className: '',
    galleryId: undefined,
    onlyFileName: false,
    pendingLabel: undefined,
    notFoundMessage: undefined,
};

export default class InternalGallery extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: true,
            fileUrl: undefined,
            fileName: undefined,
            notFound: true,
        };
    }

    componentWillMount() {
        this.startRequest(this.props.galleryId);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.galleryId !== nextProps.galleryId) {
            this.startRequest(nextProps.galleryId);
        }
    }

    componentWillUnmount() {
        if (this.galleryFileRequest) {
            this.galleryFileRequest.stop();
        }
    }

    startRequest = (galleryId) => {
        if (!galleryId) {
            this.setState({ notFound: true, pending: false });
            return;
        }

        if (this.galleryFileRequest) {
            this.galleryFileRequest.stop();
        }

        this.galleryFileRequest = this.createRequestForGalleryFile(galleryId);
        this.galleryFileRequest.start();
    }

    createRequestForGalleryFile = (galleryId) => {
        const galleryFileRequest = new FgRestBuilder()
            .url(createUrlForGalleryFile(galleryId))
            .params(createParamsForGet)
            .preLoad(() => { this.setState({ pending: true, notFound: true }); })
            .postLoad(() => { this.setState({ pending: false }); })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.setState({
                        fileUrl: response.file,
                        fileName: response.title,
                        mimeType: response.mimeType,
                        notFound: false,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error('Failed to get gallery file info', response);
            })
            .fatal((response) => {
                console.error('Fatal error occured while getting gallery file info', response);
            })
            .build();

        return galleryFileRequest;
    }

    renderFileName = ({ className, fileName, fileUrl }) => (
        <a
            className={`${styles.galleryFileName} ${className}`}
            href={fileUrl}
            target="_blank"
        >
            {fileName}
        </a>
    )

    renderPending = () => {
        const { className, pendingLabel, onlyFileName } = this.props;

        // FIXME: use LoadingAnimation small here
        // XXX: what does onlyFileName do?
        return (
            <div className={`${styles.pendingContainer} ${onlyFileName ? styles.fileName : ''} ${className}`}>
                {
                    onlyFileName &&
                    <span className={styles.label} >
                        { pendingLabel || _ts('common', 'loadingFileLabel') }
                    </span>
                }
                <span className={`${iconNames.loading} ${styles.loadingAnimation}`} />
            </div>
        );
    }

    render404 = () => {
        const { className, onlyFileName, notFoundMessage } = this.props;

        return (
            <div className={`${styles.show404} ${onlyFileName ? styles.fileName : ''} ${className}`}>
                <span className={styles.label}>
                    {notFoundMessage || _ts('common', 'deepFileNotFound')}
                </span>
            </div>
        );
    }

    render() {
        const {
            pending,
            fileUrl,
            fileName,
            mimeType,
            notFound,
        } = this.state;

        const {
            className,
            onlyFileName,
        } = this.props;

        if (pending) {
            // show pending
            return this.renderPending();
        }

        if (notFound) {
            // show 404 message
            return this.render404();
        }

        if (onlyFileName) {
            // show file name only
            return this.renderFileName({ className, fileName, fileUrl });
        }

        // use supported file viewer component
        return (
            <GalleryViewer
                {...this.props}
                className={className}
                url={fileUrl}
                mimeType={mimeType}
                canShowIframe
            />
        );
    }
}
