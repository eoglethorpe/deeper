import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '../../../../../common/constants';
import { randomString } from '../../../../../public/utils/common';

import {
    TransparentButton,
} from '../../../../../public/components/Action';

import update from '../../../../../public/utils/immutable-update';

import {
    ListView,
    List,
} from '../../../../../public/components/View';

import styles from './styles.scss';

import Renderer from './Renderer';
import Handler from './Handler';

import {
    getEditWidgetModal,
    getEditSectorsModal,
} from './modals';

const propTypes = {
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {
        title: undefined,
        sectors: [],
        dimensions: [],
    },
};

const emptyList = [];
const keyExtractor = d => d.id;

@CSSModules(styles, { allowMultiple: true })
export default class Matrix2dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.handler = new Handler(this);
        this.renderer = new Renderer(this);

        this.state = {
            data: props.data,
            showEditWidgetModal: false,
            showEditSectorsModal: false,
            selectedSectorIndex: 0,
        };

        const { editAction } = props;
        editAction(this.handler.widgetEdit);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            data: nextProps.data,
        });
    }

    getSettingsForInputValueChange = (base, i, key, value) => ({
        [base]: { $autoArray: {
            [i]: { $auto: {
                [key]: { $auto: {
                    $set: value,
                } },
            } },
        } },
    })

    getSettingsForRowRemoval = (base, i) => {
        const settings = {
            [base]: {
                $splice: [[i, 1]],
            },
        };

        return settings;
    }

    addSector = () => {
        const newSector = {
            id: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
            subsectors: [],
        };

        const settings = {
            sectors: {
                $autoPush: [newSector],
            },
        };

        this.updateData(settings);
    }

    addSubsector = () => {
        const {
            selectedSectorIndex,
        } = this.state;

        const newSubsector = {
            id: randomString(16).toLowerCase(),
            title: '',
        };

        const settings = {
            sectors: {
                [selectedSectorIndex]: {
                    subsectors: {
                        $autoPush: [newSubsector],
                    },
                },
            },
        };

        this.updateData(settings);
    }

    addDimension = () => {
        const newDimension = {
            id: randomString(16).toLowerCase(),
            title: '',
            tooltip: '',
            color: '#ffffff',
            subdimensions: [],
        };

        const settings = {
            dimensions: {
                $autoPush: [newDimension],
            },
        };

        this.updateData(settings);
    }

    updateData = (settings) => {
        const { data } = this.state;
        const newData = update(data, settings);

        this.setState({
            data: newData,
        });
    }

    render() {
        const {
            data,
        } = this.state;

        const {
            sectors = emptyList,
        } = data;

        return (
            <div styleName="framework-matrix-2d-overview">
                <div styleName="content">
                    <div styleName="row top-row">
                        <div styleName="blank" />
                        <div styleName="sectors">
                            <List
                                data={sectors}
                                modifier={this.renderer.sector}
                                keyExtractor={keyExtractor}
                            />
                            <TransparentButton
                                styleName="edit-sectors-button"
                                onClick={this.handler.editSectorsButtonClick}
                            >
                                <span className={iconNames.edit} />
                            </TransparentButton>
                        </div>
                    </div>
                    <div styleName="row">
                        <ListView
                            data={data.dimensions}
                            modifier={this.renderer.dimension}
                            styleName="dimensions"
                            keyExtractor={keyExtractor}
                        />
                        <div styleName="blank" />
                    </div>
                </div>
                { getEditWidgetModal(this) }
                { getEditSectorsModal(this) }
            </div>
        );
    }
}
