import update from '../../../../public/utils/immutable-update';

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
            this.changeEntryValues(entry.id, update(entry.widget.values, settings));
        }
    }

    setEntryImage(image, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const settings = {
                image: { $set: image },
            };
            this.changeEntryValues(entry.id, update(entry.widget.values, settings));
        }
    }

    setEntryAttribute(widgetId, data, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const values = entry.widget.values;
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

            this.changeEntryValues(entry.data.id, update(values, settings));
        }
    }

    getEntryExcerpt(id = undefined) {
        const entry = this.getEntry(id);
        return entry && entry.widget.values.excerpt;
    }

    getEntryImage(id = undefined) {
        const entry = this.getEntry(id);
        return entry && entry.widget.values.image;
    }

    getEntryExcerptOrImage(id = undefined) {
        const entry = this.getEntry(id);
        return entry && (
            entry.widget.values.excerpt || entry.widget.values.image
        );
    }

    getEntryAttribute(widgetId, id = undefined) {
        const entry = this.getEntry(id);
        const attribute = (
            entry &&
            entry.widget.values.attributes &&
            entry.widget.values.attributes.find(attr => attr.widget === widgetId)
        );
        return attribute && attribute.data;
    }

    getEntryForExcerpt(excerpt) {
        return this.entries.find(entry => entry.widget.values.excerpt === excerpt);
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
