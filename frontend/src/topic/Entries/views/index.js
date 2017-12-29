import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    GridLayout,
    FormattedDate,
    ListView,
    LoadingAnimation,
} from '../../../public/components/View';
import { reverseRoute } from '../../../public/utils/common';
import {
    PrimaryButton,
} from '../../../public/components/Action';
import {
    SelectInput,
} from '../../../public/components/Input';
import {
    pathNames,
    iconNames,
} from '../../../common/constants';
import { FgRestBuilder } from '../../../public/utils/rest';

import schema from '../../../common/schema';

import {
    projectIdFromRoute,
    setEntriesAction,
    setProjectAction,
    entriesForProjectSelector,
    setAnalysisFrameworkAction,
    analysisFrameworkForProjectSelector,
} from '../../../common/redux';
import {
    urlForFilteredEntries,

    createParamsForUser,
    createParamsForFilteredEntries,
    createUrlForAnalysisFramework,
    createUrlForProject,
} from '../../../common/rest';

import widgetStore from '../../AnalysisFramework/widgetStore';
import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    projectId: projectIdFromRoute(state, props),
    entries: entriesForProjectSelector(state, props),
    analysisFramework: analysisFrameworkForProjectSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
});

const propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string,
        }),
    }),
    setProject: PropTypes.func.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.string.isRequired,
    setEntries: PropTypes.func.isRequired,
};

const defaultProps = {
    match: {
        params: {},
    },
};

