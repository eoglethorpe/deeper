import { FgRestBuilder } from '../../../vendor/react-store/utils/rest';
import {
    createUrlEditEntryGet,
    createParamsForEditEntryGet,
} from '../../../rest';
import {
    calcEntriesDiff,
    getApplicableDiffCount,
    getApplicableAndModifyingDiffCount,
} from '../../../entities/entry';
import notify from '../../../notify';
import _ts from '../../../ts';
// import schema from '../../../schema';

export default class LeadRequest {
    constructor(params) {
        const {
            setState,
            api,
            setLead,
            getAf,
            removeAllEntries,
            setAnalysisFramework,
            getEntries,
            diffEntries,
            setGeoOptions,
            setRegions,
        } = params;
        this.setState = setState;
        this.api = api;
        this.setLead = setLead;
        this.getAf = getAf;
        this.removeAllEntries = removeAllEntries;
        this.setAnalysisFramework = setAnalysisFramework;
        this.getEntries = getEntries;
        this.diffEntries = diffEntries;
        this.setGeoOptions = setGeoOptions;
        this.setRegions = setRegions;
    }

    create = (leadId) => {
        const request = new FgRestBuilder()
            .url(createUrlEditEntryGet(leadId))
            .params(() => createParamsForEditEntryGet())
            .preLoad(() => this.setState({ pendingEditEntryData: true }))
            .postLoad(() => this.setState({ pendingEditEntryData: false }))
            .success((response) => {
                const {
                    lead,
                    geoOptions,
                    analysisFramework,
                    entries,
                    regions,
                } = response;

                this.setLead({ lead });
                this.api.setLeadDate(lead.publishedOn);

                // TODO: notify that analysis framework changed and history cleared
                const oldAf = this.getAf();
                if (oldAf.versionId < analysisFramework.versionId) {
                    this.removeAllEntries({ leadId });
                }
                this.setAnalysisFramework({ analysisFramework });

                this.setGeoOptions({
                    projectId: lead.project,
                    locations: geoOptions,
                });

                this.setRegions({
                    projectId: lead.project,
                    regions,
                });

                const diffs = calcEntriesDiff(this.getEntries(), entries);
                if (getApplicableDiffCount(diffs) <= 0) {
                    return;
                }
                this.diffEntries({ leadId, diffs });

                if (getApplicableAndModifyingDiffCount(diffs) <= 0) {
                    return;
                }
                notify.send({
                    type: notify.type.WARNING,
                    title: _ts('notification', 'entryUpdate'),
                    message: _ts('notification', 'entryUpdateOverridden'),
                    duration: notify.duration.SLOW,
                });

                this.setState({ pendingEditEntryData: false });
            })
            .build();
        return request;
    }
}
