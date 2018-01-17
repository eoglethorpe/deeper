import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import {
    Link,
} from 'react-router-dom';
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
    LoadingAnimation,
    FormattedDate,
} from '../../../public/components/View';
import update from '../../../public/utils/immutable-update';
import { isFalsy, listToMap } from '../../../public/utils/common';
import {
    exportStrings,
    pathNames,
    iconNames,
} from '../../../common/constants';
import {
    createUrlForProject,
    createUrlForAnalysisFramework,

    createParamsForUser,
    createUrlForLeadsOfProject,

    urlForExportTrigger,
    createParamsForExportTrigger,

    transformResponseErrorToFormError,
} from '../../../common/rest';
import notify from '../../../common/notify';
import schema from '../../../common/schema';

import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
    leadPageFilterSelector,
    setAnalysisFrameworkAction,
    setProjectAction,
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
    filters: leadPageFilterSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setProject: params => dispatch(setProjectAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
});

const propTypes = {
    setProject: PropTypes.func.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    entriesFilters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

const emptyList = [];

@CSSModules(styles, { allowMultiple: true })
class ExportTypePane extends React.PureComponent {
    static exportTypes = [
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
    ]

    static exportTypeKeyExtractor = d => d.key

    componentWillMount() {
        const newReportStructure = this.createReportStructure(this.props.analysisFramework);
        this.props.onReportStructureChange(newReportStructure);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.analysisFramework !== this.props.analysisFramework) {
            const newReportStructure = this.createReportStructure(nextProps.analysisFramework);
            this.props.onReportStructureChange(newReportStructure);
        }
    }

    getExportTypeClassName(key) {
        const { activeExportTypeKey } = this.props;

        const classNames = [
            styles['export-type-select'],
        ];
        if (activeExportTypeKey === key) {
            classNames.push(styles.active);
        }
        return classNames.join(' ');
    }

    mapReportLevelsToNodes = levels => levels.map(level => ({
        key: level.id,
        title: level.title,
        selected: true,
        draggable: true,
        nodes: level.sublevels && this.mapReportLevelsToNodes(level.sublevels),
    }));


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

    renderExportType = (key, data) => (
        <button
            className={this.getExportTypeClassName(key)}
            key={key}
            title={data.title}
            onClick={() => { this.props.onExportTypeChange(key); }}
        >
            <img
                className={styles.image}
                src={data.img}
                alt={data.title}
            />
        </button>
    )

    renderReportOptions = () => {
        if (!this.props.reportStructure) {
            return (
                <p>
                    { 'You don\'t have any matrices in your analysis framework.' }
                </p>
            );
        }
        return [
            <h4 key="header">
                Report Structure
            </h4>, // FIXME: strings
            <TreeSelection
                key="tree-selection"
                value={this.props.reportStructure}
                onChange={this.props.onReportStructureChange}
            />,
        ];
    }

    renderExcelOptions = () => (
        <div styleName="decoupled-box">
            <Checkbox
                label={exportStrings.decoupledEntriesLabel}
                value={this.props.decoupledEntries}
                onChange={this.props.onReportStructureChange}
            />
            <i
                className={iconNames.help}
                title={exportStrings.decoupledEntriesTitle}
            />
        </div>
    )

    render() {
        const { activeExportTypeKey } = this.props;
        return (
            <section styleName="export-types">
                <div styleName="export-type-select-list">
                    <List
                        styleName="export-type-select-list"
                        data={ExportTypePane.exportTypes}
                        modifier={this.renderExportType}
                        keyExtractor={ExportTypePane.exportTypeKeyExtractor}
                    />
                </div>
                <div styleName="export-type-options">
                    {
                        (activeExportTypeKey === 'word' || activeExportTypeKey === 'pdf')
                            && this.renderReportOptions()
                    }
                    { activeExportTypeKey === 'excel' && this.renderExcelOptions() }
                </div>
            </section>
        );
    }
}

@CSSModules(styles, { allowMultiple: true })
// eslint-disable-next-line
class ExportHeader extends React.PureComponent {
    componentWillUnmount() {
        if (this.exportRequest) {
            this.exportRequest.stop();
        }
    }

    createReportStructureForExport = nodes => nodes
        .filter(node => node.selected)
        .map(node => (
            node.nodes ? {
                id: node.key,
                levels: this.createReportStructureForExport(node.nodes),
            } : {
                id: node.key,
            }
        ));

