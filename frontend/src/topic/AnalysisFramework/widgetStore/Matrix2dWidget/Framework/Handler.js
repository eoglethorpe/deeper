import update from '../../../../../public/utils/immutable-update';

export default class Handler {
    constructor(parent) {
        this.parent = parent;
    }

    createFilters = (data) => {
        const { title, widgetKey } = this.parent.props;

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
            widgetKey: this.parent.props.widgetKey,
            data: {
                excel,
                report,
            },
        };
    }

    widgetTitleInputChange = (value) => {
        const settings = {
            title: {
                $set: value,
            },
        };
        this.parent.updateData(settings);
    }

    editWidgetModalSaveButtonClick = () => {
        const {
            onChange,
        } = this.parent.props;

        onChange(
            this.parent.state.data,
            this.createFilters(this.parent.state.data),
            this.createExportable(this.parent.state.data),
        );

        this.parent.setState({
            showEditWidgetModal: false,
        });
    }

    editWidgetModalClose = () => {} // no-op

    addSectorButtonClick = () => {
        this.parent.addSector();
    }

    addDimensionButtonClick = () => {
        this.parent.addDimension();
    }

    editWidgetModalCancelButtonClick = () => {
        this.parent.setState({
            data: this.parent.props.data,
            showEditWidgetModal: false,
        });
    }

    sectorTitleInputChange = (i, value) => {
        const settings = this.parent.getSettingsForInputValueChange('sectors', i, 'title', value);
        this.parent.updateData(settings);
    }

    sectorTooltipInputChange = (i, value) => {
        const settings = this.parent.getSettingsForInputValueChange('sectors', i, 'tooltip', value);
        this.parent.updateData(settings);
    }

    dimensionTitleInputChange = (i, value) => {
        const settings = this.parent.getSettingsForInputValueChange('dimensions', i, 'title', value);
        this.parent.updateData(settings);
    }

    dimensionTooltipInputChange = (i, value) => {
        const settings = this.parent.getSettingsForInputValueChange('dimensions', i, 'tooltip', value);
        this.parent.updateData(settings);
    }

    dimensionColorInputChange = (i, { target: { value } }) => {
        const settings = this.parent.getSettingsForInputValueChange('dimensions', i, 'color', value);
        this.parent.updateData(settings);
    }

    removeSectorButtonClick = (i) => {
        const settings = this.parent.getSettingsForRowRemoval('sectors', i);
        this.parent.updateData(settings);
    }

    removeDimensionButtonClick = (i) => {
        const settings = this.parent.getSettingsForRowRemoval('dimensions', i);
        this.parent.updateData(settings);
    }

    editSectorsButtonClick = () => {
        this.parent.setState({
            showEditSectorsModal: true,
        });
    }

    editSectorsModalCancelButtonClick = () => {
        this.parent.setState({
            data: this.parent.props.data,
            showEditSectorsModal: false,
        });
    }

    dimensionChange = (id, value) => {
        const {
            data,
        } = this.parent.state;
        const {
            onChange,
        } = this.parent.props;

        const dimensionIndex = data.dimensions.findIndex(d => d.id === id);
        const settings = {
            dimensions: {
                [dimensionIndex]: {
                    $set: value,
                },
            },
        };

        const newData = update(data, settings);
        onChange(
            newData,
            this.createFilters(newData),
            this.createExportable(newData),
        );
    }

    widgetEdit = () => {
        this.parent.setState({
            showEditWidgetModal: true,
        });
    }

    subsectorTitleInputValueChange = (i, value) => {
        const { selectedSectorIndex } = this.parent.state;

        const settings = {
            sectors: {
                [selectedSectorIndex]: {
                    subsectors: {
                        [i]: {
                            title: {
                                $set: value,
                            },
                        },
                    },
                },
            },
        };

        this.parent.updateData(settings);
    }

    editSectorsModalSaveButtonClick = () => {
        const {
            onChange,
        } = this.parent.props;

        onChange(
            this.parent.state.data,
            this.createFilters(this.parent.state.data),
            this.createExportable(this.parent.state.data),
        );

        this.parent.setState({
            showEditSectorsModal: false,
        });
    }

    selectSectorButtonclick = (i) => {
        this.parent.setState({
            selectedSectorIndex: i,
        });
    }

    editSectorsModalClose = () => {}

    addSubsectorButtonClick = () => {
        this.parent.addSubsector();
    }
}
