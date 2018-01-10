import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    Checkbox,
    TreeSelection,
} from '../../../public/components/Input';
import {
    Button,
    PrimaryButton,
} from '../../../public/components/Action';
import {
    List,
} from '../../../public/components/View';
import update from '../../../public/utils/immutable-update';
import { listToMap } from '../../../public/utils/common';
import {
    exportStrings,
} from '../../../common/constants';
import {
    createParamsForUser,
    createUrlForLeadsOfProject,

    urlForExportTrigger,
    createParamsForExportTrigger,
} from '../../../common/rest';

import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
} from '../../../common/redux';

import wordIcon from '../../../img/word.svg';
import excelIcon from '../../../img/excel.svg';
import pdfIcon from '../../../img/pdf.svg';
import jsonIcon from '../../../img/json.svg';

import FilterLeadsForm from '../../Leads/views/Leads/components/FilterLeadsForm';
import FilterEntriesForm from '../../Entries/views/FilterEntriesForm';
import ExportPreview from '../../../common/components/ExportPreview';
import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    projectId: projectIdFromRouteSelector(state, props),
    analysisFramework: analysisFrameworkForProjectSelector(state, props),
    entriesFilters: entriesViewFilterSelector(state, props),
});

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.string.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static exportButtonKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        this.state = {
            activeExportTypeKey: 'word',
            reportStructure: this.createReportStructure(props.analysisFramework),
            decoupledEntries: true,
            selectedLeads: [],
        };

        // this.options = [
        //     {
        //         key: 'generic',
        //         label: 'Generic',
        //     },
        //     {
        //         key: 'geo',
        //         label: 'Geo',
        //     },
        // ];

        this.exportTypes = [
            {
                key: 'word',
                img: wordIcon,
                title: exportStrings.docxLabel,
            },
            {
                key: 'pdf',
                img: pdfIcon,
                title: exportStrings.pdfLabel,
            },
            {
                key: 'excel',
                title: exportStrings.xlxsLabel,
                img: excelIcon,
            },
            {
                key: 'json',
                img: jsonIcon,
                title: exportStrings.jsonLabel,
            },
        ];

        const { projectId } = props;
        this.leadRequest = this.createRequestForProjectLeads(projectId);
    }

    componentWillMount() {
        if (this.leadRequest) {
            this.leadRequest.start();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.analysisFramework !== this.props.analysisFramework) {
            this.setState({
                reportStructure: this.createReportStructure(nextProps.analysisFramework),
            });
        }
    }

    componentWillUnmount() {
        if (this.leadRequest) {
            this.leadRequest.stop();
        }

        if (this.exportRequest) {
            this.exportRequest.stop();
        }
    }

    getExportTypeClassName(key) {
        const {
            activeExportTypeKey,
        } = this.state;

        const classNames = [styles['export-type-select']];

        if (activeExportTypeKey === key) {
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    export(onSuccess) {
        // Let's start by collecting the filters
        const {
            projectId,
            entriesFilters,
        } = this.props;
        const {
            activeExportTypeKey,
            selectedLeads,
            reportStructure,
            decoupledEntries,
        } = this.state;

        let exportType;
        if (activeExportTypeKey === 'word' || activeExportTypeKey === 'pdf') {
            exportType = 'report';
        } else {
            exportType = activeExportTypeKey;
        }

        const filters = {
            project: projectId,
            export_type: exportType,
            ...entriesFilters,
            decoupled: decoupledEntries,
            lead: Object.keys(selectedLeads).filter(l => selectedLeads[l]).join(','),
            report_structure: this.createReportStructureForExport(reportStructure),
        };

        if (this.exportRequest) {
            this.exportRequest.stop();
        }
        this.exportRequest = this.createRequestForExport({ filters }, onSuccess);
        this.exportRequest.start();
    }

    createReportStructureForExport = nodes => nodes.filter(
        node => node.selected,
    ).map(node => (
        node.nodes ? {
            id: node.key,
            levels: this.createReportStructureForExport(node.nodes),
        } : {
            id: node.key,
        }
    ));

    createRequestForExport = ({ filters }, onSuccess) => {
        const exportRequest = new FgRestBuilder()
            .url(urlForExportTrigger)
            .params(() => createParamsForExportTrigger(filters))
            .success((response) => {
                // FIXME: write schema
                onSuccess(response.exportTriggered);
            })
            .build();
        return exportRequest;
    }

    createRequestForProjectLeads = ({ activeProject }) => {
        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            fields: ['id', 'title'],
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({ loadingLeads: true });
            })
            .success((response) => {
                // FIXME: write schema
                this.setState({
                    leads: response.results,
                    selectedLeads: listToMap(response.results, d => d.id, () => true),
                    loadingLeads: false,
                });
            })
            .failure((err) => {
                console.error(err);
                this.setState({
                    loadingLeads: false,
                });
            })
            .build();
        return leadRequest;
    }

    exportTypeKeyExtractor = d => d.key

    leadKeyExtractor = d => d.id

    handleExportTypeSelectButtonClick = (key) => {
        this.setState({
            activeExportTypeKey: key,
        });
    }

    handleSelectLeadChange = (key, value) => {
        const settings = {
            [key]: {
                $set: value,
            },
        };

        const {
            selectedLeads,
        } = this.state;

        const newSelectedLeads = update(selectedLeads, settings);

        this.setState({
            selectedLeads: newSelectedLeads,
        });
    }

    handleReportStructureChange = (value) => {
        this.setState({
            reportStructure: value,
        });
    }

    handleDecoupledEntriesChange = (value) => {
        this.setState({
            decoupledEntries: value,
        });
    }

    handleExport = () => {
        this.export((exportId) => {
            console.log(exportId);
        });
    }

    handlePreview = () => {
        this.export((exportId) => {
            this.setState({
                previewId: exportId,
            });
        });
    }

    createReportStructure = (analysisFramework) => {
        if (!analysisFramework) {
            return undefined;
        }

        const { exportables, widgets } = analysisFramework;
        const nodes = [];

        if (!exportables || !widgets) {
            return undefined;
        }

        exportables.forEach((exportable) => {
            const levels = exportable.data && exportable.data.report &&
                exportable.data.report.levels;
            const widget = widgets.find(w => w.key === exportable.widgetKey);

            if (!levels || !widget) {
                return;
            }

            nodes.push({
                title: widget.title,
                key: `${exportable.id}`,
                selected: true,
                draggable: true,
                nodes: this.mapReportLevelsToNodes(levels),
            });
        });

        return nodes;
    }

    mapReportLevelsToNodes = levels => levels.map(level => ({
        key: level.id,
        title: level.title,
        selected: true,
        draggable: true,
        nodes: level.sublevels && this.mapReportLevelsToNodes(level.sublevels),
    }));

    renderExportType = (key, data) => (
        <button
            className={this.getExportTypeClassName(key)}
            key={key}
            title={data.title}
            onClick={() => { this.handleExportTypeSelectButtonClick(key); }}
        >
            <img
                className={styles.image}
                src={data.img}
                alt={data.title}
            />
        </button>
    )

    renderSelectLead = (key, data) => (
        <Checkbox
            className={styles['select-lead']}
            key={key}
            label={data.title}
            onChange={(value) => { this.handleSelectLeadChange(key, value); }}
            value={this.state.selectedLeads[key]}
        />
    )

    renderReportOptions = () => (
        <TreeSelection
            value={this.state.reportStructure}
            onChange={this.handleReportStructureChange}
        />
    )

    renderExcelOptions = () => (
        <Checkbox
            label="Decoupled Entries"
            onChange={this.handleDecoupledEntriesChange}
            value={this.state.decoupledEntries}
        />
    )

    render() {
        const {
            activeExportTypeKey,
            leads,
        } = this.state;

        return (
            <div styleName="export">
                <header styleName="header">
                    <h2>{exportStrings.headerExport}</h2>
                    <div styleName="action-buttons">
                        <Button
                            styleName="button"
                            onClick={this.handlePreview}
                        >
                            {exportStrings.showPreviewButtonLabel}
                        </Button>
                        <PrimaryButton
                            styleName="button"
                            onClick={this.handleExport}
                        >
                            {exportStrings.startExportButtonLabel}
                        </PrimaryButton>
                    </div>
                </header>
                <div styleName="main-content">
                    <section styleName="export-types">
                        <div styleName="export-type-select-list">
                            <List
                                styleName="export-type-select-list"
                                data={this.exportTypes}
                                modifier={this.renderExportType}
                                keyExtractor={this.exportTypeKeyExtractor}
                            />
                        </div>
                        <div styleName="export-type-options">
                            { (activeExportTypeKey === 'word' || activeExportTypeKey === 'pdf')
                                    && this.renderReportOptions()
                            }
                            { activeExportTypeKey === 'excel' && this.renderExcelOptions() }
                        </div>
                    </section>
                    <section styleName="filters" >
                        <div styleName="entry-filters">
                            <h4 styleName="heading">
                                {exportStrings.entryAttributesLabel}
                            </h4>
                            <FilterEntriesForm
                                applyOnChange
                                pending={false}
                            />
                        </div>
                        <div styleName="lead-filters">
                            <div styleName="lead-attributes">
                                <h4 styleName="heading">
                                    {exportStrings.leadAttributesLabel}
                                </h4>
                                <FilterLeadsForm applyOnChange />
                            </div>
                            <div styleName="leads">
                                <List
                                    data={leads}
                                    modifier={this.renderSelectLead}
                                    keyExtractor={this.leadKeyExtractor}
                                />
                            </div>
                        </div>
                    </section>
                    <ExportPreview
                        styleName="preview"
                        exportId={this.state.previewId}
                    />
                </div>
            </div>
        );
    }
}
