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
import { isTruthy, isFalsy } from '../../vendor/react-store/utils/common';
import Input from '../../vendor/react-store/utils/input';

import {
    urlForUpload,
    createParamsForFileUpload,
    transformAndCombineResponseErrors,
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

@Input
export default class Baksa extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static bothPageRequiredCondition = (value) => {
        const ok = isFalsy(value) ||
            (isTruthy(value.startPage) && isTruthy(value.endPage)) ||
            (isFalsy(value.startPage) && isFalsy(value.endPage));
        return {
            ok,
            message: 'Both start page and end page must be specified',
        };
    }

    static validPageRangeCondition = (value) => {
        const ok = isFalsy(value)
            || isFalsy(value.startPage) || isFalsy(value.endPage)
            || value.startPage < value.endPage;
        return {
            ok,
            message: 'Start page must be less than end page',
        };
    }

    static validPageNumbersCondition = (value) => {
        const ok = isFalsy(value) || (
            (isFalsy(value.startPage) || value.startPage > 0) &&
            (isFalsy(value.endPage) || value.endPage > 0)
        );
        return {
            ok,
            message: 'Page numbers must be greater than 0',
        };
    }

    static pendingCondition = (value) => {
        const ok = isFalsy(value) || isFalsy(value.pending);
        return {
            ok,
            message: 'File is being uploaded',
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            url: undefined,
            pending: undefined,
            selectedFile: undefined,
            error: undefined,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value) {
            this.setState({ error: undefined });
        }
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
        const { onChange } = this.props;
        if (onChange) {
            onChange(undefined);
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

        // This is a hack
        onChange({
            pending: true,
        });

        this.setState({
            pending: true,
            selectedFile: file,
        });

        if (this.uploader) {
            this.uploader.stop();
        }

        this.uploader = new UploadBuilder()
            .file(file)
            .url(urlForUpload)
            .params(() => createParamsForFileUpload())
            .postLoad(() => this.setState({ pending: false }))
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
            .failure((response) => {
                const message = transformAndCombineResponseErrors(response.errors);
                this.setState({ error: message });
            })
            .fatal(() => {
                this.setState({ error: 'Couldn\t upload file' });
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
        const { selectedFile: file } = this.state;

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
            error: propsError,
        } = this.props;

        const { error: stateError } = this.state;
        const error = stateError || propsError;

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
        const { pending } = this.state;

        const Label = this.renderLabel;
        const DropFileInput = this.renderDropFileInput;
        const Upload = this.renderUpload;
        const Selection = this.renderSelection;
        const PageRange = this.renderPageRange;
        const HintAndError = this.renderHintAndError;

        return (
            <div className={this.getClassName()}>
                <Label />
                {pending && <Upload />}
                {!pending && !value.type && <DropFileInput />}
                {!pending && value.type && <Selection />}
                {!pending && value.type && showPageRange && <PageRange />}
                <HintAndError />
            </div>
        );
    }
}
