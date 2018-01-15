import React from 'react';

import {
    iconNames,
    afStrings,
} from '../../../../../common/constants';

import {
    TransparentDangerButton,
} from '../../../../../public/components/Action';

import {
    TextInput,
} from '../../../../../public/components/Input';

import Dimension from './Dimension';

import styles from './styles.scss';

export default class Renderer {
    constructor(parent) {
        this.parent = parent;
        this.handler = parent.handler;
    }

    editSector = (key, data, i) => (
        <div
            key={data.id}
            className={styles['edit-sector']}
        >
            <TextInput
                label={afStrings.dimensionXTitleLabel}
                placeholder={afStrings.dimensionXTitlePlaceholder}
                onChange={(value) => { this.handler.sectorTitleInputChange(i, value); }}
                showHintAndError={false}
                value={data.title}
                autoFocus
            />
            <TextInput
                label={afStrings.tooltipTitle}
                onChange={(value) => { this.handler.sectorTooltipInputChange(i, value); }}
                showHintAndError={false}
                value={data.tooltip}
            />
            <TransparentDangerButton
                tabIndex="-1"
                onClick={() => { this.handler.removeSectorButtonClick(i); }}
                title={afStrings.removeDimensionXButtonTitle}
                iconName={iconNames.delete}
            />
        </div>
    );

    editDimension = (key, data, i) => (
        <div
            key={data.id}
            className={styles['edit-dimension']}
        >
            <TextInput
                label={afStrings.dimensionYTitleLabel}
                placeholder={afStrings.dimensionYTitlePlaceholder}
                showHintAndError={false}
                onChange={(value) => { this.handler.dimensionTitleInputChange(i, value); }}
                value={data.title}
                autoFocus
            />
            <TextInput
                label={afStrings.tooltipTitle}
                showHintAndError={false}
                onChange={(value) => { this.handler.dimensionTooltipInputChange(i, value); }}
                value={data.tooltip}
            />
            <input
                onChange={(value) => { this.handler.dimensionColorInputChange(i, value); }}
                type="color"
                value={data.color}
            />
            <TransparentDangerButton
                tabIndex="-1"
                onClick={() => { this.handler.removeDimensionButtonClick(i); }}
                title={afStrings.removeDimensionYButtonTitle}
                iconName={iconNames.delete}
            />
        </div>
    );

    editSubsector = (key, data, i) => (
        <TextInput
            label={afStrings.subsectorTitleLabel}
            className={styles['edit-subsector-input']}
            onChange={(value) => { this.handler.subsectorTitleInputValueChange(i, value); }}
            key={data.id}
            value={data.title}
            showHintAndError={false}
            autoFocus
        />
    )

    sector = (key, data) => (
        <div
            className={styles.sector}
            key={data.id}
        >
            { data.title }
        </div>
    );

    dimension = (key, data) => (
        <Dimension
            key={data.id}
            data={data}
            onChange={this.handler.dimensionChange}
        />
    );

    getSelectSectorStyleName = (i) => {
        const styleNames = [styles['select-sector']];

        const {
            selectedSectorIndex,
        } = this.parent.state;

        if (selectedSectorIndex === i) {
            styleNames.push(styles.active);
        }

        return styleNames.join(' ');
    }

    selectSector = (key, data, i) => (
        <button
            key={key}
            className={this.getSelectSectorStyleName(i)}
            onClick={() => { this.handler.selectSectorButtonclick(i); }}
        >
            { data.title }
        </button>
    );
}
