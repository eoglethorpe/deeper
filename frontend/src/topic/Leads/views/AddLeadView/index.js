/**
 * @author frozenhelium <fren.ankit@gmail.com>
 */

import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { TransparentButton } from '../../../../public/components/Action';
import {
    ListView,
} from '../../../../public/components/View';
import {
    FileInput,
    SelectInput,
    TextInput,
} from '../../../../public/components/Input';
import update from '../../../../public/utils/immutable-update';
import { RestBuilder } from '../../../../public/utils/rest';

import { pageTitles } from '../../../../common/utils/labels';
import DropboxChooser from '../../../../common/components/DropboxChooser';
import GooglePicker from '../../../../common/components/GooglePicker';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../../../common/rest';
import {
    setNavbarStateAction,
    tokenSelector,
    activeProjectSelector,
    setLeadFilterOptionsAction,
    leadFilterOptionsForProjectSelector,
} from '../../../../common/redux';

import { dropboxAppKey } from '../../../../common/config/dropbox';
import { googleDriveClientId, googleDriveDeveloperKey } from '../../../../common/config/google-drive';

import AddLeadForm from '../../components/AddLeadForm';
import AddLeadListItem from '../../components/AddLeadListItem';
import styles from './styles.scss';

import AddLeadHandler from './AddLeadHandler';
import { saveLead } from '../../utils';

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    token: tokenSelector(state),
    leadOptions: leadFilterOptionsForProjectSelector(state),
    state,
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
});

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    activeProject: PropTypes.number.isRequired,

    leadOptions: PropTypes.shape({
        dummy: PropTypes.string,
    }).isRequired,

    setNavbarState: PropTypes.func.isRequired,

    setLeadFilterOptions: PropTypes.func.isRequired,

    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,
};

const defaultProps = {
};

