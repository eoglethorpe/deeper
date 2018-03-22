import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { isFalsy, reverseRoute } from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';
import GridLayout from '../../vendor/react-store/components/View/GridLayout';
import ListView from '../../vendor/react-store/components/View/List/ListView';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import Pager from '../../vendor/react-store/components/View/Pager';
import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import BoundError from '../../components/BoundError';

import {
    iconNames,
    pathNames,
} from '../../constants';
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

    entriesViewActivePageSelector,
    totalEntriesCountForProjectSelector,
    setEntriesViewActivePageAction,

    entryStringsSelector,
} from '../../redux';
import {
    createUrlForFilteredEntries,

    createParamsForUser,
    createParamsForFilteredEntries,
    createUrlForAnalysisFramework,
    createUrlForProject,

    transformResponseErrorToFormError,
} from '../../rest';
import schema from '../../schema';
import notify from '../../notify';

import FilterEntriesForm from './FilterEntriesForm';
import styles from './styles.scss';

const mapStateToProps = (state, props) => ({
    entries: entriesForProjectSelector(state, props),
    analysisFramework: analysisFrameworkForProjectSelector(state, props),
    entriesFilter: entriesViewFilterSelector(state, props),
    gridItems: gridItemsForProjectSelector(state, props),
    widgets: widgetsSelector(state, props),
    maxHeight: maxHeightForProjectSelector(state, props),
    projectId: projectIdFromRouteSelector(state, props),
    activePage: entriesViewActivePageSelector(state, props),
    totalEntriesCount: totalEntriesCountForProjectSelector(state, props),

    entryStrings: entryStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setEntries: params => dispatch(setEntriesAction(params)),
    setProject: params => dispatch(setProjectAction(params)),
    setAnalysisFramework: params => dispatch(setAnalysisFrameworkAction(params)),
    unsetEntriesViewFilter: params => dispatch(unsetEntriesViewFilterAction(params)),
    setEntriesViewActivePage: params => dispatch(setEntriesViewActivePageAction(params)),
});

const propTypes = {
    activePage: PropTypes.number.isRequired,
    setProject: PropTypes.func.isRequired,
    setAnalysisFramework: PropTypes.func.isRequired,
    entries: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    analysisFramework: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    projectId: PropTypes.number.isRequired,
    setEntries: PropTypes.func.isRequired,

    entriesFilter: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    unsetEntriesViewFilter: PropTypes.func.isRequired,

    gridItems: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    maxHeight: PropTypes.number,
    totalEntriesCount: PropTypes.number,
    setEntriesViewActivePage: PropTypes.func.isRequired,

    entryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    maxHeight: 0,
    totalEntriesCount: 0,
};

const MAX_ENTRIES_PER_REQUEST = 5;
const emptyList = [];

