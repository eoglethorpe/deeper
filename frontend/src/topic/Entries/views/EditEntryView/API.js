import update from '../../../../public/utils/immutable-update';
import { entryAccessor } from '../../../../common/entities/entry';

const DEFAULT_HIGHLIGHT_COLOR = '#e0e0e0';

export default class API {
    constructor(
        addEntry,
        selectEntry,
        changeEntryData,
        changeEntryValues,
        entries = [],
    ) {
        this.entries = entries;
        this.selectedId = undefined;

        this.addEntry = addEntry;
        this.selectEntry = selectEntry;
        this.changeEntryData = changeEntryData;
        this.changeEntryValues = changeEntryValues;
    }

    setEntries(entries) {
        this.entries = entries;
    }

    setSelectedId(id) {
        this.selectedId = id;
    }

    getEntry(id = undefined) {
        const selectedId = id || this.selectedId;
        return selectedId && this.entries.find(e => e.data.id === selectedId);
    }

    setEntryData(data, id = undefined) {
        const selectedId = id || this.selectedId;
        if (selectedId) {
            this.changeEntryData(selectedId, data);
        }
    }

    setEntryType(type, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const settings = {
                entryType: { $set: type },
            };

            this.changeEntryValues(
                entryAccessor.getKey(entry),
                update(entryAccessor.getValues(entry), settings),
            );
        }
    }

    setEntryExcerpt(excerpt, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const settings = {
                excerpt: { $set: excerpt },
            };
            this.changeEntryValues(
                entryAccessor.getKey(entry),
                update(entryAccessor.getValues(entry), settings),
            );
        }
    }

    setEntryImage(image, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const settings = {
                image: { $set: image },
            };
            this.changeEntryValues(
                entryAccessor.getKey(entry),
                update(entryAccessor.getValues(entry), settings),
            );
        }
    }

    setEntryAttribute(widgetId, data, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const values = entryAccessor.getValues(entry);
            let index = -1;

            if (!values.attributes) {
                index = -1;
            } else {
                index = values.attributes.findIndex(attr => attr.widget === widgetId);
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

            this.changeEntryValues(
                entryAccessor.getKey(entry),
                update(values, settings),
            );
        }
    }

    setEntryFilterData(filterId, list, number, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const values = entryAccessor.getValues(entry);
            let index = -1;

            if (!values.filterData) {
                index = -1;
            } else {
                index = values.filterData.findIndex(attr => attr.filter === filterId);
            }

            let settings;
            if (index === -1) {
                settings = {
                    filterData: { $autoArray: {
                        $push: [{
                            filter: filterId,
                            values: list,
                            number,
                        }],
                    } },
                };
            } else {
                settings = {
                    filterData: {
                        [index]: { $merge: {
                            values: list,
                            number,
                        } },
                    },
                };
            }

            this.changeEntryValues(
                entryAccessor.getKey(entry),
                update(values, settings),
            );
        }
    }

    setEntryHighlight(color, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const settings = {
                color: { $set: color },
            };

            this.changeEntryValues(
                entryAccessor.getKey(entry),
                update(entryAccessor.getValues(entry), settings),
            );
        }
    }

    selectEntryAndSetAttribute(id, widgetId, data) {
        this.selectEntry(id);
        if (widgetId && data) {
            this.setEntryAttribute(widgetId, data, id);
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

    getEntryForExcerpt(excerpt) {
        return this.entries.find(entry => entryAccessor.getValues(entry).excerpt === excerpt);
    }

    getEntryHighlights() {
        return this.entries
            .filter(entry => entryAccessor.getValues(entry).entryType === 'excerpt')
            .map(entry => ({
                text: entryAccessor.getValues(entry).excerpt,
                color: entryAccessor.getValues(entry).color || DEFAULT_HIGHLIGHT_COLOR,
            })).filter(h => h.text);
    }

    addExcerpt(excerpt, widgetId = undefined, data = undefined) {
        this.addEntry(excerpt, undefined, widgetId && data && [{ widget: widgetId, data }]);
    }

    addImage(image, widgetId = undefined, data = undefined) {
        this.addEntry(undefined, image, widgetId && data && [{ widget: widgetId, data }]);
    }
}
