import React from 'react';

import { iconNames } from '../../../../../common/constants';

import {
    TransparentButton,
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
                label="Sector title"
                placeholder="eg: wash"
                onChange={(value) => { this.handler.sectorTitleInputChange(i, value); }}
                showHintAndError={false}
                value={data.title}
            />
            <TextInput
                label="Tooltip"
                onChange={(value) => { this.handler.sectorTooltipInputChange(i, value); }}
                showHintAndError={false}
                value={data.tooltip}
            />
            <TransparentButton
                tabIndex="-1"
                onClick={() => { this.handler.removeSectorButtonClick(i); }}
            >
                <span className={iconNames.delete} />
            </TransparentButton>
        </div>
    );

    editDimension = (key, data, i) => (
        <div
            key={data.id}
            className={styles['edit-dimension']}
        >
            <TextInput
                label="Dimension title"
                placeholder="eg: space"
                showHintAndError={false}
                onChange={(value) => { this.handler.dimensionTitleInputChange(i, value); }}
                value={data.title}
            />
            <TextInput
                label="Tooltip"
                showHintAndError={false}
                onChange={(value) => { this.handler.dimensionTooltipInputChange(i, value); }}
                value={data.tooltip}
            />
            <input
                onChange={(value) => { this.handler.dimensionColorInputChange(i, value); }}
                type="color"
                value={data.color}
            />
            <TransparentButton
                tabIndex="-1"
                onClick={() => { this.handler.removeDimensionButtonClick(i); }}
            >
                <span className={iconNames.delete} />
            </TransparentButton>
        </div>
    );

    editSubsector = (key, data, i) => (
        <TextInput
            label="Subsector title"
            className={styles['edit-subsector-input']}
            onChange={(value) => { this.handler.subsectorTitleInputValueChange(i, value); }}
            key={data.id}
            value={data.title}
            showHintAndError={false}
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
