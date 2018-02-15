import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    isFalsy,
    listToMap,
    compareString,
    compareDate,
} from '../../vendor/react-store/utils/common';
import update from '../../vendor/react-store/utils/immutable-update';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import Table from '../../vendor/react-store/components/View/Table';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';

import ExportPreview from '../../components/ExportPreview';
import {
    createUrlForProject,
    createUrlForAnalysisFramework,

    createParamsForUser,
    createUrlForLeadsOfProject,

    transformResponseErrorToFormError,
} from '../../rest';
import {
    entriesViewFilterSelector,
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
    leadPageFilterSelector,
    setAnalysisFrameworkAction,
    setProjectAction,
    exportStringsSelector,
} from '../../redux';
import { iconNames } from '../../constants';
import notify from '../../notify';
import schema from '../../schema';
import BoundError from '../../components/BoundError';

import FilterLeadsForm from '../Leads/FilterLeadsForm';
import FilterEntriesForm from '../Entries/FilterEntriesForm';

import ExportHeader from './ExportHeader';
import ExportTypePane from './ExportTypePane';

import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    projectId: projectIdFromRouteSelector(state, props),
    analysisFramework: analysisFrameworkForProjectSelector(state, props),
    entriesFilters: entriesViewFilterSelector(state, props),
    filters: leadPageFilterSelector(state, props),
    exportStrings: exportStringsSelector(state),
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
    exportStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

@BoundError
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
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

        // TABLE component
        this.headers = [
            {
                key: 'select',
                label: this.props.exportStrings('selectLabel'),
                order: 1,
                sortable: false,
                modifier: (d) => {
                    const key = Export.leadKeyExtractor(d);
                    const selected = this.state.selectedLeads[key];
                    const iconName = selected ? iconNames.checkbox : iconNames.checkboxOutlineBlank;
                    return (
                        <AccentButton
                            title={selected ? 'Unselect' : 'Select'}
                            onClick={() => this.handleSelectLeadChange(key, !selected)}
                            smallVerticalPadding
                            transparent
                            iconName={iconName}
                        />
                    );
                },
            },
            {
                key: 'title',
                label: this.props.exportStrings('titleLabel'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: this.props.exportStrings('createdAtLabel'),
                order: 3,
                sortable: true,
                comparator: (a, b) => (
                    compareDate(a.createdAt, b.createdAt) ||
                    compareString(a.title, b.title)
                ),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
        ];

        this.defaultSort = {
            key: 'createdAt',
            order: 'dsc',
        };

        this.state = {
            activeExportTypeKey: 'word',
            previewId: undefined,
            reportStructure: undefined,
            decoupledEntries: true,

            selectedLeads: {},
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
                    title: this.props.exportStrings('projectLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                this.setState({ pendingAf: false });
                notify.send({
                    title: this.props.exportStrings('projectLabel'),
                    type: notify.type.ERROR,
                    message: this.props.exportStrings('cantLoadProject'),
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
                    title: this.props.exportStrings('afLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.exportStrings('afLabel'),
                    type: notify.type.ERROR,
                    message: this.props.exportStrings('cantLoadAf'),
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
            fields: ['id', 'title', 'created_at'],
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
                    title: this.props.exportStrings('leadsLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.exportStrings('leadsLabel'),
                    type: notify.type.ERROR,
                    message: this.props.exportStrings('cantLoadLeads'),
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

    render() {
        const {
            previewId,
            activeExportTypeKey,
            reportStructure,
            decoupledEntries,
            selectedLeads,
            leads = [],

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
                        <div>
                            <h4 styleName="heading">
                                {this.props.exportStrings('entryAttributesLabel')}
                            </h4>
                            <FilterEntriesForm
                                applyOnChange
                                pending={pendingAf}
                            />
                        </div>
                        <div styleName="lead-filters">
                            <div styleName="lead-attributes">
                                <h4 styleName="heading">
                                    {this.props.exportStrings('leadAttributesLabel')}
                                </h4>
                                <FilterLeadsForm />
                            </div>
                            <div styleName="leads">
                                { pendingLeads && <LoadingAnimation /> }
                                <Table
                                    styleName="leads-table"
                                    data={leads}
                                    headers={this.headers}
                                    defaultSort={this.defaultSort}
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
