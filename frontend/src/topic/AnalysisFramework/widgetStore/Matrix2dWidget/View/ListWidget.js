import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';

import ListView from '../../../../../public/components/View/List/ListView';

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

@CSSModules(styles, { allowMultiple: true })
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
            className={styles['tag-unit']}
        >
            <div className={styles['tag-dimension']} >
                {data.dimension.title}

                <span className={styles['tag-sub-dimension']} >
                    {data.subdimension.title}
                </span>
            </div>
            <div
                className={styles['tag-sector']}
            >
                <span className={styles['sector-title']} >
                    {data.sector.title}
                </span>
                <ListView
                    className={styles['tag-sub-sector']}
                    data={data.subsectorsWithTitle || emptyList}
                    keyExtractor={Matrix2dList.rowKeyExtractor}
                    emptyComponent={'-'}
                    modifier={this.renderSubSector}
                />
            </div>
        </div>
    )

    renderSubSector = (key, data) => (
        <span
            key={key}
            className={styles['sub-sector']}
        >
            {data.title}
        </span>
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
                    emptyComponent={'-'}
                    styleName="list"
                />
            </div>
        );
    }
}
