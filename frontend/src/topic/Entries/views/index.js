import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import {
    FormattedDate,
    GridLayout,
    ListView,
    LoadingAnimation,
    Pager,
} from '../../../public/components/View';
import { reverseRoute } from '../../../public/utils/common';
import { PrimaryButton } from '../../../public/components/Action';
import {
    iconNames,
    pathNames,
} from '../../../common/constants';
import { FgRestBuilder } from '../../../public/utils/rest';

import schema from '../../../common/schema';

import {
    setEntriesAction,
    setProjectAction,
    entriesForProjectSelector,
    entriesViewFilterSelector,
    setAnalysisFrameworkAction,
    analysisFrameworkForProjectSelector,
    unsetEntriesViewFilterAction,

    gridItemsForProjectSelector,
    widgetsSelector,
    maxHeightForProjectSelector,

    projectIdFromRouteSelector,
} from '../../../common/redux';

import {
    urlForFilteredEntries,

    createParamsForUser,
    createParamsForFilteredEntries,
    createUrlForAnalysisFramework,
    createUrlForProject,
} from '../../../common/rest';

import FilterEntriesForm from './FilterEntriesForm';
// import widgetStore from '../../AnalysisFramework/widgetStore';
import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    entries: entriesForProjectSelector(state, props),
    analysisFramework: analysisFrameworkForProjectSelector(state, props),
    entriesFilter: entriesViewFilterSelector(state, props),
    gridItems: gridItemsForProjectSelector(state, props),
    widgets: widgetsSelector(state, props),
    maxHeight: maxHeightForProjectSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),
});

const propTypes = {
    setProject: PropTypes.func.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.string.isRequired,
    setEntries: PropTypes.func.isRequired,

    entriesFilter: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    unsetEntriesViewFilter: PropTypes.func.isRequired,

    gridItems: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    maxHeight: PropTypes.number,
};

const defaultProps = {
    maxHeight: 0,
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
            pendingEntries: true,
            pendingAf: true,
        };
    }

    componentWillMount() {
        const { projectId } = this.props;

        this.projectRequest = this.createRequestForProject(projectId);
        this.projectRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        const {
            projectId: oldProjectId,
            analysisFramework: oldAf,
            entriesFilter: oldFilter,
        } = this.props;
        const {
            projectId: newProjectId,
            analysisFramework: newAf,
            entriesFilter: newFilter,
        } = nextProps;


        if (oldProjectId !== newProjectId) {
            // NOTE: If projects is changed; af, filter and entries will also changed
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }
            if (this.projectRequest) {
                this.projectRequest.stop();
            }
            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }

            this.projectRequest = this.createRequestForProject(newProjectId);
            this.projectRequest.start();

            this.setState({
                pendingEntries: true,
                pendingAf: true,
            });
            return;
        }

        if (oldAf !== newAf && (!oldAf || !newAf || oldAf.versionId !== newAf.versionId)) {
            // clear previous filters
            this.props.unsetEntriesViewFilter();
        }

        if (oldFilter !== newFilter) {
            // Make request for new entries after filter has changed
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }
            this.entriesRequest = this.createRequestForEntries(
                newProjectId,
                newFilter,
            );
            this.entriesRequest.start();
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
            // To add little padding at bottom
            return Math.max(acc, height + top + 12);
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
            .preLoad(() => {
                this.setState({
                    pendingEntries: true,
                });
            })
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
                    this.setState({
                        pendingEntries: false,
                        pristine: true,
                    });
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
                    this.props.setProject({ project: response });

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
                    this.props.setAnalysisFramework({ analysisFramework: response });

                    this.entriesRequest = this.createRequestForEntries(
                        this.props.projectId,
                        this.props.entriesFilter,
                    );
                    this.entriesRequest.start();

                    this.setState({ pendingAf: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .build();
        return analysisFrameworkRequest;
    }

    createRequestForEntries = (projectId, filters = {}) => {
        const entryRequest = new FgRestBuilder()
            .url(urlForFilteredEntries)
            .params(() => createParamsForFilteredEntries({
                project: projectId,
                ...filters,
            }))
            .preLoad(() => {
                this.setState({
                    pendingEntries: true,
                });
            })
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

    renderItemView = (item) => {
        const { widgets } = this.props;
        const widget = widgets.find(w => w.id === item.widgetId);
        const ListComponent = widget.listComponent;
        return (
            <ListComponent
                data={item.data}
                attribute={item.attribute}
            />
        );
    }

    renderEntries = (key, data) => {
        const {
            maxHeight,
            gridItems,
        } = this.props;
        return (
            <div
                key={data.id}
                className={styles.entry}
                style={{ height: maxHeight }}
            >
                <GridLayout
                    className={styles['grid-layout']}
                    modifier={this.renderItemView}
                    items={gridItems[data.id] || emptyList}
                    viewOnly
                />
            </div>
        );
    }

    renderLeadGroupedEntriesItem = (key, data) => {
        const { projectId } = this.props;

        const route = reverseRoute(pathNames.editEntries, {
            projectId,
            leadId: key,
        });

        return (
            <div
                key={data.id}
                className={styles['lead-entries']}
            >
                <header className={styles.header}>
                    <div className={styles['info-container']}>
                        <h2 className={styles.heading}>
                            {data.title}
                        </h2>
                        <div className={styles.detail}>
                            <span className={iconNames.calendar} />
                            <FormattedDate
                                date={data.createdAt}
                                mode="dd-MM-yyyy"
                            />
                        </div>
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

    render() {
        const { entries = [] } = this.props;

        const {
            pendingEntries,
            pendingAf,
        } = this.state;

        const pending = pendingEntries || pendingAf;

        return (
            <div styleName="entries">
                <FilterEntriesForm pending={pendingAf} />
                <div styleName="lead-entries-container">
                    { pending && <LoadingAnimation /> }
                    { !pending &&
                        <ListView
                            key="lead-entries-list"
                            styleName="lead-entries-list"
                            data={entries}
                            keyExtractor={Entries.leadKeyExtractor}
                            modifier={this.renderLeadGroupedEntriesItem}
                        />
                    }
                </div>
                <footer styleName="footer">
                    <Pager
                        activePage={1}
                        itemsCount={30}
                        maxItemsPerPage={10}
                        onPageClick={() => {}}
                    />
                </footer>
            </div>
        );
    }
}
