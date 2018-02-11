import update from '../../../../public/utils/immutable-update';
import { entryAccessor } from '../../../../common/entities/entry';

const DEFAULT_HIGHLIGHT_COLOR = '#e0e0e0';

class EntryModifier {
    constructor(
        entry,
        changeEntryValues,
    ) {
        this.entry = entry;
        this.pristine = entry && entryAccessor.getUiState(entry).pristine;
        this.values = entry && entryAccessor.getValues(entry);
        this.colors = entry && entryAccessor.getColors(entry);
        this.changeEntryValues = changeEntryValues;
    }

    setExcerpt(excerpt) {
        if (!this.entry) {
            return this;
        }

        const settings = {
            excerpt: { $set: excerpt },
            entryType: { $set: 'excerpt' },
        };

        this.pristine = false;
        this.values = update(this.values, settings);
        return this;
    }

    setImage(image) {
        if (!this.entry) {
            return this;
        }

        const settings = {
            image: { $set: image },
            entryType: { $set: 'image' },
        };

        this.pristine = false;
        this.values = update(this.values, settings);
        return this;
    }

    setDate(date) {
        if (!this.entry) {
            return this;
        }

        const settings = {
            informationDate: { $set: date },
        };
        this.pristine = false;
        this.values = update(this.values, settings);
        return this;
    }

    setType(type) {
        if (!this.entry) {
            return this;
        }

        const settings = {
            entryType: { $set: type },
        };

        this.pristine = false;
        this.values = update(this.values, settings);
        return this;
    }

    setHighlightColor(widgetId, color) {
        if (!this.entry) {
            return this;
        }

        const settings = { $auto: {
            [widgetId]: { $set: color },
        } };

        this.colors = update(this.colors, settings);
        return this;
    }

    setAttribute(widgetId, data) {
        if (!this.entry) {
            return this;
        }

        let index = -1;

        if (!this.values.attributes) {
            index = -1;
        } else {
            index = this.values.attributes.findIndex(attr => attr.widget === widgetId);
        }

        let settings;
        if (index === -1) {
            settings = {
                attributes: { $autoArray: {
                    $push: [{
                        widget: widgetId,
                        data,
                    }],
                } },
            };
        } else {
            settings = {
                attributes: {
                    [index]: { $merge: {
                        data,
                    } },
                },
            };
        }

        this.pristine = false;
        this.values = update(this.values, settings);
        return this;
    }

    setFilterData(filterId, filterData) {
        if (!this.entry) {
            return this;
        }

        let index = -1;

        if (!this.values.filterData) {
            index = -1;
        } else {
            index = this.values.filterData.findIndex(attr => attr.filter === filterId);
        }

        let settings;
        if (index === -1) {
            settings = {
                filterData: { $autoArray: {
                    $push: [{
                        filter: filterId,
                        ...filterData,
                    }],
                } },
            };
        } else {
            settings = {
                filterData: {
                    [index]: { $merge: {
                        ...filterData,
                    } },
                },
            };
        }

        this.values = update(this.values, settings);
        return this;
    }

    setExportData(exportableId, exportData) {
        if (!this.entry) {
            return this;
        }

        let index = -1;

        if (!this.values.exportData) {
            index = -1;
        } else {
            index = this.values.exportData.findIndex(attr => attr.exportable === exportableId);
        }

        let settings;
        if (index === -1) {
            settings = {
                exportData: { $autoArray: {
                    $push: [{
                        exportable: exportableId,
                        data: exportData,
                    }],
                } },
            };
        } else {
            settings = {
                exportData: {
                    [index]: { $merge: {
                        data: exportData,
                    } },
                },
            };
        }

        this.values = update(this.values, settings);
        return this;
    }

    apply() {
        if (this.entry) {
            this.changeEntryValues(
                entryAccessor.getKey(this.entry),
                this.values,
                this.colors,
                this.pristine,
            );
        }
    }
}


class EntryBuilder {
    constructor(addEntry) {
        this.addEntry = addEntry;
        this.attributes = [];
        this.filterData = [];
        this.exportData = [];
    }

    setExcerpt(excerpt) {
        this.entryType = 'excerpt';
        this.excerpt = excerpt;
        return this;
    }

    setImage(image) {
        this.entryType = 'image';
        this.image = image;
        return this;
    }

    setData({ type, data }) {
        if (type === 'image') {
            this.setImage(data);
        } else {
            this.setExcerpt(data);
        }

        return this;
    }

    addAttribute(widgetId, attribute) {
        this.attributes.push({
            widget: widgetId,
            data: attribute,
        });
        return this;
    }

    addFilterData(filterId, filterData) {
        this.filterData.push({
            filter: filterId,
            ...filterData,
        });
        return this;
    }

    addExportData(exportableId, exportData) {
        this.exportData.push({
            exportable: exportableId,
            data: exportData,
        });
        return this;
    }

    apply() {
        const values = {
            entryType: this.entryType,
            excerpt: this.excerpt,
            image: this.image,
            attributes: this.attributes,
            fta: this.filterData,
            exportData: this.exportData,
        };

        this.addEntry(values);
    }
}


