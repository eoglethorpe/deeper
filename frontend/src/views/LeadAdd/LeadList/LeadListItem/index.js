import PropTypes from 'prop-types';
import React from 'react';

import WarningButton from '../../../../vendor/react-store/components/Action/Button/WarningButton';
import { isTruthy } from '../../../../vendor/react-store/utils/common';

import {
    LEAD_TYPE,
    LEAD_STATUS,
    leadAccessor,
} from '../../../../entities/lead';
import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,

    leadKey: PropTypes.string.isRequired,

    lead: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    leadState: PropTypes.string.isRequired,
    upload: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    onClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,

    active: PropTypes.bool,
    isRemoveDisabled: PropTypes.bool,
};

const defaultProps = {
    active: false,
    isRemoveDisabled: true,
    className: '',
    upload: undefined,
};

export default class LeadListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static leadTypeToIconClassMap = {
        [LEAD_TYPE.drive]: iconNames.googleDrive,
        [LEAD_TYPE.dropbox]: iconNames.dropbox,
        [LEAD_TYPE.file]: iconNames.upload,
        [LEAD_TYPE.website]: iconNames.globe,
        [LEAD_TYPE.text]: iconNames.clipboard,
    };

    static styleMap = {
        [LEAD_STATUS.warning]: styles.warning,
        [LEAD_STATUS.requesting]: styles.pending,
        [LEAD_STATUS.uploading]: styles.pending,
        [LEAD_STATUS.invalid]: styles.error,
        [LEAD_STATUS.nonPristine]: styles.pristine,
        [LEAD_STATUS.complete]: styles.complete,
    };

    static iconMap = {
        [LEAD_STATUS.warning]: 'warning',
        [LEAD_STATUS.requesting]: 'loading',
        [LEAD_STATUS.uploading]: 'loading',
        [LEAD_STATUS.invalid]: 'error',
        [LEAD_STATUS.nonPristine]: 'codeWorking',
        [LEAD_STATUS.complete]: 'checkCircle',
    };

    static getIconClassName(type) {
        return LeadListItem.leadTypeToIconClassMap[type];
    }

    // HANDLE

    handleClick = () => {
        this.props.onClick(this.props.leadKey);
    }

    handleRemoveClick = () => {
        this.props.onRemove(this.props.leadKey);
    }

    // RENDER

    renderIcon = ({ leadState }) => {
        const classNames = [
            styles.statusIcon,
            styles[LeadListItem.styleMap[leadState]],
            iconNames[LeadListItem.iconMap[leadState]],
        ];
        const className = classNames.join(' ');

        return <span className={className} />;
    }

    renderUploadProgress = ({ leadState, upload = {} }) => {
        const hide = leadState !== LEAD_STATUS.uploading || !upload;

        const progress = isTruthy(upload.progress) ? upload.progress : 0;

        const classNames = [styles.progressBar];
        if (progress >= 100) {
            classNames.push(styles.completed);
        }
        if (hide) {
            classNames.push(styles.hide);
        }
        const className = classNames.join(' ');

        const style = { width: `${progress}%` };

        return (
            <span className={className}>
                <span
                    className={styles.progress}
                    style={style}
                />
            </span>
        );
    }

    render() {
        const {
            active,
            leadState,
            className,
            isRemoveDisabled,
            lead,
            upload,
        } = this.props;

        const type = leadAccessor.getType(lead);
        const { title } = leadAccessor.getValues(lead);

        const LeadListIcon = this.renderIcon;
        const UploadProgress = this.renderUploadProgress;

        return (
            <div className={styles.leadListItem}>
                <button
                    className={`${styles.addLeadListItem} ${active ? styles.active : ''} ${className}`}
                    onClick={this.handleClick}
                >
                    <span className={`${styles.icon} ${LeadListItem.getIconClassName(type)}`} />
                    <span className={styles.title} >
                        { title }
                    </span>
                    <LeadListIcon leadState={leadState} />
                    <UploadProgress
                        leadState={leadState}
                        upload={upload}
                    />
                </button>
                <WarningButton
                    className={styles.removeButton}
                    disabled={isRemoveDisabled}
                    onClick={this.handleRemoveClick}
                >
                    <i className={iconNames.delete} />
                </WarningButton>
            </div>
        );
    }
}
