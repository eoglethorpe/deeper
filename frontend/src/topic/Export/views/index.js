import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { FgRestBuilder } from '../../../public/utils/rest';
import {
    Checkbox,
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

import wordIcon from '../../../img/word.svg';
import excelIcon from '../../../img/excel.svg';
import pdfIcon from '../../../img/pdf.svg';
import jsonIcon from '../../../img/json.svg';

import FilterEntriesForm from '../../Entries/views/FilterEntriesForm';
import BasicInformationInputs from './BasicInformationInputs';
import LeadAttributeInputs from './LeadAttributeInputs';
import styles from './styles.scss';

const propTypes = {
    match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static exportButtonKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        this.state = {
            activeExportTypeKey: undefined,
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

        this.options = [
            {
                key: 'generic',
                label: 'Generic',
            },
            {
                key: 'geo',
                label: 'Geo',
            },
        ];

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

        const {
            params,
        } = props.match;

        this.leadRequest = this.createRequestForProjectLeads(params.projectId);
    }

    componentWillMount() {
        if (this.leadRequest) {
            this.leadRequest.start();
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

    render() {
        const {
            values,
            leads,
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
                                Export type options
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
                                        pending
                                        match={this.props.match}
                                    />
                                </div>
                            </div>
                            <div styleName="right">
                                <div styleName="lead-attributes">
                                    <LeadAttributeInputs
                                        onChange={this.handleFilterInputsChange}
                                        values={values}
                                    />
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
