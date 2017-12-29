import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import update from '../../../../../public/utils/immutable-update';
import {
    ListView,
} from '../../../../../public/components/View';
import {
    SelectInput,
} from '../../../../../public/components/Input';

import styles from './styles.scss';

const propTypes = {
    id: PropTypes.number.isRequired,
    entryId: PropTypes.string.isRequired,
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    api: PropTypes.object.isRequired, // eslint-disable-line
    attribute: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    data: {},
    attribute: {},
};

const emptyList = [];

@CSSModules(styles, { allowMultiple: true })
export default class Matrix2dList extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static subsectorKeySelector = d => d.id;
    static subsectorLabelSelector = d => d.title;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getSelectedSectors = (data, attribute) => {
        const selectedSectors = [];

        data.dimensions.forEach((dimension) => {
            const dimensionAttribute = attribute[dimension.id];

            if (dimensionAttribute) {
                dimension.subdimensions.forEach((subdimension) => {
                    const subdimensionAttribute = dimensionAttribute[subdimension.id];

                    if (subdimensionAttribute) {
                        data.sectors.forEach((sector) => {
                            const sectorAttribute = subdimensionAttribute[sector.id];

                            if (sectorAttribute) {
                                selectedSectors.push({
                                    sector,
                                    dimension,
                                    subdimension,
                                    subsectors: sectorAttribute,
                                    key: `${sector.id}-${dimension.id}-${subdimension.id}`,
                                });
                            }
                        });
                    }
                });
            }
        });
        return selectedSectors;
    }

    handleSelectSubsectorChange = (dimensionId, subdimensionId, sectorId, subsectors) => {
        const {
            attribute,
            api,
            id,
            entryId,
        } = this.props;

        const settings = { $auto: {
            [dimensionId]: { $auto: {
                [subdimensionId]: { $auto: {
                    [sectorId]: { $auto: {
                        $set: subsectors,
                    } },
                } },
            } },
        } };

        const newAttribute = update(attribute, settings);

        api.getEntryModifier(entryId)
            .setAttribute(id, newAttribute)
            .apply();
    }

    renderTagUnit = (key, data) => (
        <div
            key={key}
            className={styles['tag-unit']}
        >
            <div className={styles['tag-dimension']} >
                {data.dimension.title}

                <span
                    className={styles['tag-sub-dimension']}
                >
                    {data.subdimension.title}
                </span>
            </div>
            <div
                className={styles['tag-sector']}
            >
                {data.sector.title}
                <SelectInput
                    className={styles['tag-sector-select']}
                    value={data.subsectors}
                    options={data.sector.subsectors}
                    keySelector={Matrix2dList.subsectorKeySelector}
                    labelSelector={Matrix2dList.subsectorLabelSelector}
                    onChange={subsectors => this.handleSelectSubsectorChange(
                        data.dimension.id,
                        data.subdimension.id,
                        data.sector.id,
                        subsectors,
                    )}
                    multiple
                />
            </div>
        </div>
    )

    render() {
        const { data, attribute } = this.props;
        const selectedSectors = this.getSelectedSectors(data, attribute);

        return (
            <div styleName="matrix-2d-list">
                <ListView
                    keyExtractor={Matrix2dList.rowKeyExtractor}
                    data={selectedSectors || emptyList}
                    modifier={this.renderTagUnit}
                    styleName="list"
                />
            </div>
        );
    }
}
