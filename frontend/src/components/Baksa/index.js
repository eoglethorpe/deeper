import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';
import iconNames from '../../vendor/react-store/constants/iconNames';
import DropZone from '../../vendor/react-store/components/Input/DropZone';
import FileInput from '../../vendor/react-store/components/Input/FileInput';
import TextInput from '../../vendor/react-store/components/Input/TextInput';
import NumberInput from '../../vendor/react-store/components/Input/NumberInput';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import DangerButton from '../../vendor/react-store/components/Action/Button/DangerButton';
import { UploadBuilder } from '../../vendor/react-store/utils/upload';

import {
    urlForUpload,
    createParamsForFileUpload,
} from '../../rest';


const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.shape({
        type: PropTypes.string,
    }),
    showLabel: PropTypes.bool,
    showPageRange: PropTypes.bool,
    acceptUrl: PropTypes.bool,
    urlLabel: PropTypes.string,

    disabled: PropTypes.bool,
    error: PropTypes.string,
    hint: PropTypes.string,
    showHintAndError: PropTypes.bool,
};

const defaultProps = {
    className: '',
    label: '',
    onChange: undefined,
    showLabel: true,
    value: {},
    showPageRange: false,
    acceptUrl: false,
    urlLabel: 'External link',

    disabled: false,
    error: '',
    hint: '',
    showHintAndError: true,
};

