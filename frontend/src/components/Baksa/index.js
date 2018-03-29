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


const propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.shape({
        type: PropTypes.string,
    }),
    showLabel: PropTypes.bool,
    showPageRange: PropTypes.bool,
    acceptUrl: PropTypes.string,
    urlLabel: PropTypes.string,
};

const defaultProps = {
    className: '',
    label: '',
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
        onChange({ startPage, endPage });
    }

    handleUrlChange = (url) => {
        this.setState({ url });
    }

    handleUrlAdd = () => {
        const { onChange, value: { startPage, endPage } } = this.props;
        const { url } = this.state;

        onChange({
            type: 'url',
            name: url,
            url,
            startPage,
            endPage,
        });
    }

    handleUpload = () => {
        const { onChange, value } = this.props;
        onChange({
            ...value,
            pending: true,
        });

        setTimeout(() => {
            const { startPage, endPage, file } = value;
            onChange({
                type: 'file',
                name: file.name,
                url: 'https://google.com',
                startPage,
                endPage,
                pending: false,
            });
        }, 3000);
    }

    handleFileChange = (files) => {
        const { onChange, value: { startPage, endPage } } = this.props;
        onChange({
            type: 'upload',
            file: files[0],
            startPage,
            endPage,
        });
    }

    handleStartPageChange = (startPage) => {
        const { onChange, value } = this.props;
        onChange({
            ...value,
            startPage,
        });
    }

    handleEndPageChange = (endPage) => {
        const { value, onChange } = this.props;
        onChange({
            ...value,
            endPage,
        });
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
                <div className={styles.urlBox}>
                    <TextInput
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
                <div className={styles.action}>
                    {pending && (
                        <span className={iconNames.loading} />
                    )}
                    {!pending && (
                        <PrimaryButton
                            iconName={iconNames.upload}
                            onClick={this.handleUpload}
                            transparent
                        />
                    )}
                    <DangerButton
                        iconName={iconNames.close}
                        onClick={this.resetValue}
                        transparent
                    />
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
                />
            </div>
        );
    }

    renderPageRange = () => {
        const { value: { startPage, endPage } } = this.props;

        return (
            <div className={styles.pageRange}>
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
                {value.type && showPageRange && <PageRange />}
                {!value.type && <DropFileInput />}
                {value.type === 'upload' && <Upload />}
                {value.type && value.type !== 'upload' && <Selection />}
            </div>
        );
    }
}
