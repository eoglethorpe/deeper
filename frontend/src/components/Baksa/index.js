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
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
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
};

export default class Baksa extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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
        const { className } = this.props;
        const classNames = [
            className,
            'baksa', // FIXME
            styles.baksa,
        ];

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
            pending: true,
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
                    pending: false,
                });
            })
            .progress((progress) => {
                console.warn(progress);
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
        const { acceptUrl, urlLabel } = this.props;

        const elements = [];

        // TODO: use string below:
        elements.push(
            <DropZone
                className={styles.dropZone}
                onDrop={this.handleFileChange}
                key="drop-zone"
            >
                {/* Empty value in FileInput below cancels the selection automatically */}
                <FileInput
                    onChange={this.handleFileChange}
                    showStatus={false}
                    value=""
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
                    />
                    <PrimaryButton
                        className={styles.action}
                        onClick={this.handleUrlAdd}
                    >
                        Add
                    </PrimaryButton>
                </div>,
            );
        }

        return elements;
    }

    renderUpload = () => {
        const { value: { file, pending } } = this.props;

        return (
            <div className={styles.upload}>
                <div>
                    { file.name }
                </div>
                {pending && <LoadingAnimation />}
                <div className={styles.action}>
                    {!pending && (
                        <DangerButton
                            iconName={iconNames.close}
                            onClick={this.resetValue}
                            transparent
                        >
                            Clear
                        </DangerButton>
                    )}
                </div>
            </div>
        );
    }

    renderSelection = () => {
        const { value } = this.props;

        return (
            <div className={styles.selection}>
                <a href={value.url} target="_blank">
                    { value.name }
                </a>
                <DangerButton
                    className={styles.action}
                    iconName={iconNames.close}
                    onClick={this.resetValue}
                    transparent
                >
                    Clear
                </DangerButton>
            </div>
        );
    }

    renderPageRange = () => {
        const { value: { startPage, endPage } } = this.props;

        return (
            <div className={styles.pageRange}>
                <div className={styles.label}>
                    Choose page range
                </div>
                <div className={styles.inputs}>
                    <NumberInput
                        className={styles.page}
                        value={startPage}
                        onChange={this.handleStartPageChange}
                    />
                    <span className={styles.separator}>
                        to
                    </span>
                    <NumberInput
                        className={styles.page}
                        value={endPage}
                        onChange={this.handleEndPageChange}
                    />
                </div>
            </div>
        );
    }

    render() {
        const { value, showPageRange } = this.props;

        const Label = this.renderLabel;
        const DropFileInput = this.renderDropFileInput;
        const Upload = this.renderUpload;
        const Selection = this.renderSelection;
        const PageRange = this.renderPageRange;

        return (
            <div className={this.getClassName()}>
                <Label />
                {!value.type && <DropFileInput />}
                {value.type === 'upload' && <Upload />}
                {value.type && value.type !== 'upload' && <Selection />}
                {value.type && showPageRange && <PageRange />}
            </div>
        );
    }
}