// TODO: move this function to common
const strMatchesSub = (str, sub) => (str.toLowerCase().includes(sub.toLowerCase()));

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLeadView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.defaultFilters = {
            search: '',
            type: [],
            source: '',
            status: '',
        };

        this.state = {
            searchInputValue: '',
            leads: [],
            activeLeadId: undefined,
            dropboxDisabled: false,
            filters: { ...this.defaultFilters },
        };

        this.addLead = new AddLeadHandler(this);

        this.supportedDropboxExtension = ['.doc', '.docx', '.rtf', '.txt',
            '.otf', '.pdf', '.ppt', '.pptx',
            '.xls', '.xlsx', '.csv', '.png',
            '.jpg', '.gif', '.json', '.xml'];

        this.supportedGoogleDriveMimeTypes = [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf', 'text/plain', 'font/otf', 'application/pdf',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-powerpoint', 'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/csv', 'image/png', 'image/jpeg', 'image/fig',
            'application/json', 'application/xml', 'application/msword',
        ];

        this.leadStatusFilterOptions = [
            { key: 'invalid', label: 'Invalid' },
            { key: 'saved', label: 'Saved' },
            { key: 'unsaved', label: 'Unsaved' },
        ];

        this.leadTypeOptions = [
            { key: 'dropbox', label: 'Dropbox' },
            { key: 'file', label: 'Local Disk' },
            { key: 'drive', label: 'Google Drive' },
            { key: 'text', label: 'Text' },
            { key: 'website', label: 'Website' },
        ];
    }

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: undefined,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
            ],
        });
    }

    componentDidMount() {
        const { activeProject } = this.props;
        this.requestProjectLeadFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.activeProject !== nextProps.activeProject) {
            this.requestProjectLeadFilterOptions(nextProps.activeProject);
        }
    }

    setLeadsWithDefaultFilters = (leads) => {
        this.setState({
            leads: this.applyFilters(leads, this.defaultFilters),
            filters: { ...this.defaultFilters },
        });
    }

    setLeadsWithFilters = (leads, filters) => {
        this.setState({
            leads: this.applyFilters(leads, filters),
            filters,
        });
    }

    applyFilters = (leads, filters) => {
        const {
            search,
            type,
            // status,
            source,
        } = filters;

        const newLeads = leads.map((lead) => {
            const newLead = {
                ...lead,
                isFiltrate: false,
            };

            if (search.length === 0 || strMatchesSub(lead.form.values.title || '', search)) {
                if (type.length === 0 || type.indexOf(lead.data.type) > -1) {
                    if (source.length === 0 || strMatchesSub(lead.form.values.source || '', source)) {
                        newLead.isFiltrate = true;
                    }
                }
            }

            return newLead;
        });

        return newLeads;
    }

    requestProjectLeadFilterOptions = (activeProject) => {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line
        this.leadFilterOptionsRequest = this.createRequestForProjectLeadFilterOptions(activeProject);
        this.leadFilterOptionsRequest.start();
    }

    createRequestForProjectLeadFilterOptions = (activeProject) => {
        const urlForProjectFilterOptions = createUrlForLeadFilterOptions(activeProject);

        const leadFilterOptionsRequest = new RestBuilder()
            .url(urlForProjectFilterOptions)
            .params(() => {
                const { token } = this.props;
                const { access } = token;
                return createParamsForUser({
                    access,
                });
            })
            .success((response) => {
                try {
                    // TODO:
                    // schema.validate(response, 'leadFilterOptionsGetResponse');
                    this.props.setLeadFilterOptions({
                        projectId: activeProject,
                        leadFilterOptions: response,
                    });
                } catch (er) {
                    console.error(er);
                }
            })
            .retryTime(1000)
            .build();

        return leadFilterOptionsRequest;
    }

    handleLeadUploadProgress = (leadId, progress) => {
        const { leads } = this.state;
        const leadIndex = leads.findIndex(d => d.data.id === leadId);
        const settings = {
            [leadIndex]: {
                upload: {
                    progress: {
                        $set: progress,
                    },
                },
            },
        };
        const newLeads = update(leads, settings);
        this.setState({
            leads: newLeads,
        });
    }

    handleUploadComplete = (uploaderId, leadId, status, response) => {
        const { leads } = this.state;
        const leadIndex = leads.findIndex(d => d.data.id === leadId);
        const r = JSON.parse(response);

        if (parseInt(status / 100, 10) === 2) {
            // success (eg: 200, 201)
            const settings = {
                [leadIndex]: {
                    upload: {
                        $merge: {
                            progress: 100,
                            serverId: r.id,
                            title: r.title,
                            error: undefined,
                        },
                    },
                    form: {
                        error: { $set: [] },
                    },
                    uiState: {
                        error: { $set: false },
                    },
                },
            };
            const newLeads = update(leads, settings);
            this.setState({
                leads: newLeads,
            });
        } else {
            const settings = {
                [leadIndex]: {
                    upload: {
                        $merge: {
                            progress: 0,
                            error: `Failed to upload file (${status})`,
                        },
                    },
                    form: {
                        error: {
                            $set: [`Failed to upload file (${status})`],
                        },
                    },
                    uiState: {
                        error: { $set: true },
                    },
                },
            };

            const newLeads = update(leads, settings);
            this.setState({
                leads: this.applyFiltersFromState(newLeads),
            });
        }
    }

    handleAddLeadFromGoogleDrive = (response) => {
        this.setLeadsWithDefaultFilters(
            this.addLead.fromGoogleDrive(response),
        );
    }

    handleAddLeadFromDropbox = (response) => {
        this.setLeadsWithDefaultFilters(
            this.addLead.fromDropbox(response),
        );
    }

    handleAddLeadFromDisk = (e) => {
        this.setLeadsWithDefaultFilters(
            this.addLead.fromDisk(e),
        );
    }

    handleAddLeadFromWebsite = () => {
        this.setLeadsWithDefaultFilters(
            this.addLead.fromWebsite(),
        );
    }

    handleAddLeadFromText = () => {
        this.setLeadsWithDefaultFilters(
            this.addLead.fromText(),
        );
    }

    calcLeadKey = lead => lead.data.id

    handleLeadClick = (id) => {
        this.setState({
            activeLeadId: id,
        });
    }

    handleFormChange = (values, { formErrors, formFieldErrors }) => {
        const { leads, activeLeadId } = this.state;
        const activeLeadIndex = leads.findIndex(lead => lead.data.id === activeLeadId);

        const settings = {
            [activeLeadIndex]: {
                uiState: {
                    stale: { $set: true },
                    error: { $set: false },
                    ready: { $set: true },
                },
                form: {
                    values: { $merge: values },
                    errors: { $merge: formErrors },
                    fieldErrors: { $merge: formFieldErrors },
                },
            },
        };
        const newLeads = update(leads, settings);
        this.setState({
            leads: newLeads,
        });
    }

    handleFormFailure = ({ formErrors, formFieldErrors }) => {
        const { leads, activeLeadId } = this.state;
        const activeLeadIndex = leads.findIndex(lead => lead.data.id === activeLeadId);

        const settings = {
            [activeLeadIndex]: {
                uiState: {
                    stale: { $set: false },
                    error: { $set: true },
                    ready: { $set: false },
                },
                form: {
                    errors: { $merge: formErrors },
                    fieldErrors: { $merge: formFieldErrors },
                },
            },
        };
        const newLeads = update(leads, settings);
        this.setState({
            leads: newLeads,
        });
    }

    handleFormSuccess = (values) => {
        const { access } = this.props.token;
        const { leads, activeLeadId } = this.state;
        const activeLeadIndex = leads.findIndex(lead => lead.data.id === activeLeadId);

        /*
        saveLead(
            leads[activeLeadIndex],
            access,
        ).then((response) => {
            console.log(response);

            const settings = {
                [activeLeadIndex]: {
                    uiState: {
                        pending: { $set: false },
                    },
                },
            };

            const newLeads = update(leads, settings);
            this.setState({
                leads: newLeads,
            });
        });
        */

        const settings = {
            [activeLeadIndex]: {
                uiState: {
                    pending: { $set: true },
                },
            },
        };

        const newLeads = update(leads, settings);
        this.setState({
            leads: newLeads,
        });

        console.log(values);
    }

    handleSearchChange = (value) => {
        const {
            leads,
            filters,
        } = this.state;

        filters.search = value;

        this.setLeadsWithFilters(leads, filters);
    }

    handleLeadTypeFilterChange = (value) => {
        const {
            leads,
            filters,
        } = this.state;

        filters.type = value;

        this.setLeadsWithFilters(leads, filters);
    }

    handleLeadSourceFilterChange = (value) => {
        const {
            leads,
            filters,
        } = this.state;

        filters.source = value;

        this.setLeadsWithFilters(leads, filters);
    }

    handleLeadStatusFilterChange = (value) => {
        const {
            leads,
            filters,
        } = this.state;

        filters.status = value;

        this.setLeadsWithFilters(leads, filters);
    }

    handleLeadNext = () => {
    }

    handleLeadPrev = () => {
    }

    renderLeadItem = (key, lead) => (
        <AddLeadListItem
            active={this.state.activeLeadId === lead.data.id}
            key={key}
            lead={lead}
            onClick={() => this.handleLeadClick(lead.data.id)}
        />
    )

    render() {
        const activeLead = this.state.leads.find(lead => lead.data.id === this.state.activeLeadId);
        const { filters } = this.state;

        return (
            <div styleName="add-lead">
                <Helmet>
                    <title>
                        { pageTitles.addLeads }
                    </title>
                </Helmet>
                <div styleName="left">
                    <div styleName="header">
                        <h2 styleName="title">
                            Leads
                        </h2>
                        <TextInput
                            styleName="search"
                            onChange={this.handleSearchChange}
                            value={filters.search}
                            placeholder="Search leads"
                            type="search"
                        />
                        <SelectInput
                            options={this.leadTypeOptions}
                            placeholder="Lead Type"
                            styleName="filter"
                            multiple
                            value={filters.type}
                            optionsIdentifier="lead-list-filter-options"
                            onChange={this.handleLeadTypeFilterChange}
                        />
                        <TextInput
                            placeholder="Source"
                            styleName="filter source-filter"
                            value={filters.source}
                            onChange={this.handleLeadSourceFilterChange}
                        />
                        <SelectInput
                            options={this.leadStatusFilterOptions}
                            placeholder="Status"
                            styleName="filter"
                            value={filters.status}
                            optionsIdentifier="lead-list-filter-options"
                            onChange={this.handleLeadStatusFilterChange}
                        />
                    </div>
                    <ListView
                        styleName="lead-list"
                        data={this.state.leads.filter(lead => lead.isFiltrate)}
                        keyExtractor={this.calcLeadKey}
                        modifier={this.renderLeadItem}
                    />
                    <div styleName="add-lead-buttons">
                        <h3 styleName="heading">
                            Add new lead from:
                        </h3>
                        <GooglePicker
                            styleName="add-lead-btn"
                            clientId={googleDriveClientId}
                            developerKey={googleDriveDeveloperKey}
                            onChange={this.handleAddLeadFromGoogleDrive}
                            mimeTypes={this.supportedGoogleDriveMimeTypes}
                            multiselect
                            navHidden
                        >
                            <span className="ion-social-google" />
                            <p>Drive</p>
                        </GooglePicker>
                        <DropboxChooser
                            styleName="add-lead-btn"
                            appKey={dropboxAppKey}
                            multiselect
                            extensions={this.supportedExtension}
                            success={this.handleAddLeadFromDropbox}
                            onClick={() => (this.setState({ dropboxDisabled: true }))}
                            cancel={() => (this.setState({ dropboxDisabled: false }))}
                            disabled={this.state.dropboxDisabled}
                        >
                            <span className="ion-social-dropbox" />
                            <p>Dropbox</p>
                        </DropboxChooser>
                        <FileInput
                            styleName="add-lead-btn"
                            onChange={this.handleAddLeadFromDisk}
                            showStatus={false}
                            multiple
                        >
                            <span className="ion-android-upload" />
                            <p>Local disk</p>
                        </FileInput>
                        <TransparentButton
                            styleName="add-lead-btn"
                            onClick={this.handleAddLeadFromWebsite}
                        >
                            <span className="ion-earth" />
                            <p>Website</p>
                        </TransparentButton>
                        <TransparentButton
                            styleName="add-lead-btn"
                            onClick={this.handleAddLeadFromText}
                        >
                            <span className="ion-clipboard" />
                            <p>Text</p>
                        </TransparentButton>
                    </div>
                </div>
                <div styleName="right">
                    {
                        activeLead ? (
                            <AddLeadForm
                                styleName="add-lead-form"
                                formCallbacks={{
                                    onChange: this.handleFormChange,
                                    onFailure: this.handleFormFailure,
                                    onSuccess: this.handleFormSuccess,
                                    onSave: this.handleLeadSave,
                                    onNext: this.handleLeadNext,
                                    onPrev: this.handleLeadPrev,
                                }}
                                lead={activeLead}
                                leadOptions={this.props.leadOptions}
                            />
                        ) : (
                            <div
                                styleName="empty-form"
                            >
                                Add a lead first
                            </div>
                        )
                    }
                    <div styleName="lead-preview">
                        Lead preview
                    </div>
                </div>
            </div>
        );
    }
}
