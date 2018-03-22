import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';

import {
    createParamsForGenericGet,
    createUrlForExport,
} from '../../rest';
import { exportStringsSelector } from '../../redux';

import { GalleryViewer } from '../DeepGallery';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    exportId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onLoad: PropTypes.func, // eslint-disable-line react/no-unused-prop-types
    exportStrings: PropTypes.func.isRequired,
};
const defaultProps = {
    className: '',
    exportId: undefined,
    onLoad: undefined,
};

const mapStateToProps = state => ({
    exportStrings: exportStringsSelector(state),
});

@connect(mapStateToProps)
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
        if (this.previewRequest) {
            this.previewRequest.stop();
        }
    }

    create(props) {
        const { exportId } = props;

        if (!exportId) {
            this.setState({
                pending: false,
                error: undefined,
                exportObj: undefined,
            });
            return;
        }

        if (this.previewRequest) {
            this.previewRequest.stop();
        }
        this.previewRequest = this.createPreviewRequest(exportId);
        this.previewRequest.start();
    }

    createPreviewRequest = exportId => (
        new FgRestBuilder()
            .url(createUrlForExport(exportId))
            .params(createParamsForGenericGet)
            .maxPollAttempts(200)
            .pollTime(2000)
            .shouldPoll(response => response.pending)
            .success((response) => {
                this.setState({
                    pending: false,
                    error: undefined,
                    exportObj: response,
                });

                if (this.props.onLoad) {
                    this.props.onLoad(response);
                }
            })
            .failure(() => {
                this.setState({
                    pending: false,
                    error: this.props.exportStrings('serverErrorText'),
                });
            })
            .fatal(() => {
                this.setState({
                    pending: false,
                    error: this.props.exportStrings('connectionFailureText'),
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
                <div className={styles.message}>
                    { error }
                </div>
            );
        }

        if (exportObj) {
            return (
                <GalleryViewer
                    url={exportObj.file}
                    mimeType={exportObj.mimeType}
                    canShowIframe={false}
                    invalidUrlMessage={this.props.exportStrings('previewNotAvailableLabel')}
                    showUrl
                />
            );
        }

        return (
            <div className={styles.message}>
                {this.props.exportStrings('previewNotAvailableLabel')}
            </div>
        );
    }

    render() {
        const { className } = this.props;
        const { pending } = this.state;

        return (
            <div className={`${className} ${styles.exportPreview}`}>
                { pending && <LoadingAnimation /> }
                { !pending && this.renderContent() }
            </div>
        );
    }
}