export default class Baksa extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static bothPageRequiredCondition = ({ startPage, endPage }) => {
        const ok = (startPage && endPage) ||
            (startPage === undefined && endPage === undefined);
        return {
            ok,
            message: 'Both start page and end page must be specified',
        };
    }

    static validPageRangeCondition = ({ startPage, endPage }) => {
        const ok = !startPage || !endPage || startPage <= endPage;
        return {
            ok,
            message: 'Start page must be less than end page',
        };
    }

    static validPageNumbersCondition = ({ startPage, endPage }) => {
        const ok = (startPage === undefined || startPage > 0) &&
            (endPage === undefined || endPage > 0);
        return {
            ok,
            message: 'Page numbers must be greater than 0',
        };
    }

    static pendingCondition = ({ type }) => {
        const ok = type !== 'upload';
        return {
            ok,
            message: 'File is being uploaded',
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            url: undefined,
        };
    }

    componentWillUnmount() {
        if (this.uploader) {
            this.uploader.stop();
        }
    }

    getClassName() {
        const { className, error, disabled } = this.props;

        const classNames = [
            className,
            'baksa',
            styles.baksa,
        ];

        if (error) {
            classNames.push('error');
            classNames.push(styles.error);
        }

        if (disabled) {
            classNames.push('disabled');
            classNames.push(styles.disabled);
        }

        return classNames.join(' ');
    }

    resetValue = () => {
        const { onChange, value: { startPage, endPage } } = this.props;
        if (onChange) {
            onChange({ startPage, endPage });
        }
    }

    handleUrlChange = (url) => {
        this.setState({ url });
    }

    handleUrlAdd = () => {
        const { onChange, value: { startPage, endPage } } = this.props;
        const { url } = this.state;

        // TODO: Check if url is valid

        if (onChange) {
            onChange({
                type: 'url',
                name: url,
                url,
                startPage,
                endPage,
            });
        }
    }

    handleFileChange = (files) => {
        const { onChange, value: { startPage, endPage } } = this.props;
        const file = files[0];

        if (!onChange) {
            return;
        }

        onChange({
            type: 'upload',
            file,
            startPage,
            endPage,
        });

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload())
            .success((response) => {
                onChange({
                    type: 'file',
                    id: response.id,
                    name: file.name,
                    url: response.file,
                    startPage,
                    endPage,
                });
            })
            .build();

        this.uploader.start();
    }

    handleStartPageChange = (startPage) => {
        const { onChange, value } = this.props;
        if (onChange) {
            onChange({
                ...value,
                startPage,
            });
        }
    }

    handleEndPageChange = (endPage) => {
        const { value, onChange } = this.props;
        if (onChange) {
            onChange({
                ...value,
                endPage,
            });
        }
    }

    renderLabel = () => {
        const {
            showLabel,
            label,
        } = this.props;

        if (!showLabel) {
            return null;
        }

        const classNames = [
            'label',
            styles.label,
        ];

        return (
            <div className={classNames.join(' ')}>
                { label }
            </div>
        );
    }

    renderDropFileInput = () => {
        const { acceptUrl, urlLabel, disabled } = this.props;
        const elements = [];

        // TODO: use string below:
        elements.push(
            <DropZone
                className={styles.dropZone}
                onDrop={this.handleFileChange}
                key="drop-zone"
                disabled={disabled}
            >
                {/* Empty value in FileInput below cancels the selection automatically */}
                <FileInput
                    className={styles.fileInput}
                    onChange={this.handleFileChange}
                    showStatus={false}
                    value=""
                    disabled={disabled}
                >
                    Drop a file or click to select
                </FileInput>
            </DropZone>,
        );

        if (acceptUrl) {
            elements.push(
                <div
                    className={styles.urlBox}
                    key="url-box"
                >
                    <TextInput
                        className={styles.urlInput}
                        label={urlLabel}
                        value={this.state.url}
                        onChange={this.handleUrlChange}
                        showHintAndError={false}
                        disabled={disabled}
                    />
                    <PrimaryButton
                        className={styles.action}
                        onClick={this.handleUrlAdd}
                        disabled={disabled}
                    >
                        Add
                    </PrimaryButton>
                </div>,
            );
        }

        return elements;
    }

    renderUpload = () => {
        const { value: { file } } = this.props;

        return (
            <div className={styles.upload}>
                <div>
                    { file.name }
                </div>
                <span className={`${styles.action} ${iconNames.loading} ${styles.loadingIcon}`} />
            </div>
        );
    }

    renderSelection = () => {
        const { value, disabled } = this.props;

        return (
            <div className={styles.selection}>
                <a href={value.url} target="_blank">
                    { value.name }
                </a>
                <DangerButton
                    className={styles.action}
                    iconName={iconNames.close}
                    onClick={this.resetValue}
                    disabled={disabled}
                    // FIXME: Use strings
                    title="Remove"
                    transparent
                />
            </div>
        );
    }

    renderPageRange = () => {
        const { value: { startPage, endPage }, disabled } = this.props;

        return (
            <div className={styles.pageRange}>
                <NumberInput
                    className={styles.page}
                    value={startPage}
                    onChange={this.handleStartPageChange}
                    disabled={disabled}
                    hint="Start Page"
                    separator=" "
                />
                <span className={styles.separator}>
                    to
                </span>
                <NumberInput
                    className={styles.page}
                    value={endPage}
                    onChange={this.handleEndPageChange}
                    disabled={disabled}
                    hint="End Page"
                    separator=" "
                />
            </div>
        );
    }

    renderHintAndError = () => {
        const {
            showHintAndError,
            hint,
            error,
        } = this.props;

        if (!showHintAndError) {
            return null;
        }

        if (error) {
            const classNames = [
                'error',
                styles.error,
            ];

            return (
                <p className={classNames.join(' ')}>
                    {error}
                </p>
            );
        }

        if (hint) {
            const classNames = [
                'hint',
                styles.hint,
            ];
            return (
                <p className={classNames.join(' ')}>
                    {hint}
                </p>
            );
        }

        const classNames = [
            'empty',
            styles.empty,
        ];
        return (
            <p className={classNames.join(' ')}>
                -
            </p>
        );
    }


    render() {
        const { value, showPageRange } = this.props;

        const Label = this.renderLabel;
        const DropFileInput = this.renderDropFileInput;
        const Upload = this.renderUpload;
        const Selection = this.renderSelection;
        const PageRange = this.renderPageRange;
        const HintAndError = this.renderHintAndError;

        return (
            <div className={this.getClassName()}>
                <Label />
                {!value.type && <DropFileInput />}
                {value.type === 'upload' && <Upload />}
                {value.type && value.type !== 'upload' && <Selection />}
                {value.type && showPageRange && <PageRange />}
                <HintAndError />
            </div>
        );
    }
}
