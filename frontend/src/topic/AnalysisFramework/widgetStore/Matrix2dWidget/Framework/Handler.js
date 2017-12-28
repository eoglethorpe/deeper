import update from '../../../../../public/utils/immutable-update';

export default class Handler {
    constructor(parent) {
        this.parent = parent;
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

        onChange(this.parent.state.data);

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
        onChange(newData);
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

        onChange(this.parent.state.data);

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
