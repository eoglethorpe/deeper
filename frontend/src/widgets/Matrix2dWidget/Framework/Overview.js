import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ColorInput from '../../../vendor/react-store/components/Input/ColorInput';
import TextInput from '../../../vendor/react-store/components/Input/TextInput';
import Button from '../../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../../vendor/react-store/components/Action/Button/AccentButton';
import Modal from '../../../vendor/react-store/components/View/Modal';
import ModalHeader from '../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../vendor/react-store/components/View/Modal/Footer';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import SortableList from '../../../vendor/react-store/components/View/SortableList';

import { iconNames } from '../../../constants';

import {
    randomString,
    getColorOnBgColor,
} from '../../../vendor/react-store/utils/common';

import update from '../../../vendor/react-store/utils/immutable-update';
import { afStringsSelector } from '../../../redux';
import BoundError from '../../../components/BoundError';
import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string.isRequired,
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    data: {
        title: undefined,
        sectors: [],
        dimensions: [],
    },
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

const emptyList = [];

@BoundError
@connect(mapStateToProps)
export default class Matrix2dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.id;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            title: props.title,
            data: props.data,
            showEditModal: false,
            selectedSectorIndex: 0,
            activeDimensionTypeIndex: 0,
            activeDimensionIndex: 0,
        };

        const { editAction } = props;
        editAction(this.handleWidgetEdit);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            title: nextProps.title,
            data: nextProps.data,
        });
    }

    handleTitleInputValueChange = (value) => {
        this.setState({ title: value });
    }

    handleWidgetEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleModalCancelButtonClick = () => {
        const {
            data,
            title,
        } = this.props;

        this.setState({
            data,
            title,
            showEditModal: false,
        });
    }

    handleModalSaveButtonClick = () => {
        const { onChange } = this.props;

        onChange(
            this.state.data,
            this.state.title,
        );

        this.setState({
            showEditModal: false,
        });
    }

    handleRemoveSubdimensionButtonClick = (i) => {
        const dimensionTypes = [
            'sectors',
            'dimensions',
        ];

        const subdimensionTypes = [
            'subsectors',
            'subdimensions',
        ];

        const {
            activeDimensionTypeIndex,
            activeDimensionIndex,
            data: oldData,
        } = this.state;

        const currentDimensionType = dimensionTypes[activeDimensionTypeIndex];
        const currentSubdimensionType = subdimensionTypes[activeDimensionTypeIndex];

        const settings = {
            [currentDimensionType]: {
                [activeDimensionIndex]: {
                    [currentSubdimensionType]: {
                        $splice: [[i, 1]],
                    },
                },
            },
        };

        const data = update(oldData, settings);
        this.setState({ data });
    }

    handleRemoveDimensionButtonClick = () => {
        const dimensionTypes = [
            'sectors',
            'dimensions',
        ];

        const {
            activeDimensionTypeIndex,
            activeDimensionIndex,
            data: oldData,
        } = this.state;

        const currentDimensionType = dimensionTypes[activeDimensionTypeIndex];

        const settings = {
            [currentDimensionType]: {
                $splice: [[activeDimensionIndex, 1]],
            },
        };

        const data = update(oldData, settings);
        this.setState({ data });
    }

    handleDimensionInputValueChange = (key, value) => {
        const dimensionTypes = [
            'sectors',
            'dimensions',
        ];

        const {
            activeDimensionTypeIndex,
            activeDimensionIndex,
            data: oldData,
        } = this.state;

        const currentDimensionType = dimensionTypes[activeDimensionTypeIndex];

        const settings = {
            [currentDimensionType]: {
                [activeDimensionIndex]: {
                    [key]: {
                        $set: value,
                    },
                },
            },
        };

        const data = update(oldData, settings);
        this.setState({ data });
    }

    handleSubdimensionInputValueChange = (i, key, value) => {
        const dimensionTypes = [
            'sectors',
            'dimensions',
        ];

        const subdimensionTypes = [
            'subsectors',
            'subdimensions',
        ];

        const {
            activeDimensionTypeIndex,
            activeDimensionIndex,
            data: oldData,
        } = this.state;

        const currentDimensionType = dimensionTypes[activeDimensionTypeIndex];
        const currentSubdimensionType = subdimensionTypes[activeDimensionTypeIndex];

        const settings = {
            [currentDimensionType]: {
                [activeDimensionIndex]: {
                    [currentSubdimensionType]: {
                        [i]: {
                            [key]: {
                                $set: value,
                            },
                        },
                    },
                },
            },
        };

        const data = update(oldData, settings);
        this.setState({ data });
    }

    handleDimensionListSortChange = (newData) => {
        const dimensionTypes = [
            'sectors',
            'dimensions',
        ];

        const {
            activeDimensionTypeIndex,
            activeDimensionIndex,
            data: oldData,
        } = this.state;

        const currentDimensionType = dimensionTypes[activeDimensionTypeIndex];

        const dimensions = oldData[currentDimensionType];
        const activeDimensionId = dimensions[activeDimensionIndex].id;

        const newActiveDimensionIndex = newData.findIndex(d => d.id === activeDimensionId);

        const settings = {
            [currentDimensionType]: {
                $set: newData,
            },
        };

        const data = update(oldData, settings);
        this.setState({
            data,
            activeDimensionIndex: newActiveDimensionIndex,
        });
    }

    handleSubdimensionsSortChange = (newData) => {
        const dimensionTypes = [
            'sectors',
            'dimensions',
        ];

        const subdimensionTypes = [
            'subsectors',
            'subdimensions',
        ];

        const {
            activeDimensionTypeIndex,
            activeDimensionIndex,
            data: oldData,
        } = this.state;

        const currentDimensionType = dimensionTypes[activeDimensionTypeIndex];
        const currentSubdimensionType = subdimensionTypes[activeDimensionTypeIndex];

        const settings = {
            [currentDimensionType]: {
                [activeDimensionIndex]: {
                    [currentSubdimensionType]: {
                        $set: newData,
                    },
                },
            },
        };

        const data = update(oldData, settings);
        this.setState({ data });
    }

    handleAddDimensionButtonClick = () => {
        const dimensionTypes = [
            'sectors',
            'dimensions',
        ];

        const {
            activeDimensionTypeIndex,
            data: oldData,
        } = this.state;

        const dimensionData = {
            id: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
        };

        const newDimensionDataList = [
            {
                ...dimensionData,
                subsectors: emptyList,
            },
            {
                ...dimensionData,
                color: '#ffffff',
                subdimensions: emptyList,
            },
        ];

        const newDimensionData = newDimensionDataList[activeDimensionTypeIndex];

        const currentDimensionType = dimensionTypes[activeDimensionTypeIndex];

        const settings = {
            [currentDimensionType]: {
                $autoPush: [newDimensionData],
            },
        };

        const data = update(oldData, settings);
        this.setState({
            data,
            activeDimensionIndex: data[currentDimensionType].length - 1,
        });
    }

    handleAddSubdimensionButtonClick = () => {
        const dimensionTypes = [
            'sectors',
            'dimensions',
        ];

        const subdimensionTypes = [
            'subsectors',
            'subdimensions',
        ];

        const {
            activeDimensionTypeIndex,
            activeDimensionIndex,
            data: oldData,
        } = this.state;

        const newSubdimension = {
            id: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
        };
        const currentDimensionType = dimensionTypes[activeDimensionTypeIndex];
        const currentSubdimensionType = subdimensionTypes[activeDimensionTypeIndex];

        const settings = {
            [currentDimensionType]: {
                [activeDimensionIndex]: {
                    [currentSubdimensionType]: {
                        $autoPush: [newSubdimension],
                    },
                },
            },
        };

        const data = update(oldData, settings);
        this.setState({ data });
    }

    renderHeader = () => {
        const {
            sectors,
        } = this.props.data;

        const renderSectors = [
            { id: 'blank1', title: '' },
            { id: 'blank2', title: '' },
            ...sectors,
        ];

        return (
            <thead>
                <tr>
                    {
                        renderSectors.map(sector => (
                            <th
                                key={sector.id}
                                className={styles.sector}
                            >
                                {sector.title}
                            </th>
                        ))
                    }
                </tr>
            </thead>
        );
    }

    renderBody = () => {
        const {
            dimensions,
            sectors,
        } = this.props.data;

        return (
            <tbody>
                {
                    dimensions.map((dimension) => {
                        const rowStyle = {
                            backgroundColor: dimension.color,
                            color: getColorOnBgColor(dimension.color),
                        };

                        return (
                            dimension.subdimensions.map((subdimension, i) => (
                                <tr
                                    style={rowStyle}
                                    key={subdimension.id}
                                >
                                    {
                                        i === 0 && (
                                            <td
                                                className={styles['dimension-td']}
                                                rowSpan={dimension.subdimensions.length}
                                                title={dimension.tooltip}
                                            >
                                                {dimension.title}
                                            </td>
                                        )
                                    }
                                    <td
                                        className={styles.subdimension}
                                        title={subdimension.tooltip}
                                    >
                                        {subdimension.title}
                                    </td>
                                    { sectors.map(sector => <td key={sector.id} />) }
                                </tr>
                            ))
                        );
                    })
                }
            </tbody>
        );
    }

    renderDimensionTypeListItem = (key, data, i) => {
        const { activeDimensionTypeIndex } = this.state;
        const classNames = [styles.tab];

        if (activeDimensionTypeIndex === i) {
            classNames.push(styles.active);
        }

        return (
            <button
                key={data}
                onClick={() => {
                    this.setState({
                        activeDimensionTypeIndex: i,
                        activeDimensionIndex: 0,
                    });
                }}
                className={classNames.join(' ')}
            >
                { data }
            </button>
        );
    }

    renderDimensionTypes = () => {
        const { afStrings } = this.props;
        const dimensionTypes = [
            afStrings('dimensionXLabel'),
            afStrings('dimensionYLabel'),
        ];

        return (
            <ListView
                className={styles['dimension-type-list']}
                data={dimensionTypes}
                modifier={this.renderDimensionTypeListItem}
            />
        );
    }

    renderDimensionListItem = (key, data, i) => {
        const { activeDimensionIndex } = this.state;
        const classNames = [styles['dimension-tab']];

        if (activeDimensionIndex === i) {
            classNames.push(styles.active);
        }

        const { afStrings } = this.props;
        const untitled = afStrings('untitledDimensionTitle');

        return (
            <button
                key={data.id}
                onClick={() => { this.setState({ activeDimensionIndex: i }); }}
                className={classNames.join(' ')}
            >
                { data.title || untitled }
            </button>
        );
    }

    renderDimensionList = () => {
        const {
            data,
            activeDimensionTypeIndex,
        } = this.state;

        const dimensionData = [data.sectors, data.dimensions];

        return (
            <SortableList
                className={styles['dimension-list']}
                data={dimensionData[activeDimensionTypeIndex]}
                modifier={this.renderDimensionListItem}
                onChange={this.handleDimensionListSortChange}
                sortableItemClass={styles['dimension-list-item']}
                keyExtractor={Matrix2dOverview.rowKeyExtractor}
                dragHandleModifier={this.renderDimensionDragHandle}
            />
        );
    }

    renderDimensionDragHandle = (key, data, index) => {
        const { activeDimensionIndex } = this.state;
        const dragStyle = [styles['drag-handle']];
        if (activeDimensionIndex === index) {
            dragStyle.push(styles.active);
        }
        return (
            <span className={`${iconNames.hamburger} ${dragStyle.join(' ')}`} />
        );
    };

    renderSubDimensionDragHandle = () => {
        const dragStyle = [styles['drag-handle']];
        return (
            <span className={`${iconNames.hamburger} ${dragStyle.join(' ')}`} />
        );
    };

    renderDimensionDragHandle = (key, data, index) => {
        const { activeDimensionIndex } = this.state;
        const dragStyle = [styles['drag-handle']];
        if (activeDimensionIndex === index) {
            dragStyle.push(styles.active);
        }
        return (
            <span className={`${iconNames.hamburger} ${dragStyle.join(' ')}`} />
        );
    };

    renderSubdimension = (key, data, i) => (
        <div
            className={styles['sub-dimension-inputs']}
            key={data.id}
        >
            <div className={styles.inputs}>
                <TextInput
                    label={this.props.afStrings('title')}
                    value={data.title}
                    showHintAndError={false}
                    onChange={(value) => { this.handleSubdimensionInputValueChange(i, 'title', value); }}
                    autoFocus
                />
                <TextInput
                    label={this.props.afStrings('tooltip')}
                    value={data.tooltip}
                    showHintAndError={false}
                    onChange={(value) => { this.handleSubdimensionInputValueChange(i, 'tooltip', value); }}
                />
            </div>
            <div className={styles.actions}>
                <DangerButton
                    onClick={() => {
                        this.handleRemoveSubdimensionButtonClick(i);
                    }}
                    iconName={iconNames.delete}
                />
            </div>
        </div>
    )

    renderDimensionDetail = () => {
        const {
            data,
            activeDimensionTypeIndex,
            activeDimensionIndex,
        } = this.state;

        const { afStrings } = this.props;

        const dimensionData = [data.sectors, data.dimensions];
        const dimension = dimensionData[activeDimensionTypeIndex][activeDimensionIndex];

        if (!dimension) {
            return (
                <div className={styles.empty}>
                    { afStrings('empty') }
                </div>
            );
        }

        const subdimensionData = [dimension.subsectors, dimension.subdimensions];
        const subdimension = subdimensionData[activeDimensionTypeIndex];

        const showColorConditions = [false, true];
        const showColorInput = showColorConditions[activeDimensionTypeIndex];

        const titleInputLabel = afStrings('title');
        const tooltipInputLabel = afStrings('tooltip');
        const colorInputLabel = afStrings('color');
        const subdimensionsTitle = afStrings('subdimensions');
        const addSubdimensionButtonTitle = afStrings('addSubdimensionButtonTitle');

        return (
            <div className={styles['dimension-detail']}>
                <div className={styles['dimension-inputs']}>
                    <div className={styles.inputs}>
                        <TextInput
                            className={styles['text-input']}
                            label={titleInputLabel}
                            value={dimension.title}
                            showHintAndError={false}
                            onChange={(value) => { this.handleDimensionInputValueChange('title', value); }}
                            autoFocus
                        />
                        <TextInput
                            className={styles['text-input']}
                            label={tooltipInputLabel}
                            value={dimension.tooltip}
                            showHintAndError={false}
                            onChange={(value) => { this.handleDimensionInputValueChange('tooltip', value); }}
                        />
                        {
                            showColorInput && (
                                <ColorInput
                                    className={styles['color-input']}
                                    label={colorInputLabel}
                                    value={dimension.color}
                                    showHintAndError={false}
                                    onChange={(value) => { this.handleDimensionInputValueChange('color', value); }}
                                />
                            )
                        }
                    </div>
                    <div className={styles.actions}>
                        <DangerButton
                            onClick={this.handleRemoveDimensionButtonClick}
                            iconName={iconNames.delete}
                        />
                    </div>
                </div>
                <div className={styles['subdimension-detail']}>
                    <header className={styles.header}>
                        <h4>{ subdimensionsTitle }</h4>
                        <AccentButton
                            onClick={this.handleAddSubdimensionButtonClick}
                            transparent
                        >
                            { addSubdimensionButtonTitle }
                        </AccentButton>
                    </header>
                    <SortableList
                        className={styles.content}
                        data={subdimension}
                        modifier={this.renderSubdimension}
                        onChange={this.handleSubdimensionsSortChange}
                        sortableItemClass={styles['sub-dimensions']}
                        keyExtractor={Matrix2dOverview.rowKeyExtractor}
                        dragHandleModifier={this.renderSubDimensionDragHandle}
                    />
                </div>
            </div>
        );
    }

    renderModal = () => {
        const {
            showEditModal,
            title,
        } = this.state;

        if (!showEditModal) {
            return null;
        }

        const DimensionTypes = this.renderDimensionTypes;
        const DimensionList = this.renderDimensionList;
        const DimensionDetail = this.renderDimensionDetail;

        const { afStrings } = this.props;
        const editModalTitle = afStrings('editModalTitle');
        const addDimensionButtonTitle = afStrings('addDimensionButtonTitle');
        const titleInputLabel = afStrings('title');
        const cancelButtonTitle = afStrings('cancelButtonTitle');
        const saveButtonTitle = afStrings('saveButtonTitle');

        return (
            <Modal className={styles['overview-edit-modal']}>
                <ModalHeader title={editModalTitle} />
                <ModalBody className={styles.body}>
                    <header className={styles.header}>
                        <div className={styles.left}>
                            <TextInput
                                label={titleInputLabel}
                                showHintAndError={false}
                                value={title}
                                onChange={this.handleTitleInputValueChange}
                                autoFocus
                                selectOnFocus
                            />
                        </div>
                        <DimensionTypes />
                        <div className={styles.right}>
                            <AccentButton
                                onClick={this.handleAddDimensionButtonClick}
                                transparent
                            >
                                { addDimensionButtonTitle }
                            </AccentButton>
                        </div>
                    </header>
                    <div className={styles.content}>
                        <DimensionList />
                        <DimensionDetail />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleModalCancelButtonClick}>
                        { cancelButtonTitle }
                    </Button>
                    <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                        { saveButtonTitle }
                    </PrimaryButton>
                </ModalFooter>
            </Modal>
        );
    }

    render() {
        const TableHeader = this.renderHeader;
        const TableBody = this.renderBody;
        const EditMatrixModal = this.renderModal;

        return (
            <div className={styles.overview}>
                <table className={styles.table}>
                    <TableHeader />
                    <TableBody />
                </table>
                <EditMatrixModal />
            </div>
        );
    }
}
