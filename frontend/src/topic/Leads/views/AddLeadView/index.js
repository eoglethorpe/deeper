/**
 * @author frozenhelium <fren.ankit@gmail.com>
 * @co-author tnagorra <weathermist@gmail.com>
 */

import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

// import update from '../../../../public/utils/immutable-update';
import { RestBuilder } from '../../../../public/utils/rest';

import {
    List,
} from '../../../../public/components/View/';
import { pageTitles } from '../../../../common/utils/labels';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,

    createParamsForLeadEdit,
    createParamsForLeadCreate,
    urlForLead,
    createUrlForLeadEdit,
} from '../../../../common/rest';

import {
    setNavbarStateAction,
    tokenSelector,
    activeProjectSelector,
    setLeadFilterOptionsAction,
    // addLeadViewActiveLeadSelector,
    addLeadViewLeadChangeAction,
    addLeadViewActiveLeadIdSelector,
    addLeadViewLeadsSelector,
    addLeadViewLeadSetPendingAction,
    leadFilterOptionsSelector,
    addLeadViewLeadSaveAction,
} from '../../../../common/redux';

import AddLeadForm from '../../components/AddLeadForm';
import AddLeadFilter from './AddLeadFilter';
import AddLeadList from './AddLeadList';
import AddLeadButtons from './AddLeadButtons';
import styles from './styles.scss';

// import { saveLead } from '../../utils';

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    token: tokenSelector(state),
    activeLeadId: addLeadViewActiveLeadIdSelector(state),
    // activeLead: addLeadViewActiveLeadSelector(state),
    addLeadViewLeads: addLeadViewLeadsSelector(state),
    leadFilterOptions: leadFilterOptionsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
    addLeadViewLeadChange: params => dispatch(addLeadViewLeadChangeAction(params)),
    addLeadViewLeadSetPending: params => dispatch(addLeadViewLeadSetPendingAction(params)),
    addLeadViewLeadSave: params => dispatch(addLeadViewLeadSaveAction(params)),
});

const propTypes = {
    // eslint-disable-next-line react/no-unused-prop-types
    activeProject: PropTypes.number.isRequired,

    setNavbarState: PropTypes.func.isRequired,

    setLeadFilterOptions: PropTypes.func.isRequired,

    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,

    // activeLead: PropTypes.object, // eslint-disable-line
    addLeadViewLeadChange: PropTypes.func.isRequired,
    addLeadViewLeads: PropTypes.array.isRequired, // eslint-disable-line
    activeLeadId: PropTypes.number.isRequired,
    addLeadViewLeadSetPending: PropTypes.func.isRequired,
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line
    addLeadViewLeadSave: PropTypes.func.isRequired,
};

const defaultProps = {
    // activeLead: undefined,
};

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class AddLeadView extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

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

        const { activeProject } = this.props;
        this.requestProjectLeadFilterOptions(activeProject);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.activeProject !== nextProps.activeProject) {
            this.requestProjectLeadFilterOptions(nextProps.activeProject);
        }
    }

    // REST REQUEST FOR PROJECT LEAD FILTERS

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


    // HANDLE FORM

    handleFormChange = leadId => (values, { formErrors, formFieldErrors }) => {
        this.props.addLeadViewLeadChange({
            leadId,
            values,
            formErrors,
            formFieldErrors,
        });
    }

    handleFormFailure = leadId => ({ formErrors, formFieldErrors }) => {
        this.props.addLeadViewLeadChange({
            leadId,
            formErrors,
            formFieldErrors,
        });
    }

    createLeadRequest = (lead) => {
        const { access } = this.props.token;
        let url;
        let params;
        if (lead.serverId) {
            url = createUrlForLeadEdit(lead.serverId);
            params = createParamsForLeadEdit({ access }, lead.form.values);
        } else {
            url = urlForLead;
            params = () => createParamsForLeadCreate({ access }, lead.form.values);
        }
        const leadCreateRequest = new RestBuilder()
            .url(url)
            .params(params)
            .decay(0.3)
            .maxRetryTime(2000)
            .maxRetryAttempts(10)
            .preLoad(() => {
                this.props.addLeadViewLeadSetPending({
                    leadId: lead.data.id,
                    pending: true,
                });
            })
            .postLoad(() => {
                this.props.addLeadViewLeadSetPending({
                    leadId: lead.data.id,
                    pending: false,
                });
            })
            .success((response) => {
                console.log(response);
                // console.log(response);
                this.props.addLeadViewLeadSave({ leadId: lead.data.id, serverId: response.id });
            })
            .failure((response) => {
                console.error(response);
                // console.error('Failed lead request:', response);
            })
            .fatal((response) => {
                console.error('Fatal error occured during lead request:', response);
                // resolve(response);
            })
            .build();
        return leadCreateRequest;
    };

    handleFormSuccess = leadId => () => {
        const specificLead = this.props.addLeadViewLeads.find(lead => lead.data.id === leadId);
        const leadSaveRequest = this.createLeadRequest(specificLead);
        leadSaveRequest.start();
        /*
        const { access } = this.props.token;
        const { leads, activeLeadId } = this.state;
        const activeLeadIndex = leads.findIndex(lead => lead.data.id === activeLeadId);

        saveLead(
            leads[activeLeadIndex],
            access,
        ).then((response) => {
            const settings = {
                [activeLeadIndex]: {
                    uiState: {
                        pending: { $set: false },
                        stale: { $set: false },
                    },
                    serverId: { $set: response.id },
                },
            };

            const newLeads = update(leads, settings);
            this.setState({
                leads: newLeads,
            });
        });
        */
    }

    handleLeadNext = leadId => (e) => {
        e.preventDefault();
    }

    handleLeadPrev = leadId => (e) => {
        e.preventDefault();
    }

    renderLeadDetail = (key, lead) => {
        const leadOptions = this.props.leadFilterOptions[lead.form.values.project] || {};
        const formCallbacks = {
            onChange: this.handleFormChange(key),
            onFailure: this.handleFormFailure(key),
            onSuccess: this.handleFormSuccess(key),
            onPrev: this.handleLeadNext(key),
            onNext: this.handleLeadNext(key),
        };
        return (
            <div
                className={`${styles.right} ${key !== this.props.activeLeadId ? styles.hidden : ''}`}
                key={key}
            >
                <AddLeadForm
                    className={styles['add-lead-form']}
                    lead={lead}
                    leadOptions={leadOptions}
                    formCallbacks={formCallbacks}
                />
                <div className={styles['lead-preview']} >
                    LEAD PREVIEW
                </div>
            </div>
        );
    }

    render() {
        // const { activeLead } = this.props;
        return (
            <div styleName="add-lead">
                <Helmet>
                    <title>
                        { pageTitles.addLeads }
                    </title>
                </Helmet>
                <div styleName="left">
                    <AddLeadFilter />
                    <AddLeadList />
                    <AddLeadButtons />
                </div>
                <List
                    data={this.props.addLeadViewLeads}
                    modifier={this.renderLeadDetail}
                    keyExtractor={lead => lead.data.id}
                />
            </div>
        );
    }
}