export default class API {
    constructor(
        addEntry,
        selectEntry,
        changeEntryValues,
        entries = [],
    ) {
        this.entries = entries;
        this.selectedId = undefined;

        this.addEntry = addEntry;
        this.selectEntry = selectEntry;
        this.changeEntryValues = changeEntryValues;
    }

    setLeadDate(date) {
        this.leadDate = date;
    }

    getLeadDate() {
        return this.leadDate;
    }

    setEntries(entries) {
        this.entries = entries;
    }

    setProject(project) {
        this.project = project;
    }

    setSelectedId(id) {
        this.selectedId = id;
    }

    getEntry(id = undefined) {
        const selectedId = id || this.selectedId;
        return selectedId && this.entries.find(e => e.data.id === selectedId);
    }

    getProject() {
        return this.project;
    }

    getEntryModifier(id = undefined) {
        const entry = this.getEntry(id);
        return new EntryModifier(entry, this.changeEntryValues);
    }

    getEntryBuilder() {
        return new EntryBuilder(this.addEntry);
    }

    setEntryData(data, id = undefined) {
        const selectedId = id || this.selectedId;
        if (selectedId) {
            this.changeEntryData(selectedId, data);
        }
    }

    getEntryType(id = undefined) {
        const entry = this.getEntry(id);
        return entry && entryAccessor.getValues(entry).entryType;
    }

    getEntryExcerpt(id = undefined) {
        const entry = this.getEntry(id);
        return entry && entryAccessor.getValues(entry).excerpt;
    }

    getEntryImage(id = undefined) {
        const entry = this.getEntry(id);
        return entry && entryAccessor.getValues(entry).image;
    }

    getEntryExcerptOrImage(id = undefined) {
        const entry = this.getEntry(id);
        return entry && (
            entryAccessor.getValues(entry).excerpt || entryAccessor.getValues(entry).image
        );
    }

    getEntryAttribute(widgetId, id = undefined) {
        const entry = this.getEntry(id);
        const values = entry && entryAccessor.getValues(entry);

        const attribute = (
            values &&
            values.attributes &&
            values.attributes.find(attr => attr.widget === widgetId)
        );
        return attribute && attribute.data;
    }

    getEntryFilterData(filterId, id = undefined) {
        const entry = this.getEntry(id);
        const values = entry && entryAccessor.getValues(entry);

        const filterData = (
            values &&
            values.filterData &&
            values.filterData.find(f => f.filter === filterId)
        );
        return { values: filterData.values, number: filterData.number };
    }

    getEntryForExcerpt(excerpt) {
        return this.entries.find(entry => entryAccessor.getValues(entry).excerpt === excerpt);
    }

    getEntryForImage(image) {
        return this.entries.find(entry => entryAccessor.getValues(entry).image === image);
    }

    getEntryForData({ type, data }) {
        if (type === 'image') {
            return this.getEntryForImage(data);
        }
        return this.getEntryForExcerpt(data);
    }

    getHighlightColor = (colorObj) => {
        if (!colorObj) {
            return DEFAULT_HIGHLIGHT_COLOR;
        }

        const validColors = Object.values(colorObj).filter(c => c);
        return validColors[validColors.length - 1] || DEFAULT_HIGHLIGHT_COLOR;
    }

    getEntryHighlights() {
        return this.entries
            .filter(entry => entryAccessor.getValues(entry).entryType === 'excerpt')
            .map(entry => ({
                text: entryAccessor.getValues(entry).excerpt,
                color: this.getHighlightColor(entryAccessor.getColors(entry)),
            })).filter(h => h.text);
    }

    addExcerpt(
        excerpt,
        widgetId = undefined,
        data = undefined,
        filterId = undefined,
        filterData = undefined,
    ) {
        this.addEntry({
            excerpt,
            entryType: 'excerpt',
            widget: widgetId && data && [{ widget: widgetId, data }],
            filter: filterId && filterData && [{ filter: filterId, ...filterData }],
        });
    }

    addImage(image, widgetId = undefined, data = undefined) {
        this.addEntry({
            image,
            entryType: 'image',
            widget: widgetId && data && [{ widget: widgetId, data }],
        });
    }

    setAttributeToAll(widgetId, id) {
        const data = this.getEntryAttribute(widgetId, id);
        this.entries.forEach((entry) => {
            if (entry.data.id !== id) {
                this.getEntryModifier(entry.data.id)
                    .setAttribute(widgetId, data)
                    .apply();
            }
        });
    }

    setAttributeToBelow(widgetId, id) {
        const data = this.getEntryAttribute(widgetId, id);

        const selectedId = id || this.selectedId;
        const index = selectedId ? this.entries.findIndex(e => e.data.id === selectedId) : -1;
        if (index === -1) {
            return;
        }

        const belowEntries = this.entries.slice(index + 1);
        belowEntries.forEach((entry) => {
            this.getEntryModifier(entry.data.id)
                .setAttribute(widgetId, data)
                .apply();
        });
    }
}
