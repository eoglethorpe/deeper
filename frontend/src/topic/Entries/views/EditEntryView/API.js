import update from '../../../../public/utils/immutable-update';
import { entryAccessor } from '../../../../common/entities/entry';

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

    selectEntryAndSetAttribute(id, widgetId, data) {
        this.selectEntry(id);
        if (widgetId && data) {
            this.setEntryAttribute(widgetId, data, id);
        }
    }

    addExcerpt(excerpt, widgetId = undefined, data = undefined) {
        this.addEntry(excerpt, undefined, widgetId && data && [{ widget: widgetId, data }]);
    }

    addImage(image, widgetId = undefined, data = undefined) {
        this.addEntry(undefined, image, widgetId && data && [{ widget: widgetId, data }]);
    }
}
