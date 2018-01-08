import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    createParamsForGenericGet,
    createUrlForExport,
} from '../../../common/rest';
import GalleryDocs from '../DeepGallery/components/GalleryDocs';

import {
    LoadingAnimation,
} from '../../../public/components/View';

import {
    exportStrings,
} from '../../../common/constants';

const propTypes = {
    className: PropTypes.string,
    exportId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onLoad: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
};
const defaultProps = {
    className: '',
    exportId: undefined,
    onLoad: undefined,
};


@CSSModules(styles, { allowMultiple: true })
export default class ExportPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            error: undefined,
            exportObj: undefined,
        };
    }

    componentDidMount() {
        this.create(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.exportId !== nextProps.exportId) {
            this.create(nextProps);
        }
    }

    componentWillUnmount() {
        this.destroy();
    }

    destroy() {
        if (this.previewRequestTimeout) {
            clearTimeout(this.previewRequestTimeout);
        }
        if (this.previewRequest) {
            this.previewRequest.stop();
        }
    }

    create(props) {
        const {
            exportId,
            onLoad,
        } = props;

        this.destroy();

        if (!exportId) {
            this.setState({
                pending: false,
                error: undefined,
                exportObj: undefined,
            });
            return;
        }

        this.previewRequestCount = 0;
        this.previewRequest = this.createRequest(
            createUrlForExport(exportId),
            createParamsForGenericGet(),
            (response) => {
                if (response.pending) {
                    this.previewRequestTimeout = setTimeout(() => {
                        this.tryPreviewRequest();
                    }, 1000);
                } else {
                    this.setState({
                        pending: false,
                        error: undefined,
                        exportObj: response,
                    });

                    if (onLoad) {
                        onLoad(response);
                    }
                }
            },
        );

        this.tryPreviewRequest();
    }

    tryPreviewRequest = (maxCount = 30) => {
        if (this.previewRequestCount === maxCount) {
            this.setState({
                pending: false,
                error: undefined,
                exportObj: undefined,
            });
            return;
        }

        this.previewRequestCount += 1;
        this.previewRequest.start();
    }

    createRequest = (url, params, onSuccess) => (
        new FgRestBuilder()
            .url(url)
            .params(params)
            .success((response) => {
                try {
                    onSuccess(response);
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: 'Server error',
                });
            })
            .fatal((response) => {
                console.log(response);
                this.setState({
                    pending: false,
                    error: 'Failed connecting to server',
                });
            })
            .build()
    );

    renderContent() {
        const {
            error,
            exportObj,
        } = this.state;

        if (error) {
            return (
                <div styleName="message">
                    { error }
                </div>
            );
        }

        if (exportObj) {
            return (
                <GalleryDocs
                    docUrl={exportObj.file}
                    mimeType={exportObj.mimeType}
                    isSameOrigin
                />
            );
        }

        return (
            <div styleName="message">
                {exportStrings.previewNotAvailableLabel}
            </div>
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        return (
            <div
                className={className}
                styleName="export-preview"
            >
                { pending && <LoadingAnimation /> }
                { !pending && this.renderContent() }
            </div>
        );
    }
}
