import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';

import update from '../../../vendor/react-store/utils/immutable-update';

import ColorInput from '../../../vendor/react-store/components/Input/ColorInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../../vendor/react-store/components/Action/Button/AccentButton';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import ListView from '../../../vendor/react-store/components/View/List/ListView';

import { randomString } from '../../../vendor/react-store/utils/common';

import { iconNames } from '../../../constants';
import BoundError from '../../../components/BoundError';
import { afStringsSelector } from '../../../redux';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: {},
};

const DragHandle = SortableHandle(() => (
    <span className={`${iconNames.hamburger} drag-handle`} />
));

const emptyList = [];
const emptyObject = {};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError
@connect(mapStateToProps)
@CSSModules(styles)
export default class ScaleFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static rowKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        const data = this.props.data || emptyObject;
        const scaleUnits = data.scaleUnits || emptyList;
        const defaultScaleUnit = data.value;
        const title = this.props.title;

        this.state = {
            showEditModal: false,
            defaultScaleUnit,
            scaleUnits,
            title,
        };
        this.props.editAction(this.handleEdit);
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            scaleUnits: arrayMove(this.state.scaleUnits, oldIndex, newIndex),
        });
    };

    getSelectedScaleStyle = (key) => {
        const { defaultScaleUnit } = this.state;
        const scaleUnitStyle = ['scale-unit'];
        if (defaultScaleUnit === key) {
            scaleUnitStyle.push('selected');
        }
        const styleNames = scaleUnitStyle.map(d => styles[d]);
        return styleNames.join(' ');
    }

    // TODO: fix this, don't make new objet
    getEditScaleUnits = (key, data, index) => (
        <this.SortableScaleUnit
            key={key}
            index={index}
            value={{ key, data }}
        />
    )

    getScale = (key, data) => (
        <button
            key={key}
            title={data.title}
            className={this.getSelectedScaleStyle(key)}
            style={{ backgroundColor: data.color }}
        />
    )

    createFilters = (attribute) => {
        const { title, widgetKey } = this.props;
        const { scaleUnits } = attribute;

        const filterOptions = scaleUnits.map(s => ({
            label: s.title,
            key: s.key,
        }));

        return [{
            title,
            widgetKey,
            key: widgetKey,
            filterType: 'list',
            properties: {
                type: 'multiselect-range',
                options: filterOptions,
            },
        }];
    }

    createExportable = () => {
        const excel = {
            title: this.props.title,
        };

        return {
            widgetKey: this.props.widgetKey,
            data: {
                excel,
            },
        };
    }

    SortableScaleUnit = SortableElement(({ value: { data, key } }) => {
        const { defaultScaleUnit } = this.state;
        let defaultIconName = iconNames.checkboxOutlineBlank;
        if (defaultScaleUnit === key) {
            defaultIconName = iconNames.checkbox;
        }

        return (
            <div
                className={`${styles['edit-scale-unit']} ${styles['draggable-item']}`}
                key={key}
            >
                <DragHandle />
                <ColorInput
                    label={this.props.afStrings('colorLabel')}
                    onChange={newColor => this.handleColorChange(newColor, key)}
                    value={data.color}
                    showHintAndError={false}
                />
                <TextInput
                    className={styles['title-input']}
                    label={this.props.afStrings('titleLabel')}
                    placeholder={this.props.afStrings('titlePlaceholderScale')}
                    onChange={(value) => { this.handleScaleUnitValueInputChange(key, value); }}
                    value={data.title}
                    showHintAndError={false}
                    autoFocus
                />
                <DangerButton
                    className={styles['delete-button']}
                    onClick={() => { this.handleScaleUnitRemoveButtonClick(key); }}
                    transparent
                >
                    <span className={iconNames.delete} />
                </DangerButton>
                <AccentButton
                    className={styles['check-button']}
                    onClick={() => { this.handleScaleSetDefaultButtonClick(key); }}
                    id={`${key}-check-button`}
                    transparent
                >
                    <label
                        className={styles.label}
                        htmlFor={`${key}-check-button`}
                    >
                        {this.props.afStrings('defaultButtonLabel')}
                    </label>
                    <span className={defaultIconName} />
                </AccentButton>
            </div>
        );
    })

    SortableList = SortableContainer(({ items: scaleUnits }) => {
        let additionalStyle = '';

        if (scaleUnits.length === 0) {
            additionalStyle = styles['no-items'];
        }

        return (
            <ListView
                className={`${styles.list} ${additionalStyle}`}
                data={scaleUnits}
                keyExtractor={ScaleFrameworkList.rowKeyExtractor}
                modifier={this.getEditScaleUnits}
            />
        );
    })

    handleScaleSetDefaultButtonClick = (key) => {
        this.setState({ defaultScaleUnit: key });
    }

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleAddScaleUnitButtonClick = () => {
        this.addScaleUnit();
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            scaleUnits: (this.props.data || emptyObject).scaleUnits || emptyList,
            title: this.props.title,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
        const { scaleUnits, title, defaultScaleUnit } = this.state;
        const newScaleUnits = {
            ...this.props.data,
            value: defaultScaleUnit,
            scaleUnits,
        };
        this.props.onChange(
            newScaleUnits,
            this.createFilters(newScaleUnits),
            this.createExportable(newScaleUnits),
            title,
        );
    }

    handleScaleWidgetTitleChange = (value) => {
        this.setState({ title: value });
    }

    handleScaleUnitValueInputChange = (key, value) => {
        const rowIndex = this.state.scaleUnits.findIndex(d => d.key === key);

        const settings = {
            [rowIndex]: {
                title: { $set: value },
            },
        };
        const newScaleUnits = update(this.state.scaleUnits, settings);

        this.setState({ scaleUnits: newScaleUnits });
    }

    handleScaleUnitRemoveButtonClick = (key) => {
        const { defaultScaleUnit } = this.state;
        const settings = {
            $filter: d => d.key !== key,
        };
        const newScaleUnits = update(this.state.scaleUnits, settings);
        if (defaultScaleUnit === key && newScaleUnits.length > 0) {
            const newDefaultScaleUnit = newScaleUnits[0].key;
            this.setState({ defaultScaleUnit: newDefaultScaleUnit });
        }
        this.setState({ scaleUnits: newScaleUnits });
    };

    handleColorChange = (newColor, key) => {
        const rowIndex = this.state.scaleUnits.findIndex(d => d.key === key);

        const settings = {
            [rowIndex]: {
                color: { $set: newColor },
            },
        };

        const newScaleUnits = update(this.state.scaleUnits, settings);

        this.setState({ scaleUnits: newScaleUnits });
    }

    addScaleUnit = () => {
        const { defaultScaleUnit } = this.state;
        let newDefaultScaleUnit = defaultScaleUnit;
        const newScaleUnit = {
            key: randomString(16).toLowerCase(),
            title: '',
            color: '#ffffff',
        };

        const rowIndexForDefault = this.state.scaleUnits.findIndex(s => s.key === defaultScaleUnit);
        if (rowIndexForDefault === -1) {
            newDefaultScaleUnit = newScaleUnit.key;
        }

        this.setState({
            defaultScaleUnit: newDefaultScaleUnit,
            scaleUnits: [
                ...this.state.scaleUnits,
                newScaleUnit,
            ],
        });
    }

    render() {
        const {
            scaleUnits,
            showEditModal,
            title,
        } = this.state;

        return (
            <div styleName="scale-list">
                <ListView
                    styleName="scale"
                    data={scaleUnits}
                    keyExtractor={ScaleFrameworkList.rowKeyExtractor}
                    modifier={this.getScale}
                />
                { showEditModal &&
                    <Modal
                        styleName="edit-scales-modal"
                        onClose={this.handleEditModalClose}
                    >
                        <ModalHeader
                            title={this.props.afStrings('editScaleModalTitle')}
                            rightComponent={
                                <PrimaryButton
                                    iconName={iconNames.add}
                                    onClick={this.handleAddScaleUnitButtonClick}
                                    transparent
                                >
                                    {this.props.afStrings('addscaleUnitButtonLabel')}
                                </PrimaryButton>
                            }
                        />
                        <ModalBody styleName="scale-modal-body">
                            <div styleName="general-info-container">
                                <TextInput
                                    className={styles['title-input']}
                                    label={this.props.afStrings('titleLabel')}
                                    placeholder={this.props.afStrings('titlePlaceholderScale')}
                                    onChange={this.handleScaleWidgetTitleChange}
                                    value={title}
                                    showHintAndError={false}
                                    autoFocus
                                    selectOnFocus
                                />
                            </div>
                            <div styleName="scale-units-container">
                                <this.SortableList
                                    items={scaleUnits}
                                    onSortEnd={this.onSortEnd}
                                    lockAxis="y"
                                    lockToContainerEdges
                                    useDragHandle
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                onClick={this.handleModalCancelButtonClick}
                            >
                                {this.props.afStrings('cancelButtonLabel')}
                            </Button>
                            <PrimaryButton
                                onClick={this.handleModalSaveButtonClick}
                            >
                                {this.props.afStrings('saveButtonLabel')}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        );
    }
}
