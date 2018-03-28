import React from 'react';
import PropTypes from 'prop-types';

import WidgetEmptyComponent from '../../../components/WidgetEmptyComponent';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

import styles from './styles.scss';

const propTypes = {
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: {},
    attribute: {},
};

const emptyList = [];

@BoundError(WidgetError)
export default class Matrix2dList extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getSelectedSectors = (data, attribute) => {
        const selectedSectors = [];

        if (!attribute) {
            return selectedSectors;
        }

        data.dimensions.forEach((dimension) => {
            const dimensionAttribute = attribute[dimension.id];

            if (!dimensionAttribute) {
                return;
            }

            dimension.subdimensions.forEach((subdimension) => {
                const subdimensionAttribute = dimensionAttribute[subdimension.id];

                if (!subdimensionAttribute) {
                    return;
                }

                data.sectors.forEach((sector) => {
                    const sectorAttribute = subdimensionAttribute[sector.id];

                    if (!sectorAttribute) {
                        return;
                    }

                    const sectorAttributeWithTitle = sectorAttribute.map((d) => {
                        const index = sector.subsectors.findIndex(s => s.id === d);

                        return ({
                            key: d,
                            title: (sector.subsectors[index] || {}).title,
                        });
                    });

                    selectedSectors.push({
                        sector,
                        dimension,
                        subdimension,
                        subsectors: sectorAttribute,
                        subsectorsWithTitle: sectorAttributeWithTitle,
                        key: `${sector.id}-${dimension.id}-${subdimension.id}`,
                    });
                });
            });
        });
        return selectedSectors;
    }

    renderTagUnit = (key, data) => (
        <div
            key={key}
            className={styles.tagUnit}
        >
            <div className={styles.tagDimension} >
                <div className={styles.dimensionTitle}>
                    {data.dimension.title}
                </div>
                <div className={styles.subdimensionTitle}>
                    {data.subdimension.title}
                </div>
            </div>
            <div className={styles.tagSector}>
                <div className={styles.title}>
                    {data.sector.title}
                </div>
                <ListView
                    className={styles.tagSubSector}
                    data={data.subsectorsWithTitle || emptyList}
                    keyExtractor={Matrix2dList.rowKeyExtractor}
                    emptyComponent={WidgetEmptyComponent}
                    modifier={this.renderSubSector}
                />
            </div>
        </div>
    )

    renderSubSector = (key, data) => {
        const marker = '●';

        return (
            <div
                key={key}
                className={styles.subSector}
            >
                <div className={styles.marker}>
                    { marker }
                </div>
                <div className={styles.label}>
                    { data.title }
                </div>
            </div>
        );
    }

    render() {
        const { data, attribute } = this.props;
        const selectedSectors = this.getSelectedSectors(data, attribute);

        return (
            <ListView
                className={styles.list}
                keyExtractor={Matrix2dList.rowKeyExtractor}
                data={selectedSectors || emptyList}
                modifier={this.renderTagUnit}
                emptyComponent={WidgetEmptyComponent}
            />
        );
    }
}
