import PropTypes from 'prop-types';
import React from 'react';

import Modal from '../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../vendor/react-store/components/View/Modal/Footer';
import Button from '../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import SelectInput from '../../vendor/react-store/components/Input/SelectInput';
import MultiSelectInput from '../../vendor/react-store/components/Input/MultiSelectInput';
import ListInput from '../../vendor/react-store/components/Input/ListInput';
import FaramElement from '../../vendor/react-store/components/Input/Faram/FaramElement';

import RegionMap from '../RegionMap';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    geoOptionsByRegion: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    geoOptionsById: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    value: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    regions: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func,
    onApply: PropTypes.func,
    onCancel: PropTypes.func,
};

const defaultProps = {
    title: '',
    geoOptionsByRegion: {},
    geoOptionsById: {},
    value: [],
    onChange: undefined,
    onApply: undefined,
    onCancel: undefined,
};

@FaramElement('input')
export default class GeoModal extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // Selector for regions
    static regionKeySelector = d => d.id;
    static regionLabelSelector = d => d.title;

    // Selector for geo options
    static geoOptionKeySelector = option => option.key;
    static geoOptionLabelSelector = option => option.title;
    static geoOptionLongLabelSelector = option => option.label;

    constructor(props) {
        super(props);

        // Set default selectedRegion to the first region
        const { regions } = props;
        let selectedRegion;
        if (regions.length > 0) {
            selectedRegion = regions[0].id;
        }

        // Calculate state from initial value
        this.state = {
            ...this.calcValueState(props, selectedRegion),
            selectedRegion,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.value !== nextProps.value ||
            this.props.geoOptionsByRegion !== nextProps.geoOptionsByRegion
        ) {
            this.setState(this.calcValueState(nextProps, this.state.selectedRegion));
        }
    }

    // calcValueState = (props, selectedRegion)
    calcValueState = ({ value: originalValue, geoOptionsById }, selectedRegion) => {
        const adminLevels = {};
        const value = originalValue.filter(v => (
            geoOptionsById[v] &&
            geoOptionsById[v].region === selectedRegion
        ));

        const groupMap = value.reduce(
            (acc, v) => {
                const geoOption = geoOptionsById[v];
                if (!acc[geoOption.adminLevel]) {
                    acc[geoOption.adminLevel] = [v];
                    adminLevels[geoOption.adminLevel] = geoOption.adminLevelTitle;
                } else {
                    acc[geoOption.adminLevel].push(v);
                }
                return acc;
            },
            {},
        );

        const groupedValue = Object.entries(adminLevels).sort(l => l[0] - l[1]).map(
            al => ({
                level: al[0],
                title: al[1],
                value: groupMap[al[0]],
            }),
        );

        return {
            value,
            groupedValue,
            selectedRegion,
        };
    }

    handleCancelClick = () => {
        const { onCancel } = this.props;
        if (onCancel) {
            onCancel();
        }
    }

    handleApplyClick = () => {
        const { onApply } = this.props;
        if (onApply) {
            onApply();
        }
    }

    handleRegionChange = (selectedRegion) => {
        this.setState(this.calcValueState(this.props, selectedRegion));
    }

    handleRegionValueChange = (regionValue) => {
        const { onChange, value, geoOptionsById } = this.props;
        if (!onChange) {
            return;
        }
        const { selectedRegion } = this.state;
        const newValue = [
            ...value.filter(v => (
                geoOptionsById[v].region !== selectedRegion
            )),
            ...regionValue,
        ];
        onChange(newValue);
    }

    handleGroupValueChange = (adminLevel, groupValue) => {
        const { groupedValue } = this.state;
        const regionValue = groupedValue.reduce((acc, group) => {
            if (group.level === adminLevel) {
                return [...acc, ...groupValue];
            }

            return [...acc, ...group.value];
        }, []);

        this.handleRegionValueChange(regionValue);
    }

    geoValueLabelSelector = v => GeoModal.geoOptionLabelSelector(this.props.geoOptionsById[v]);
    geoValueKeySelector = v => v;

    renderGroupSelectionList = ({ selection }) => (
        <div className={styles.selectionGroup}>
            <div className={styles.title}>
                {selection.title}
            </div>
            <ListInput
                onChange={value => this.handleGroupValueChange(selection.level, value)}
                value={selection.value}
                labelSelector={this.geoValueLabelSelector}
                keySelector={this.geoValueKeySelector}
            />
        </div>
    )

    render() {
        const { regions, title, geoOptionsByRegion } = this.props;
        const { value, selectedRegion, groupedValue } = this.state;
        const GroupSelectionList = this.renderGroupSelectionList;

        return (
            <Modal className={styles.geoModal}>
                <ModalHeader
                    title={title}
                    rightComponent={
                        <div className={styles.selectInputs}>
                            <SelectInput
                                label="Region"
                                options={regions}
                                keySelector={GeoModal.regionKeySelector}
                                labelSelector={GeoModal.regionLabelSelector}
                                onChange={this.handleRegionChange}
                                value={selectedRegion}
                                showHintAndError={false}
                            />
                            <MultiSelectInput
                                label="Select geo areas"
                                options={geoOptionsByRegion[selectedRegion]}
                                labelSelector={GeoModal.geoOptionLongLabelSelector}
                                keySelector={GeoModal.geoOptionKeySelector}
                                onChange={this.handleRegionValueChange}
                                value={value}
                                showHintAndError={false}
                            />
                        </div>
                    }
                />
                <ModalBody className={styles.body}>
                    <RegionMap
                        className={styles.map}
                        regionId={selectedRegion}
                        onChange={this.handleRegionValueChange}
                        selections={value}
                    />
                    <div className={styles.right}>
                        {groupedValue.map(v => (
                            <GroupSelectionList
                                key={v.level}
                                selection={v}
                            />
                        ))}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleCancelClick} >
                        Cancel
                    </Button>
                    <PrimaryButton onClick={this.handleApplyClick} >
                        Apply
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }
}
