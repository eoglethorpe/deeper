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
} from '../../../public/components/Action';
import {
    List,
} from '../../../public/components/View';
import update from '../../../public/utils/immutable-update';
import { listToMap } from '../../../public/utils/common';

import {
    createParamsForUser,
    createUrlForLeadsOfProject,
} from '../../../common/rest';

import {
    analysisFrameworkForProjectSelector,
    projectIdFromRouteSelector,
} from '../../../common/redux';

import wordIcon from '../../../img/word.svg';
import excelIcon from '../../../img/excel.svg';
import pdfIcon from '../../../img/pdf.svg';
import jsonIcon from '../../../img/json.svg';

import FilterLeadsForm from '../../Leads/views/Leads/components/FilterLeadsForm';
import FilterEntriesForm from '../../Entries/views/FilterEntriesForm';
import BasicInformationInputs from './BasicInformationInputs';
import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    analysisFramework: analysisFrameworkForProjectSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
});

const propTypes = {
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.string.isRequired,
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
            selectedLeads: [],
            values: {
                excerpt: '',
                createdBy: [],
                createdAt: {},
                leadTitle: '',
                leadSource: '',
                leadCreatedAt: {},
            },
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
                title: 'DOCX',
            },
            {
                key: 'pdf',
                img: pdfIcon,
                title: 'PDF',
            },
            {
                key: 'excel',
                title: 'XLXS',
                img: excelIcon,
            },
            {
                key: 'json',
                img: jsonIcon,
                title: 'JSON',
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
    }

    getExportTypeClassName = (key) => {
        const {
            activeExportTypeKey,
        } = this.state;

        const classNames = [styles['export-type-select']];

        if (activeExportTypeKey === key) {
            classNames.push(styles.active);
        }

        return classNames.join(' ');
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
                // TODO
                // schema.validate(response, 'leadsGetResponse');
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

    handleFilterInputsChange = (newValues) => {
        const {
            values: oldValues,
        } = this.state;

        const settings = {
            $merge: newValues,
        };

        const values = update(oldValues, settings);

        this.setState({
            values,
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

    renderExcelOptions = () => {

    }

    render() {
        const {
            activeExportTypeKey,
            leads,
            values,
        } = this.state;

        return (
            <div styleName="export">
                <header styleName="header">
                    <h2>Export</h2>
                    <div styleName="action-buttons">
                        <Button>Show preview</Button>
                        <Button>Start export</Button>
                    </div>
                </header>
                <div styleName="main-content">
                    <section
                        styleName="export-types"
                    >
                        <header styleName="header">
                            <h4 styleName="heading">
                                Select export type
                            </h4>
                        </header>
                        <div styleName="content">
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
                        </div>
                    </section>
                    <section
                        styleName="filters"
                    >
                        <header styleName="header">
                            <h4>
                                Select filters
                            </h4>
                        </header>
                        <div styleName="content">
                            <div styleName="left">
                                <div styleName="basic-information">
                                    <BasicInformationInputs
                                        onChange={this.handleFilterInputsChange}
                                        values={values}
                                    />
                                </div>
                                <div styleName="entry-attributes">
                                    <h4>
                                        Entry Attributes
                                    </h4>
                                    <FilterEntriesForm
                                        applyOnChange
                                        pending={false}
                                    />
                                </div>
                            </div>
                            <div styleName="right">
                                <div styleName="lead-attributes">
                                    <h4>
                                        Lead Attributes
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
                        </div>
                    </section>
                    <section styleName="preview">
                        Export preview
                    </section>
                </div>
            </div>
        );
    }
}