@BoundError
@connect(mapStateToProps, mapDispatchToProps)
export default class Entries extends React.PureComponent {
    static leadKeyExtractor = d => d.id;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pendingEntries: false,
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
            activePage: oldActivePage,
        } = this.props;
        const {
            projectId: newProjectId,
            analysisFramework: newAf,
            entriesFilter: newFilter,
            activePage: newActivePage,
        } = nextProps;


        if (oldProjectId !== newProjectId) {
            // NOTE: If projects is changed; af, filter and entries will also changed
            if (this.projectRequest) {
                this.projectRequest.stop();
            }
            if (this.analysisFrameworkRequest) {
                this.analysisFrameworkRequest.stop();
            }
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }

            this.setState({
                pendingEntries: false,
                pendingAf: true,
            });

            this.projectRequest = this.createRequestForProject(newProjectId);
            this.projectRequest.start();
            return;
        }

        if (oldAf !== newAf && (!oldAf || !newAf || oldAf.versionId !== newAf.versionId)) {
            // clear previous filters
            this.props.unsetEntriesViewFilter();
        }

        if (oldFilter !== newFilter || oldActivePage !== newActivePage) {
            // Make request for new entries after filter has changed
            if (this.entriesRequest) {
                this.entriesRequest.stop();
            }
            this.entriesRequest = this.createRequestForEntries(
                newProjectId,
                newFilter,
                newActivePage,
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

    createRequestForEntries = (projectId, filters = {}, activePage) => {
        const entriesRequestOffset = (activePage - 1) * MAX_ENTRIES_PER_REQUEST;
        const entriesRequestLimit = MAX_ENTRIES_PER_REQUEST;

        const entryRequest = new FgRestBuilder()
            .url(createUrlForFilteredEntries({
                offset: entriesRequestOffset,
                limit: entriesRequestLimit,
            }))
            .params(() => createParamsForFilteredEntries({
                project: projectId,
                ...filters,
            }))
            .preLoad(() => {
                this.setState({ pendingEntries: true });
            })
            .postLoad(() => {
                this.setState({ pendingEntries: false });
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
                        totalEntriesCount: response.count,
                    });
                    this.setState({ pristine: true });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: this.props.entryStrings('entriesTabLabel'),
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: this.props.entryStrings('entriesTabLabel'),
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load entries', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return entryRequest;
    }

    createRequestForProject = (projectId) => {
        const projectRequest = new FgRestBuilder()
            .url(createUrlForProject(projectId))
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({
                    pendingAf: true,
                });
            })
            .success((response) => {
                try {
                    schema.validate(response, 'projectGetResponse');
                    this.props.setProject({ project: response });

                    if (isFalsy(response.analysisFramework)) {
                        console.warn('There is no analysis framework');
                        this.setState({
                            pendingAf: false,
                            pendingEntries: false,
                        });
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
                this.setState({
                    pendingAf: false,
                });
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Project', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                this.setState({
                    pendingAf: false,
                });
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

                    this.entriesRequest = this.createRequestForEntries(
                        this.props.projectId,
                        this.props.entriesFilter,
                        this.props.activePage,
                    );
                    this.entriesRequest.start();

                    this.setState({
                        pendingEntries: true,
                    });
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

    handlePageClick = (page) => {
        this.props.setEntriesViewActivePage({ activePage: page });
    }

    renderItemView = (item) => {
        const { widgets } = this.props;
        const widget = widgets.find(w => w.id === item.widgetId);
        const ListComponent = widget.listComponent;
        return (
            <ListComponent
                data={item.data}
                attribute={item.attribute}
                entry={item.entry}
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
                    className={styles.gridLayout}
                    modifier={this.renderItemView}
                    items={gridItems[data.id] || emptyList}
                    viewOnly
                />
            </div>
        );
    }

    renderLeadGroupedEntriesHeader = ({
        leadId,
        createdAt,
        title,
    }) => {
        const { projectId } = this.props;
        const route = reverseRoute(pathNames.editEntries, {
            projectId,
            leadId,
        });

        return (
            <header className={styles.header}>
                <div className={styles.infoContainer}>
                    <h2 className={styles.heading}>
                        {title}
                    </h2>
                    <div className={styles.detail}>
                        <span className={iconNames.calendar} />
                        <FormattedDate
                            date={createdAt}
                            mode="dd-MM-yyyy"
                        />
                    </div>
                </div>
                <div className={styles.actionButtons}>
                    <Link
                        title={this.props.entryStrings('editEntryLinkTitle')}
                        to={route}
                    >
                        <AccentButton>
                            {this.props.entryStrings('editEntryButtonLabel')}
                        </AccentButton>
                    </Link>
                </div>
            </header>
        );
    }

    renderLeadGroupedEntriesItem = (key, data) => {
        const {
            entries = emptyList,
            id,
            title,
            createdAt,
        } = data;

        const LeadGroupedEntriesHeader = this.renderLeadGroupedEntriesHeader;

        return (
            <div
                key={data.id}
                className={styles.leadGroupedEntries}
            >
                <LeadGroupedEntriesHeader
                    leadId={id}
                    title={title}
                    createdAt={createdAt}
                />
                <ListView
                    className={styles.entries}
                    data={entries}
                    modifier={this.renderEntries}
                />
            </div>
        );
    }

    renderFooter = () => {
        const {
            totalEntriesCount,
            activePage,
        } = this.props;

        if (totalEntriesCount <= 0) {
            return null;
        }

        return (
            <footer className={styles.footer}>
                <Pager
                    activePage={activePage}
                    itemsCount={totalEntriesCount}
                    maxItemsPerPage={MAX_ENTRIES_PER_REQUEST}
                    onPageClick={this.handlePageClick}
                />
            </footer>
        );
    }

    renderLeadEntries = () => {
        const { entries = [] } = this.props;
        const {
            pendingEntries,
            pendingAf,
        } = this.state;
        const pending = pendingEntries || pendingAf;
        if (pending) {
            return (
                <LoadingAnimation
                    className={styles.loadingAnimation}
                />
            );
        }

        return (
            <ListView
                className={styles.leadEntries}
                data={entries}
                modifier={this.renderLeadGroupedEntriesItem}
            />
        );
    }

    render() {
        const { pendingAf } = this.state;
        const Footer = this.renderFooter;
        const LeadEntries = this.renderLeadEntries;

        return (
            <div className={styles.entriesView}>
                <FilterEntriesForm pending={pendingAf} />
                <LeadEntries />
                <Footer />
            </div>
        );
    }
}
