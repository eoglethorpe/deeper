import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
    SortableList,
} from '../../../../../public/components/View';
import {
    DangerButton,
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';
import {
    TextInput,
    ColorInput,
} from '../../../../../public/components/Input';

import { iconNames } from '../../../../../common/constants';

import {
    randomString,
    getColorOnBgColor,
} from '../../../../../public/utils/common';

import update from '../../../../../public/utils/immutable-update';
import { afStringsSelector } from '../../../../../common/redux';
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

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
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

    componentWillMount() {
        const { onChange } = this.props;

        onChange(
            this.state.data,
            this.createFilters(this.state.data),
            this.createExportable(this.state.data),
            this.state.title,
        );
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            title: nextProps.title,
            data: nextProps.data,
        });
    }

    createFilters = (data) => {
        const { title, widgetKey } = this.props;

        const dimensionOptions = [];
        data.dimensions.forEach((dimension) => {
            dimensionOptions.push({
                label: dimension.title,
                key: dimension.id,
            });

            dimension.subdimensions.forEach((subdimension) => {
                dimensionOptions.push({
                    label: `${dimension.title} / ${subdimension.title}`,
                    key: subdimension.id,
                });
            });
        });

        const dimensionsFilter = {
            title: `${title} Dimensions`,
            widgetKey,
            key: `${widgetKey}-dimensions`,
            filterType: 'list',
            properties: {
                type: 'multiselect',
                options: dimensionOptions,
            },
        };

        const sectorOptions = [];
        data.sectors.forEach((sector) => {
            sectorOptions.push({
                label: sector.title,
                key: sector.id,
            });

            if (!sector.subsectors) {
                return;
            }
            sector.subsectors.forEach((subsector) => {
                sectorOptions.push({
                    label: `${sector.title} / ${subsector.title}`,
                    key: subsector.id,
                });
            });
        });

        const sectorsFilter = {
            title: `${title} Sectors`,
            widgetKey,
            key: `${widgetKey}-sectors`,
            filterType: 'list',
            properties: {
                type: 'multiselect',
                options: sectorOptions,
            },
        };
        return [
            dimensionsFilter,
            sectorsFilter,
        ];
    }

    createExportable = (data) => {
        const excel = {
            type: 'multiple',
            titles: ['Dimension', 'Subdimension', 'Sector', 'Subsectors'],
        };

        const report = {
            levels: data.sectors.map(sector => ({
                id: sector.id,
                title: sector.title,
                sublevels: data.dimensions.map(dimension => ({
                    id: `${sector.id}-${dimension.id}`,
                    title: dimension.title,
                    sublevels: dimension.subdimensions.map(subdimension => ({
                        id: `${sector.id}-${dimension.id}-${subdimension.id}`,
                        title: subdimension.title,
                    })),
                })),
            })),
        };

        return {
            widgetKey: this.props.widgetKey,
            data: {
                excel,
                report,
            },
        };
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
            this.createFilters(this.state.data),
            this.createExportable(this.state.data),
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
        const dimensionTypes = [
            this.props.afStrings('dimensionXLabel'),
            this.props.afStrings('dimensionYLabel'),
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

        return (
            <button
                key={data.id}
                onClick={() => { this.setState({ activeDimensionIndex: i }); }}
                className={classNames.join(' ')}
            >
                { data.title || this.props.afStrings('untiledDimensionTitle') }
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
                dragHandleModifier={this.renderDragHandle}
            />
        );
    }

    renderDragHandle = (key, data, index) => {
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

        const dimensionData = [data.sectors, data.dimensions];
        const dimension = dimensionData[activeDimensionTypeIndex][activeDimensionIndex];

        if (!dimension) {
            return (
                <div className={styles.empty}>
                    { this.props.afStrings('empty') }
                </div>
            );
        }

        const subdimensionData = [dimension.subsectors, dimension.subdimensions];
        const subdimension = subdimensionData[activeDimensionTypeIndex];

        const showColorConditions = [false, true];
        const showColorInput = showColorConditions[activeDimensionTypeIndex];

        return (
            <div className={styles['dimension-detail']}>
                <div className={styles['dimension-inputs']}>
                    <div className={styles.inputs}>
                        <TextInput
                            className={styles['text-input']}
                            label={this.props.afStrings('title')}
                            value={dimension.title}
                            showHintAndError={false}
                            onChange={(value) => { this.handleDimensionInputValueChange('title', value); }}
                            autoFocus
                        />
                        <TextInput
                            className={styles['text-input']}
                            label={this.props.afStrings('tooltip')}
                            value={dimension.tooltip}
                            showHintAndError={false}
                            onChange={(value) => { this.handleDimensionInputValueChange('tooltip', value); }}
                        />
                        {
                            showColorInput && (
                                <ColorInput
                                    className={styles['color-input']}
                                    label={this.props.afStrings('color')}
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
                        <h4>{ this.props.afStrings('subdimensions') }</h4>
                        <Button onClick={this.handleAddSubdimensionButtonClick}>
                            { this.props.afStrings('addSubdimensionButtonTitle') }
                        </Button>
                    </header>
                    <SortableList
                        className={styles.content}
                        data={subdimension}
                        modifier={this.renderSubdimension}
                        onChange={this.handleSubdimensionsSortChange}
                        sortableItemClass={styles['sub-dimensions']}
                        keyExtractor={Matrix2dOverview.rowKeyExtractor}
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

        return (
            <Modal className={styles['framework-overview-edit-modal']}>
                <ModalHeader title={this.props.afStrings('editModalTitle')} />
                <ModalBody className={styles.body}>
                    <header className={styles.header}>
                        <div className={styles.left}>
                            <TextInput
                                label={this.props.afStrings('title')}
                                showHintAndError={false}
                                value={title}
                                onChange={this.handleTitleInputValueChange}
                                autoFocus
                                selectOnFocus
                            />
                        </div>
                        <DimensionTypes />
                        <div className={styles.right}>
                            <Button onClick={this.handleAddDimensionButtonClick}>
                                { this.props.afStrings('addDimensionButtonTitle') }
                            </Button>
                        </div>
                    </header>
                    <div className={styles.content}>
                        <DimensionList />
                        <DimensionDetail />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.handleModalCancelButtonClick}>
                        { this.props.afStrings('cancelButtonTitle') }
                    </Button>
                    <PrimaryButton onClick={this.handleModalSaveButtonClick}>
                        { this.props.afStrings('saveButtonTitle') }
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
            <div styleName="framework-overview">
                <table styleName="table">
                    <TableHeader />
                    <TableBody />
                </table>
                <EditMatrixModal />
            </div>
        );
    }
}