    export = (onSuccess) => {
        // Let's start by collecting the filters
        const {
            projectId,
            entriesFilters,
            activeExportTypeKey,
            selectedLeads,
            reportStructure,
            decoupledEntries,
        } = this.props;

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
            report_structure: this.createReportStructureForExport(reportStructure || emptyList),
        };

        if (this.exportRequest) {
            this.exportRequest.stop();
        }
        this.exportRequest = this.createRequestForExport({ filters }, onSuccess);
        this.exportRequest.start();
    }

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

    handleExport = () => {
        const exportFn = (exportId) => {
            console.log('Exporting', exportId);
        };
        this.export(exportFn);
    }

    handlePreview = () => {
        this.export(this.props.onPreview);
    }

    render() {
        return (
            <header styleName="header">
                <h2>
                    {exportStrings.headerExport}
                </h2>
                <div styleName="action-buttons">
                    <Link
                        to={pathNames.userExports}
                        styleName="link"
                    >
                        {exportStrings.viewAllExportsButtonLabel}
                    </Link>
                    <Button
                        styleName="button"
                        onClick={this.handlePreview}
                        disabled={this.props.pending}
                    >
                        {exportStrings.showPreviewButtonLabel}
                    </Button>
                    <PrimaryButton
                        styleName="button"
                        onClick={this.handleExport}
                        disabled={this.props.pending}
                    >
                        {exportStrings.startExportButtonLabel}
                    </PrimaryButton>
                </div>
            </header>
        );
    }
}

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
// TODO:
// eslint-disable-next-line
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static exportButtonKeyExtractor = d => d.key;
    static leadKeyExtractor = d => d.id

    // TODO: move this somewhere
    static getFiltersForRequest = (filters) => {
        const requestFilters = {};
        Object.keys(filters).forEach((key) => {
            const filter = filters[key];
            switch (key) {
                case 'created_at':
                    if (filter) {
                        requestFilters.created_at__gt = FormattedDate.format(
                            new Date(filter.startDate), 'yyyy-MM-dd',
                        );
                        requestFilters.created_at__lt = FormattedDate.format(
                            new Date(filter.endDate), 'yyyy-MM-dd',
                        );
                    }
                    break;
                case 'published_on':
                    if (filter) {
                        requestFilters.published_on__gt = FormattedDate.format(
                            new Date(filter.startDate), 'yyyy-MM-dd',
                        );
                        requestFilters.published_on__lt = FormattedDate.format(
                            new Date(filter.endDate), 'yyyy-MM-dd',
                        );
                    }
                    break;
                default:
                    requestFilters[key] = filter;
                    break;
            }
        });
        return requestFilters;
    }

    constructor(props) {
        super(props);

        this.state = {
            activeExportTypeKey: 'word',
            previewId: undefined,
            reportStructure: undefined,
            decoupledEntries: true,

            selectedLeads: [],
            pendingLeads: true,
            pendingAf: true,
        };
    }

    componentWillMount() {
        const { projectId, filters } = this.props;
        this.leadRequest = this.createRequestForProjectLeads({
            activeProject: projectId,
            filters,
        });
        this.leadRequest.start();

        this.projectRequest = this.createRequestForProject(projectId);
        this.projectRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            filters: newFilters,
            projectId: newActiveProject,
        } = nextProps;
        const {
            filters: oldFilters,
            projectId: oldActiveProject,
        } = this.props;

        if (newFilters !== oldFilters || newActiveProject !== oldActiveProject) {
            if (this.leadRequest) {
                this.leadRequest.stop();
            }
            this.leadRequest = this.createRequestForProjectLeads({
                activeProject: newActiveProject,
                filters: newFilters,
            });
            this.leadRequest.start();
        }

        if (oldActiveProject !== newActiveProject) {
            if (this.projectRequest) {
                this.projectRequest.stop();
            }
            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }

            this.setState({ pendingAf: true });

            this.projectRequest = this.createRequestForProject(newActiveProject);
            this.projectRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.leadRequest) {
            this.leadRequest.stop();
        }
        if (this.projectRequest) {
            this.projectRequest.stop();
        }
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
    }

    createRequestForProject = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({ pendingAf: true });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({ project: response });

                    if (isFalsy(response.analysisFramework)) {
                        console.warn('There is no analysis framework');
                        this.setState({ pendingAf: false });
                    } else {
                        this.analysisFramework = this.createRequestForAnalysisFramework(
                            response.analysisFramework,
                        );
                        this.analysisFramework.start();
                    }
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                this.setState({ pendingAf: false });
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Project', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                this.setState({ pendingAf: false });
                notify.send({
                    title: 'Project', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load project', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return projectRequest;
    };

    createRequestForAnalysisFramework = (analysisFrameworkId) => {
        const urlForAnalysisFramework = createUrlForAnalysisFramework(
            analysisFrameworkId,
        );
        const analysisFrameworkRequest = new FgRestBuilder()
            .url(urlForAnalysisFramework)
            .params(() => createParamsForUser())
            .delay(0)
            .preLoad(() => {
                this.setState({ pendingAf: true });
            })
            .postLoad(() => {
                this.setState({ pendingAf: false });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({ analysisFramework: response });
                    this.setState({ pendingEntries: true });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                console.warn(response);
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Analysis Framework', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Analysis Framework', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load analysis framework', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return analysisFrameworkRequest;
    }

    createRequestForProjectLeads = ({ activeProject, filters }) => {
        const sanitizedFilters = Export.getFiltersForRequest(filters);
        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            fields: ['id', 'title'],
            ...sanitizedFilters,
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({ pendingLeads: true });
            })
            .postLoad(() => {
                this.setState({ pendingLeads: false });
            })
            .success((response) => {
                // FIXME: write schema
                const selectedLeads = listToMap(response.results, d => d.id, () => true);
                this.setState({
                    leads: response.results,
                    selectedLeads,
                });
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load leads', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return leadRequest;
    }

    handleSelectLeadChange = (key, value) => {
        const { selectedLeads } = this.state;
        const settings = {
            [key]: {
                $set: value,
            },
        };
        const newSelectedLeads = update(selectedLeads, settings);

        this.setState({ selectedLeads: newSelectedLeads });
    }

    handleReportStructureChange = (value) => {
        this.setState({ reportStructure: value });
    }

    handleDecoupledEntriesChange = (value) => {
        this.setState({ decoupledEntries: value });
    }

    handleExportTypeSelectButtonClick = (key) => {
        this.setState({ activeExportTypeKey: key });
    }

    handlePreview = (exportId) => {
        this.setState({ previewId: exportId });
    }

    renderLeadCheck = (key, data) => (
        <Checkbox
            className={styles['select-lead']}
            key={key}
            label={data.title}
            onChange={(value) => { this.handleSelectLeadChange(key, value); }}
            value={this.state.selectedLeads[key]}
        />
    )

    render() {
        const {
            previewId,
            activeExportTypeKey,
            reportStructure,
            decoupledEntries,
            selectedLeads,
            leads,

            pendingLeads,
            pendingAf,
        } = this.state;

        const {
            analysisFramework,
            entriesFilters,
            projectId,
        } = this.props;

        return (
            <div styleName="export">
                <ExportHeader
                    projectId={projectId}
                    entriesFilters={entriesFilters}
                    activeExportTypeKey={activeExportTypeKey}
                    selectedLeads={selectedLeads}
                    reportStructure={reportStructure}
                    decoupledEntries={decoupledEntries}
                    previewId={previewId}
                    onPreview={this.handlePreview}
                    pending={pendingLeads || pendingAf}
                />
                <div styleName="main-content">
                    <ExportTypePane
                        activeExportTypeKey={activeExportTypeKey}
                        reportStructure={reportStructure}
                        decoupledEntries={decoupledEntries}
                        onExportTypeChange={this.handleExportTypeSelectButtonClick}
                        onReportStructureChange={this.handleReportStructureChange}
                        onDecoupledEntriesChange={this.handleDecoupledEntriesChange}
                        analysisFramework={analysisFramework}
                    />
                    <section styleName="filters" >
                        <div styleName="entry-filters">
                            <h4 styleName="heading">
                                {exportStrings.entryAttributesLabel}
                            </h4>
                            <FilterEntriesForm
                                applyOnChange
                                pending={pendingAf}
                            />
                        </div>
                        <div styleName="lead-filters">
                            <div styleName="lead-attributes">
                                <h4 styleName="heading">
                                    {exportStrings.leadAttributesLabel}
                                </h4>
                                <FilterLeadsForm />
                            </div>
                            <div styleName="leads">
                                { pendingLeads && <LoadingAnimation /> }
                                <List
                                    data={leads}
                                    modifier={this.renderLeadCheck}
                                    keyExtractor={Export.leadKeyExtractor}
                                />
                            </div>
                        </div>
                    </section>
                    <ExportPreview
                        styleName="preview"
                        exportId={previewId}
                    />
                </div>
            </div>
        );
    }
}
