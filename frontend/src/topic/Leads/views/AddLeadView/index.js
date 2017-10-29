import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Tabs, TabContent } from 'react-tabs-redux';

import { TransparentButton } from '../../../../public/components/Button';
import AddLeadListItem from '../../components/AddLeadListItem';
import FileInput from '../../../../public/components/FileInput';
import { pageTitles } from '../../../../common/utils/labels';
import styles from './styles.scss';
import Uploader, { UploadCoordinator } from '../../../../public/utils/Uploader';
import { tokenSelector } from '../../../../common/selectors/auth';
import { setNavbarStateAction } from '../../../../common/action-creators/navbar';
import update from '../../../../public/utils/immutable-update';
import {
    urlForUpload,
    createHeaderForFileUpload,
} from '../../../../common/rest';

const mapStateToProps = state => ({
    token: tokenSelector(state),
    state,
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),

});

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLead extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            formErrors: { },
            formValues: { },
            leads: [],
            counter: 1,
            activeLeadKey: undefined,
        };

        this.uploadCoordinator = new UploadCoordinator();
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

    onFocus = (overrideName) => {
        this.form.onFocus(overrideName);
    }

    onChange = (value) => {
        this.form.onChange(value);
    }

    onSubmit = () => {
        this.form.onSubmit();
    }

    leadsClickHandler = (key) => {
        this.setState({ activeLeadKey: key });
        console.log(key);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.onSubmit();
        return false;
    }

    handleAddLeadFromDrive = () => {
    }

    handleAddLeadFromDropbox = () => {
    }

    handleUploadComplete = (uploaderId, leadId, status) => {
        console.log(uploaderId, leadId, status);
    }

    handleLeadUploadProgress = (leadId, progress) => {
        const { leads } = this.state;
        const leadIndex = leads.findIndex(d => d.id === leadId);
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

    handleAddLeadFromDisk = (e) => {
        const newLeads = [];

        const files = Object.values(e);

        for (let i = 0; i < files.length; i += 1) {
            const leadId = `lead-${this.state.counter + i}`;

            const lead = {
                key: leadId,
                id: leadId,
                type: 'file',
                upload: {
                    progress: 0,
                },
                formData: {
                    title: files[i].name,
                },
            };

            newLeads.push(lead);

            const uploader = new Uploader(
                files[i],
                urlForUpload,
                createHeaderForFileUpload(this.props.token),
            );

            uploader.onLoad = (status, response) => {
                this.handleUploadComplete(leadId, leadId, status, response);
            };

            uploader.onProgress = (progress) => {
                this.handleLeadUploadProgress(leadId, progress);
            };

            this.uploadCoordinator.add(leadId, uploader);
        }

        this.uploadCoordinator.queueAll();

        this.setState({
            leads: [
                ...this.state.leads,
                ...newLeads,
            ],
            activeLeadKey: `lead-${this.state.counter}`,
            counter: this.state.counter + files.length,
        });
    }

    handleAddLeadFromWebsite = () => {
        this.setState({
            leads: [
                ...this.state.leads,
                {
                    key: `lead-${this.state.counter}`,
                    type: 'website',
                    formData: {
                        title: `Lead #${this.state.counter}`,
                    },
                },
            ],
            activeLeadKey: `lead-${this.state.counter}`,
            counter: this.state.counter + 1,
        });
    }

    handleAddLeadFromText = () => {
        this.setState({
            leads: [
                ...this.state.leads,
                {
                    key: `lead-${this.state.counter}`,
                    type: 'text',
                    iconName: 'ion-clipboard',
                    formData: {
                        title: `Lead #${this.state.counter}`,
                    },
                },
            ],
            activeLeadKey: `lead-${this.state.counter}`,
            counter: this.state.counter + 1,
        });
    }

    handleOptionChange = (changeEvent) => {
        this.setState({ selectedValue: changeEvent.target.value });
    };

    render() {
        return (
            <div styleName="add-lead">
                <Helmet>
                    <title>
                        { pageTitles.addLeads }
                    </title>
                </Helmet>
                <Tabs
                    selectedTab={this.state.activeLeadKey}
                    activeLinkStyle={{ none: 'none' }}
                    styleName="tab-container"
                >
                    <div styleName="lead-list-container">
                        <h2 styleName="heading">
                            Leads
                        </h2>
                        <div styleName="list">
                            {
                                this.state.leads.map(lead => (
                                    <AddLeadListItem
                                        key={lead.key}
                                        active={this.state.activeLeadKey === lead.key}
                                        onClick={() => this.leadsClickHandler(lead.key)}
                                        title={lead.formData.title}
                                        type={lead.type}
                                        upload={lead.upload}
                                    />
                                ))
                            }
                        </div>
                        <div styleName="add-lead-container">
                            <h3 styleName="heading">
                                Add new lead from:
                            </h3>
                            <TransparentButton
                                styleName="add-lead-btn"
                                onClick={this.handleAddLeadFromDrive}
                            >
                                <span className="ion-social-google" />
                                <p>Drive</p>
                            </TransparentButton>
                            <TransparentButton
                                styleName="add-lead-btn"
                                onClick={this.handleAddLeadFromDropbox}
                            >
                                <span className="ion-social-dropbox" />
                                <p>Dropbox</p>
                            </TransparentButton>
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
                    <div styleName="leads-details-container">
                        {/* <AddLeadForm
                            onSubmit={() => {}}
                            pending={false}
                            values={this.state.editRow}
                        />
                    */}
                        <div styleName="tabs-content">
                            {
                                this.state.leads.map(lead => (
                                    <TabContent
                                        for={lead.key}
                                        styleName="tab"
                                    >
                                        {/*
                                        <AddLeadForm
                                            onSubmit={() => {}}
                                            pending={false}
                                            values={lead}
                                        />
                                        */}
                                        <div styleName="preview-container">
                                            <h2>Preview Container</h2>
                                        </div>
                                    </TabContent>
                                ))
                            }
                        </div>
                        {/* <div styleName="preview-container">
                            <h2> Preview Container goes here</h2>
                        </div> */}
                    </div>
                </Tabs>
            </div>
        );
    }
}
