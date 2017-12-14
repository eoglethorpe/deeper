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
        return selectedId && this.entries.find(e => e.id === selectedId);
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

    setEntryAttribute(data, widgetId, id = undefined) {
        const entry = this.getEntry(id);
        if (entry) {
            const values = entry.widget.values;
            let newAttribute = false;

            if (!values.attributes) {
                newAttribute = true;
            }

            const index = values.attributes.find(attr => attr.widget === widgetId);
            if (index === -1) {
                newAttribute = true;
            }

            let settings;
            if (newAttribute) {
                settings = {
                    attributes: { $autoArray: {
                        $push: {
                            widget: widgetId,
                            data,
                        },
                    } },
                };
            } else {
                settings = {
                    attributes: {
                        [index]: { $merge: { data } },
                    },
                };
            }

            this.changeEntryValues(entry.id, update(values, settings));
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
        return (
            entry &&
            entry.widget.values.attributes &&
            entry.widget.values.attributes.find(attr => attr.widget === widgetId)
        );
    }

    addAndSelectExcerpt(excerpt) {
        const existing = this.entries.find(entry => entry.values.excerpt === excerpt);
        if (existing) {
            this.selectEntry(existing.id);
        } else {
            this.addEntry(excerpt);
        }
    }

    addAndSelectImage(image) {
        this.addEntry(undefined, image);
    }
}
