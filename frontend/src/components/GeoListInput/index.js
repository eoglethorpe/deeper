import PropTypes from 'prop-types';
import React from 'react';

import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import ListInput from '../../vendor/react-store/components/Input/ListInput';
import { iconNames } from '../../constants';

import GeoModal from '../GeoModal';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    onChange: PropTypes.func,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    className: '',
    title: '',
    onChange: undefined,
    geoOptionsByRegion: {},
    value: [],
    regions: [],
};

export default class GeoListInput extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // Calculate the mapping from id to options for all geo options
    // Useful for fast reference
    static calcGeoOptionsById = (geoOptionsByRegion) => {
        const geoOptionsById = {};
        Object.keys(geoOptionsByRegion).forEach((region) => {
            const options = geoOptionsByRegion[region];
            if (!options) {
                return;
            }

            options.forEach((geoOption) => {
                geoOptionsById[geoOption.key] = geoOption;
            }, {});
        });

        return geoOptionsById;
    }

    constructor(props) {
        super(props);

        // Calculate state from initial value
        this.geoOptionsById = GeoListInput.calcGeoOptionsById(props.geoOptionsByRegion);
        this.state = {
            modalValue: props.value,
            showModal: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.geoOptionsByRegion !== nextProps.geoOptionsByRegion) {
            this.geoOptionsById = GeoListInput.calcGeoOptionsById(nextProps.geoOptionsByRegion);
        }

        if (this.props.value !== nextProps.value) {
            this.setState({ modalValue: nextProps.value });
        }
    }

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.geoListInput,
            'geoListInput',
        ];

        return classNames.join(' ');
    }

    handleModalApply = () => {
        const { onChange } = this.props;
        const { modalValue } = this.state;
        this.setState({ showModal: false }, () => {
            if (onChange) {
                onChange(modalValue);
            }
        });
    }

    handleModalCancel = () => {
        const { value: modalValue } = this.props;
        this.setState({ showModal: false, modalValue });
    }

    handleModalValueChange = (modalValue) => {
        this.setState({ modalValue });
    }

    handleShowModal = () => {
        this.setState({ showModal: true });
    }

    valueLabelSelector = (v) => {
        const option = this.geoOptionsById[v];
        if (this.props.regions.length > 0) {
            return `${option.regionTitle} / ${option.label}`;
        }
        return option.label;
    }
    valueKeySelector = v => v;

    render() {
        const {
            title,
            regions,
            value,
            onChange,
            geoOptionsByRegion,
        } = this.props;
        const {
            showModal,
            modalValue,
        } = this.state;

        const titleClassName = `${styles.title} title`;
        const headerClassName = `${styles.header} header`;

        return (
            <div className={this.getClassName()}>
                <header className={headerClassName}>
                    <div className={titleClassName}>
                        { title }
                    </div>
                    <AccentButton
                        className={styles.action}
                        iconName={iconNames.map}
                        onClick={this.handleShowModal}
                        transparent
                    />
                </header>
                <ListInput
                    className={styles.listInput}
                    labelSelector={this.valueLabelSelector}
                    keySelector={this.valueKeySelector}
                    onChange={onChange}
                    value={value}
                />
                {showModal && (
                    <GeoModal
                        title={title}
                        regions={regions}
                        geoOptionsByRegion={geoOptionsByRegion}
                        geoOptionsById={this.geoOptionsById}
                        value={modalValue}
                        onChange={this.handleModalValueChange}
                        onApply={this.handleModalApply}
                        onCancel={this.handleModalCancel}
                    />
                )}
            </div>
        );
    }
}