const emptyList = [];

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Entries extends React.PureComponent {
    static leadKeyExtractor = d => d.id;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            filters: {},
        };

        this.items = [];
        this.gridItems = {};

        this.updateAnalysisFramework(props.analysisFramework);
        this.updateGridItems(props.entries);
    }

    componentWillMount() {
        const { projectId } = this.props;

        this.entriesRequest = this.createRequestForEntries(projectId);
        this.entriesRequest.start();

        this.projectRequest = this.createRequestForProject(projectId);
        this.projectRequest.start();

        this.setState({ pendingEntries: true, pendingProjectAndAf: true });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.projectId !== nextProps.projectId) {
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }
            if (this.projectRequest) {
                this.projectRequest.stop();
            }
            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }

            this.entriesRequest = this.createRequestForEntries(nextProps.projectId);
            this.entriesRequest.start();

            this.projectRequest = this.createRequestForProject(nextProps.projectId);
            this.projectRequest.start();

            this.setState({ pendingEntries: true, pendingProjectAndAf: true });
            return;
        }

        if (this.props.analysisFramework !== nextProps.analysisFramework) {
            this.updateAnalysisFramework(nextProps.analysisFramework);
            this.updateGridItems(nextProps.entries);
        } else if (this.props.entries !== nextProps.entries) {
            this.updateGridItems(nextProps.entries);
        }
    }

    componentWillUnmount() {
        if (this.entriesRequest) {
            this.entriesRequest.stop();
        }
        if (this.projectRequest) {
            this.projectRequest.stop();
        }
        if (this.analysisFrameworkRequest) {
            this.analysisFrameworkRequest.stop();
        }
    }

    getAttribute = (attributes, widgetId) => {
        const attribute = (
            attributes &&
            attributes.find(attr => attr.widget === widgetId)
        );

        return attribute && attribute.data;
    }

    getMaxHeight = () => this.items.reduce(
        (acc, item) => {
            const { height, top } = item.properties.listGridLayout;
            return Math.max(acc, height + top);
        },
        0,
    );

    getItemView = (item) => {
        const Component = this.widgets.find(
            w => w.id === item.widgetId,
        ).listComponent;

        return (
            <Component
                data={item.data}
                attribute={item.attribute}
            />
        );
    }

    createRequestForEntries = (projectId, filters = {}) => {
        const entryRequest = new FgRestBuilder()
            .url(urlForFilteredEntries)
            .params(() => createParamsForFilteredEntries({
                project: projectId,
                ...filters,
            }))
            .success((response) => {
                try {
                    schema.validate(response, 'entriesGetResponse');
                    const responseEntries = response.results.entries;
                    const responseLeads = response.results.leads;

                    const entries = responseLeads.map(lead => ({
                        ...lead,
                        entries: responseEntries.filter(e => e.lead === lead.id),
                    }));

                    this.props.setEntries({
                        projectId,
                        entries,
                    });
                    this.setState({ pendingEntries: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return entryRequest;
    }

    createRequestForProject = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForUser())
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({
                        project: response,
                    });

                    this.analysisFramework = this.createRequestForAnalysisFramework(
                        response.analysisFramework,
                    );
                    this.analysisFramework.start();
                } catch (er) {
                    console.error(er);
                }
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
            .success((response) => {
                try {
                    schema.validate(response, 'analysisFramework');
                    this.props.setAnalysisFramework({
                        analysisFramework: response,
                    });

                    this.setState({ pendingProjectAndAf: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkRequest;
    }

    updateAnalysisFramework(analysisFramework) {
        this.widgets = widgetStore
            .filter(widget => widget.view.listComponent)
            .map(widget => ({
                id: widget.id,
                title: widget.title,
                listComponent: widget.view.listComponent,
            }));

        if (analysisFramework.widgets) {
            this.items = analysisFramework.widgets.filter(
                w => this.widgets.find(w1 => w1.id === w.widgetId),
            );
        } else {
            this.items = [];
        }

        if (analysisFramework.filters) {
            this.filters = analysisFramework.filters.filter(
                f => this.items.find(item => item.key === f.key),
            );
        } else {
            this.filters = [];
        }
    }

    updateGridItems(entries) {
        this.gridItems = {};
        entries.forEach((entryGroup) => {
            entryGroup.entries.forEach((entry) => {
                this.gridItems[entry.id] = this.items.map(
                    item => ({
                        key: item.key,
                        widgetId: item.widgetId,
                        title: item.title,
                        layout: item.properties.listGridLayout,
                        attribute: this.getAttribute(entry.attributes, item.id),
                        data: item.properties.data,
                    }),
                );
            });
        });
    }

    handleFilterChange = (key, values) => {
        const filters = { ...this.state.filters };
        filters[key] = values;
        this.setState({ filters }, () => {
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }

            this.entriesRequest = this.createRequestForEntries(this.props.projectId, filters);
            this.entriesRequest.start();
        });
    }

    renderEntries = (key, data) => (
        <div
            key={data.id}
            className={styles.entry}
            style={{ height: this.getMaxHeight() }}
        >
            <GridLayout
                className={styles['grid-layout']}
                modifier={this.getItemView}
                items={this.gridItems[data.id] || emptyList}
                viewOnly
            />
        </div>
    )

    renderLeadGroupedEntriesItem = (key, data) => {
        const {
            match,
        } = this.props;

        const route = reverseRoute(pathNames.editEntries, {
            projectId: match.params.projectId,
            leadId: key,
        });

        return (
            <div
                key={data.id}
                className={styles['lead-entries']}
            >
                <header className={styles.header}>
                    <div className={styles['info-container']}>
                        <h2>{data.title}</h2>
                        <p>
                            <span className={iconNames.calendar} />
                            <FormattedDate
                                date={data.createdAt}
                                mode="dd-MM-yyyy"
                            />
                        </p>
                    </div>
                    <div className={styles['action-buttons']}>
                        <Link
                            title="Edit Entry"
                            to={route}
                        >
                            <PrimaryButton iconName={iconNames.edit} >
                                Edit
                            </PrimaryButton>
                        </Link>
                    </div>
                </header>
                <ListView
                    data={data.entries || emptyList}
                    keyExtractor={Entries.leadKeyExtractor}
                    modifier={this.renderEntries}
                />
            </div>
        );
    }

    renderFilter = ({ key, properties: filter }) => {
        if (!filter || !filter.type) {
            return null;
        }

        if (filter.type === 'multiselect') {
            return (
                <SelectInput
                    key={key}
                    options={filter.options}
                    showHintAndError={false}
                    onChange={values => this.handleFilterChange(key, values)}
                    value={this.state.filters[key] || []}
                    multiple
                />
            );
        }

        return null;
    }


    render() {
        const { entries } = this.props;

        return (
            <div styleName="entries">
                {
                    ((this.state.pendingEntries || this.state.pendingProjectAndAf) && (
                        <LoadingAnimation />
                    )) || ([
                        <div
                            key="filters"
                            styleName="filters"
                        >
                            {
                                this.filters && this.filters.map(
                                    filter => this.renderFilter(filter),
                                )
                            }
                        </div>,
                        <ListView
                            key="lead-entries-list"
                            styleName="lead-entries-list"
                            data={entries || emptyList}
                            keyExtractor={Entries.leadKeyExtractor}
                            modifier={this.renderLeadGroupedEntriesItem}
                        />,
                    ])
                }
            </div>
        );
    }
}
