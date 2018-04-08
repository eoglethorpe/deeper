import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { LEAD_TYPE } from '../../entities/lead';
import {
    InternalGallery,
    ExternalGallery,
} from '../../components/DeepGallery';
import { entryStringsSelector } from '../../redux';

import styles from './styles.scss';

const propTypes = {
    entryStrings: PropTypes.func.isRequired,
    lead: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    handleScreenshot: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
});

@connect(mapStateToProps, undefined)
export default class LeadPreview extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static isTypeWithUrl = t => t === LEAD_TYPE.website;

    static isTypeWithAttachment = t => (
        [LEAD_TYPE.file, LEAD_TYPE.dropbox, LEAD_TYPE.drive].indexOf(t) !== 1
    );

    render() {
        const { lead } = this.props;
        const { sourceType: type, url, attachment } = lead;

        if (LeadPreview.isTypeWithUrl(type) && url) {
            return (
                <ExternalGallery
                    className={styles.preview}
                    url={url}
                    onScreenshotCapture={this.props.handleScreenshot}
                    showScreenshot
                    showUrl
                />
            );
        } else if (LeadPreview.isTypeWithAttachment(type) && attachment) {
            return (
                <InternalGallery
                    className={styles.preview}
                    galleryId={attachment.id}
                    onScreenshotCapture={this.props.handleScreenshot}
                    showScreenshot
                    showUrl
                />
            );
        }

        return (
            <div className={styles.emptyText}>
                <h1>
                    {this.props.entryStrings('previewNotAvailableText')}
                </h1>
            </div>
        );
    }
}
