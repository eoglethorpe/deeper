import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import styles from './styles.scss';

import {
    Button,
} from '../../../../public/components/Action';

import {
    Form,
    SelectInput,
} from '../../../../public/components/Input';

import {
    RestBuilder,
} from '../../../../public/utils/rest';

import {
    createParamsForUser,
    createUrlForLeadFilterOptions,
} from '../../../../common/rest';
import {
    activeProjectSelector,
    leadFilterOptionsForProjectSelector,
} from '../../../../common/selectors/domainData';
import {
    tokenSelector,
} from '../../../../common/selectors/auth';
import {
    setLeadFilterOptionsAction,
} from '../../../../common/action-creators/domainData';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    className: PropTypes.string,
    onSubmit: PropTypes.func.isRequired,
    setLeadFilterOptions: PropTypes.func.isRequired,
    token: PropTypes.shape({
        access: PropTypes.string,
    }).isRequired,
    leadFilterOptions: PropTypes.object.isRequired, // eslint-disable-line 
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    leadFilterOptions: leadFilterOptionsForProjectSelector(state),
    token: tokenSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadFilterOptions: params => dispatch(setLeadFilterOptionsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles)
export default class FilterLeadsForm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static optionLabelSelector = (d = {}) => d.value;
    static optionKeySelector = (d = {}) => d.key;

    constructor(props) {
        super(props);
        this.state = {
            formValues: {},
            stale: false,
        };

        this.dateFilterOptions = [
            { key: 'today', label: 'Today' },
            { key: 'yesterday', label: 'Yesterday' },
            { key: 'this-week', label: 'This week' },
            { key: 'this-month', label: 'This month' },
            { key: 'this-year', label: 'This year' },
            { key: 'custom', label: 'Custom' },
        ];

        this.formElements = [
            'assigned_to',
            'created_at',
            'published_on',
            'confidentiality',
            'status',
        ];
    }

    componentDidMount() {
        const { activeProject } = this.props;
        this.requestProjectLeadFilterOptions(activeProject);
    }

    requestProjectLeadFilterOptions = (activeProject) => {
        if (this.leadFilterOptionsRequest) {
            this.leadFilterOptionsRequest.stop();
        }

        // eslint-disable-next-line
        this.leadFilterOptionsRequest = this.createRequestForProjectLeadFilterOptions(activeProject);
        this.leadFilterOptionsRequest.start();
        this.setState({
            loadingLeadFilters: true,
        });
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
                this.setState({
                    loadingLeadFilters: false,
                });
            })
            .retryTime(1000)
            .build();

        return leadFilterOptionsRequest;
    }

    handleChange = (values) => {
        this.setState({
            formValues: { ...this.state.formValues, ...values },
            stale: true,
        });
    }

    handleSubmit = (values) => {
        this.setState({
            stale: false,
        });
        this.props.onSubmit(values);
    }

    render() {
        const {
            className,
            leadFilterOptions,
        } = this.props;

        const {
            formValues,
            stale,
        } = this.state;

        const {
            confidentiality,
            status,
            assignedTo,
        } = leadFilterOptions;

        console.log(leadFilterOptions);
        return (
            <Form
                styleName="filters"
                className={className}
                successCallback={this.handleSubmit}
                changeCallback={this.handleChange}
                elements={this.formElements}
            >
                <SelectInput
                    formname="assigned_to"
                    options={assignedTo}
                    placeholder="Assigned to"
                    styleName="filter"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    keySelector={FilterLeadsForm.optionKeySelector}
                    value={formValues.assigned_to}
                    multiple
                />
                <SelectInput
                    formname="created_at"
                    options={this.dateFilterOptions}
                    placeholder="Created at"
                    styleName="filter"
                    value={formValues.created_at}
                />
                <SelectInput
                    formname="published_on"
                    options={this.dateFilterOptions}
                    placeholder="Published on"
                    styleName="filter"
                />
                <SelectInput
                    formname="confidentiality"
                    options={confidentiality}
                    placeholder="Confidentiality"
                    styleName="filter"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    keySelector={FilterLeadsForm.optionKeySelector}
                    value={formValues.confidentiality}
                />
                <SelectInput
                    formname="status"
                    options={status}
                    placeholder="Status"
                    styleName="filter"
                    labelSelector={FilterLeadsForm.optionLabelSelector}
                    keySelector={FilterLeadsForm.optionKeySelector}
                    value={formValues.status}
                />
                <Button
                    styleName="apply-filter-btn"
                    disabled={!stale}
                >
                    Apply Filter
                </Button>
            </Form>
        );
    }
}
