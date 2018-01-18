import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { SketchPicker } from 'react-color';
import {
    SortableContainer,
    SortableElement,
    SortableHandle,
    arrayMove,
} from 'react-sortable-hoc';

import update from '../../../../../public/utils/immutable-update';

import {
    TextInput,
} from '../../../../../public/components/Input';
import {
    TransparentPrimaryButton,
    TransparentDangerButton,
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
} from '../../../../../public/components/View';
import {
    iconNames,
    afStrings,
} from '../../../../../common/constants';
import { randomString } from '../../../../../public/utils/common';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    widgetKey: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
};

const DragHandle = SortableHandle(() => (
    <span className={`${iconNames.hamburger} drag-handle`} />
));

const emptyList = [];
const emptyObject = {};

@CSSModules(styles)
export default class ScaleFrameworkList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static rowKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        const scaleUnits = (this.props.data || emptyObject).scaleUnits || emptyList;
        const title = this.props.title;

        this.state = {
            showEditModal: false,
            activeScaleUnit: scaleUnits[0] || emptyObject,
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

    getActiveSelectionStyle = (key) => {
        const { activeScaleUnit } = this.state;
        const scaleUnitStyle = ['edit-scale-unit', 'draggable-item'];
        if (activeScaleUnit.key === key) {
            scaleUnitStyle.push('active');
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
            className={styles['scale-unit']}
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

    SortableScaleUnit = SortableElement(({ value: { data, key } }) => (
        <div
            className={this.getActiveSelectionStyle(key)}
            key={key}
        >
            <DragHandle />
            <div className={styles['color-box-container']}>
                <span className={styles['color-label']}>{afStrings.colorLabel}</span>
                <button
                    className={styles['color-box']}
                    onClick={() => this.handleColorBoxClick(key)}
                    style={{ backgroundColor: data.color }}
                />
            </div>
            <TextInput
                className={styles['title-input']}
                label={afStrings.titleLabel}
                placeholder={afStrings.titlePlaceholderScale}
                onChange={(value) => { this.handleScaleUnitValueInputChange(key, value); }}
                onFocus={() => this.handleTextInputOnFocus(key)}
                value={data.title}
                showHintAndError={false}
                autoFocus
            />
            <TransparentDangerButton
                className={styles['delete-button']}
                onClick={() => { this.handleScaleUnitRemoveButtonClick(key); }}
            >
                <span className={iconNames.delete} />
            </TransparentDangerButton>
        </div>
    ))

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

    handleTextInputOnFocus = (key) => {
        const { scaleUnits } = this.state;
        const index = scaleUnits.findIndex(d => d.key === key);

        this.setState({
            activeScaleUnit: scaleUnits[index],
        });
    }

    handleColorBoxClick = (key) => {
        const { scaleUnits } = this.state;
        const index = scaleUnits.findIndex(d => d.key === key);

        this.setState({
            activeScaleUnit: scaleUnits[index],
        });
    }

    handleEdit = () => {
        this.setState({
            showEditModal: true,
            activeScaleUnit: this.state.scaleUnits[0] || emptyObject,
        });
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
        const { scaleUnits, title } = this.state;
        const newScaleUnits = {
            ...this.props.data,
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

        this.setState({
            scaleUnits: newScaleUnits,
            activeScaleUnit: newScaleUnits[rowIndex],
        });
    }

    handleScaleUnitRemoveButtonClick = (key) => {
        const settings = {
            $filter: d => d.key !== key,
        };
        const newScaleUnits = update(this.state.scaleUnits, settings);
        this.setState({
            scaleUnits: newScaleUnits,
            activeScaleUnit: newScaleUnits[0] || emptyObject,
        });
    };

    handleColorChange = (newColor) => {
        const { activeScaleUnit } = this.state;
        const rowIndex = this.state.scaleUnits.findIndex(d => d.key === activeScaleUnit.key);

        const settings = {
            [rowIndex]: {
                color: { $set: newColor.hex },
            },
        };

        const newScaleUnits = update(this.state.scaleUnits, settings);

        this.setState({
            scaleUnits: newScaleUnits,
            activeScaleUnit: newScaleUnits[rowIndex],
        });
    }

    addScaleUnit = () => {
        const newScaleUnit = {
            key: randomString(16).toLowerCase(),
            title: '',
            color: '#ffffff',
        };

        this.setState({
            scaleUnits: [
                ...this.state.scaleUnits,
                newScaleUnit,
            ],
            activeScaleUnit: newScaleUnit,
        });
    }

    render() {
        const {
            scaleUnits,
            showEditModal,
            activeScaleUnit,
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
                            title={afStrings.editScaleModalTitle}
                            rightComponent={
                                <TransparentPrimaryButton
                                    iconName={iconNames.add}
                                    onClick={this.handleAddScaleUnitButtonClick}
                                >
                                    {afStrings.addscaleUnitButtonLabel}
                                </TransparentPrimaryButton>
                            }
                        />
                        <ModalBody styleName="scale-modal-body">
                            <div styleName="general-info-container">
                                <TextInput
                                    className={styles['title-input']}
                                    label={afStrings.titleLabel}
                                    placeholder={afStrings.titlePlaceholderScale}
                                    onChange={this.handleScaleWidgetTitleChange}
                                    value={title}
                                    showHintAndError={false}
                                    autoFocus
                                />
                            </div>
                            <div styleName="scale-units-container">
                                { scaleUnits.length > 0 &&
                                    <SketchPicker
                                        color={activeScaleUnit.color}
                                        onChange={this.handleColorChange}
                                    />
                                }
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
                                {afStrings.cancelButtonLabel}
                            </Button>
                            <PrimaryButton
                                onClick={this.handleModalSaveButtonClick}
                            >
                                {afStrings.saveButtonLabel}
                            </PrimaryButton>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        );
    }
}
