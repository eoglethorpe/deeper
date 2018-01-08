import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import {
    LEAD_TYPE,
    LEAD_STATUS,
    leadAccessor,
} from '../../../../../../common/entities/lead';

import {
    iconNames,
} from '../../../../../../common/constants';

import {
    DangerButton,
} from '../../../../../../public/components/Action';

import styles from './styles.scss';

const propTypes = {
    active: PropTypes.bool,

    className: PropTypes.string,

    onClick: PropTypes.func.isRequired,

    lead: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    leadKey: PropTypes.string.isRequired,

    choice: PropTypes.string.isRequired,
    upload: PropTypes.object, // eslint-disable-line react/forbid-prop-types

    onRemove: PropTypes.func.isRequired,
    isRemoveDisabled: PropTypes.bool,
};

const defaultProps = {
    isRemoveDisabled: true,
    active: false,
    className: '',
    upload: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class LeadListItem extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.leadTypeToIconClassMap = {
            [LEAD_TYPE.drive]: iconNames.googleDrive,
            [LEAD_TYPE.dropbox]: iconNames.dropbox,
            [LEAD_TYPE.file]: iconNames.upload,
            [LEAD_TYPE.website]: iconNames.globe,
            [LEAD_TYPE.text]: iconNames.clipboard,
        };
    }

    getIconClassName(type) {
        return this.leadTypeToIconClassMap[type];
    }

    handleClick = () => {
        this.props.onClick(this.props.leadKey);
    }

    renderIcon = (choice) => {
        switch (choice) {
            case LEAD_STATUS.warning:
                return (
                    <span
                        styleName="status-icon warning"
                        className={iconNames.warning}
                    />
                );
            case LEAD_STATUS.requesting:
            case LEAD_STATUS.uploading:
                return (
                    <span
                        styleName="status-icon pending"
                        className={iconNames.loading}
                    />
                );
            case LEAD_STATUS.invalid:
                return (
                    <span
                        styleName="status-icon error"
                        className={iconNames.error}
                    />
                );
            case LEAD_STATUS.nonPristine:
                return (
                    <span
                        styleName="status-icon pristine"
                        className={iconNames.codeWorking}
                    />
                );
            case LEAD_STATUS.complete:
                return (
                    <span
                        styleName="status-icon complete"
                        className={iconNames.checkCircle}
                    />
                );
            default:
                return null;
        }
    }

    renderUploadProgress = (choice, upload = {}) => {
        const hide = choice !== LEAD_STATUS.uploading || !upload;
        return (
            <span
                styleName={`
                    progress-bar
                    ${upload.progress >= 100 ? 'completed' : ''}
                    ${hide ? 'hide' : ''}
                `}
            >
                <span
                    styleName="progress"
                    style={{
                        width: `${upload.progress}%`,
                    }}
                />
            </span>
        );
    }

    render() {
        const { active, className, isRemoveDisabled, onRemove, leadKey } = this.props;

        const { choice, upload, lead } = this.props;
        const type = leadAccessor.getType(lead);
        const { title } = leadAccessor.getValues(lead);

        return (
            <div styleName="lead-list-item">
                <button
                    key="lead-item"
                    styleName={`add-lead-list-item ${active ? 'active' : ''}`}
                    className={className}
                    onClick={this.handleClick}
                >
                    <span
                        styleName="icon"
                        className={this.getIconClassName(type)}
                    />
                    <span styleName="title" >
                        { title }
                    </span>
                    { this.renderIcon(choice) }
                    { this.renderUploadProgress(choice, upload) }
                </button>
                <DangerButton
                    key="remove-button"
                    styleName="remove-button"
                    disabled={isRemoveDisabled}
                    onClick={() => onRemove(leadKey)}
                >
                    Remove
                </DangerButton>
            </div>
        );
    }
}
