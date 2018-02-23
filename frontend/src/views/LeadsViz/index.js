import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import { reverseRoute } from '../../vendor/react-store/utils/common';

import SunBurstView from '../../vendor/react-store/components/Visualization/SunBurstView';
import ChordDiagramView from '../../vendor/react-store/components/Visualization/ChordDiagramView';
import TreeMapView from '../../vendor/react-store/components/Visualization/TreeMapView';
import CorrelationMatrixView from '../../vendor/react-store/components/Visualization/CorrelationMatrixView';
import ForceDirectedGraphView from '../../vendor/react-store/components/Visualization/ForceDirectedGraphView';
import CollapsibleTreeView from '../../vendor/react-store/components/Visualization/CollapsibleTreeView';
import RadialDendrogramView from '../../vendor/react-store/components/Visualization/RadialDendrogramView';
import GeoReferencedMap from '../../vendor/react-store/components/Visualization/GeoReferencedMap';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';
import BoundError from '../../components/BoundError';

import {
    urlForLeadTopicModeling,
    urlForLeadTopicCorrelation,
    urlForLeadNerDocsId,
    createParamsForUser,
    createParamsForLeadTopicModeling,
    createParamsForLeadTopicCorrelation,
    createUrlForLeadsOfProject,
    createParamsForLeadNer,
    transformResponseErrorToFormError,
} from '../../rest';
import {
    activeProjectSelector,
    leadPageFilterSelector,

    setLeadVisualizationAction,
    hierarchialDataSelector,
    chordDataSelector,
    correlationDataSelector,
    forceDirectedDataSelector,
    geoPointsDataSelector,
} from '../../redux';
import schema from '../../schema';
import notify from '../../notify';
import { pathNames } from '../../constants/';

import FilterLeadsForm from '../Leads/FilterLeadsForm';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.number.isRequired,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    hierarchicalData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    correlationData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    chordData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    forceDirectedData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    geoPointsData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setLeadVisualization: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    totalLeadsCount: 0,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    filters: leadPageFilterSelector(state),
    hierarchicalData: hierarchialDataSelector(state),
    chordData: chordDataSelector(state),
    correlationData: correlationDataSelector(state),
    forceDirectedData: forceDirectedDataSelector(state),
    geoPointsData: geoPointsDataSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadVisualization: parms => dispatch(setLeadVisualizationAction(parms)),
});

@BoundError
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeadsViz extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    // REST UTILS
    // TODO: IMP move this somewhere
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

    static sizeValueAccessor = d => d.size;
    static labelValueAccessor = d => d.name;
    static groupValueAccessor = d => d.group;
    static valueAccessor = d => d.value;

    constructor(props) {
        super(props);

        this.state = {
            loadingLeads: true,
            hierarchicalDataPending: true,
            chordDataPending: true,
            correlationDataPending: true,
            forceDirectedDataPending: true,
            geoPointsDataPending: true,
        };
    }

    componentWillMount() {
        this.leadCDIdRequest = this.createRequestForProjectLeadsCDId({
            activeProject: this.props.activeProject,
            filters: this.props.filters,
        });
        this.leadCDIdRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.filters !== this.props.filters ||
            nextProps.activeProject !== this.props.activeProject
        ) {
            if (this.leadCDIdRequest) {
                this.leadCDIdRequest.stop();
            }
            if (this.requestForLeadTopicModeling) {
                this.requestForLeadTopicModeling.stop();
            }
            if (this.requestForLeadTopicCorrelaction) {
                this.requestForLeadTopicCorrelaction.stop();
            }
            if (this.requestForLeadNer) {
                this.requestForLeadNer.stop();
            }
            this.leadCDIdRequest = this.createRequestForProjectLeadsCDId({
                activeProject: nextProps.activeProject,
                filters: nextProps.filters,
            });
            this.leadCDIdRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.leadCDIdRequest) {
            this.leadCDIdRequest.stop();
        }
        if (this.requestForLeadTopicModeling) {
            this.requestForLeadTopicModeling.stop();
        }
        if (this.requestForLeadTopicCorrelaction) {
            this.requestForLeadTopicCorrelaction.stop();
        }
        if (this.requestForLeadNer) {
            this.requestForLeadNer.stop();
        }
    }

    createRequestForProjectLeadsCDId = ({ activeProject, filters }) => {
        const sanitizedFilters = LeadsViz.getFiltersForRequest(filters);

        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            fields: 'classified_doc_id',
            ...sanitizedFilters,
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({
                    loadingLeads: true,
                    hierarchicalDataPending: true,
                    chordDataPending: true,
                    correlationDataPending: true,
                    forceDirectedDataPending: true,
                    geoPointsDataPending: true,
                });
            })
            .postLoad(() => {
            })
            .success((response) => {
                try {
                    schema.validate(response, 'leadsCDIdGetResponse');
                    const docIds = response.results.reduce((acc, lead) => {
                        if (lead.classifiedDocId) {
                            acc.push(lead.classifiedDocId);
                        }
                        return acc;
                    }, []);

                    if (this.requestForLeadTopicModeling) {
                        this.requestForLeadTopicModeling.stop();
                    }
                    if (this.requestForLeadTopicCorrelaction) {
                        this.requestForLeadTopicCorrelaction.stop();
                    }
                    if (this.requestForLeadNer) {
                        this.requestForLeadNer.stop();
                    }

                    this.requestForLeadTopicModeling =
                        this.createRequestForLeadTopicModeling(docIds);
                    this.requestForLeadTopicCorrelaction =
                        this.createRequestForLeadTopicCorrelation(docIds);
                    this.requestForLeadNer =
                        this.createRequestForLeadNer(docIds);

                    this.requestForLeadTopicModeling.start();
                    this.requestForLeadTopicCorrelaction.start();
                    this.requestForLeadNer.start();

                    this.setState({ loadingLeads: false });
                } catch (er) {
                    console.error(er);
                }
            })
            .failure((response) => {
                const message = transformResponseErrorToFormError(response.errors).formErrors.join('');
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message,
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    loadingLeads: false,
                    hierarchicalDataPending: false,
                    chordDataPending: false,
                    correlationDataPending: false,
                    forceDirectedDataPending: false,
                    geoPointsDataPending: false,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load leads', // FIXME: strings
                    duration: notify.duration.MEDIUM,
                });
                this.setState({
                    loadingLeads: false,
                    hierarchicalDataPending: false,
                    chordDataPending: false,
                    correlationDataPending: false,
                    forceDirectedDataPending: false,
                    geoPointsDataPending: false,
                });
            })
            .build();
        return leadRequest;
    }

    createRequestForLeadTopicModeling = (docIds) => {
        const request = new FgRestBuilder()
            .url(urlForLeadTopicModeling)
            .params(createParamsForLeadTopicModeling({
                doc_ids: docIds,
                number_of_topics: 5,
                depth: 2,
                keywords_per_topic: 3,
            }))
            .preLoad(() => {
                this.setState({ hierarchicalDataPending: true });
            })
            .postLoad(() => {
                this.setState({ hierarchicalDataPending: false });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.props.setLeadVisualization({
                        hierarchial: response,
                        projectId: this.props.activeProject,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Hierarchical Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Hierarchical Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }

    createRequestForLeadNer = (docIds) => {
        const request = new FgRestBuilder()
            .url(urlForLeadNerDocsId)
            .params(createParamsForLeadNer({
                doc_ids: docIds,
            }))
            .preLoad(() => {
                this.setState({
                    geoPointsDataPending: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    geoPointsDataPending: false,
                });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.props.setLeadVisualization({
                        geoPoints: response.locations,
                        projectId: this.props.activeProject,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Geo Points Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Geo Points Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }

    createRequestForLeadTopicCorrelation = (docIds) => {
        const request = new FgRestBuilder()
            .url(urlForLeadTopicCorrelation)
            .params(createParamsForLeadTopicCorrelation({
                doc_ids: docIds,
            }))
            .preLoad(() => {
                this.setState({ correlationDataPending: true,
                    chordDataPending: true,
                    forceDirectedDataPending: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    correlationDataPending: false,
                    chordDataPending: false,
                    forceDirectedDataPending: false,
                });
            })
            .success((response) => {
                try {
                    // FIXME: write schema
                    this.props.setLeadVisualization({
                        correlation: response,
                        projectId: this.props.activeProject,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.warn('Failure', response);
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Topic Correlation Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads Visualization', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Failed to load Topic Correlation Data from NLP Server',
                    duration: notify.duration.MEDIUM,
                });
            })
            .build();
        return request;
    }

    render() {
        const {
            activeProject,
            chordData,
            hierarchicalData,
            correlationData,
            forceDirectedData,
            geoPointsData,
        } = this.props;

        const {
            loadingLeads,
            hierarchicalDataPending,
            chordDataPending,
            correlationDataPending,
            forceDirectedDataPending,
            geoPointsDataPending,
        } = this.state;

        return (
            <div styleName="leads">
                <header styleName="header">
                    <FilterLeadsForm styleName="filters" />
                </header>
                <div styleName="viz-container">
                    <GeoReferencedMap
                        styleName="geo-referenced-map viz"
                        loading={loadingLeads || geoPointsDataPending}
                        geoPoints={geoPointsData.points}
                    />
                    <TreeMapView
                        styleName="tree-map viz"
                        data={hierarchicalData}
                        loading={loadingLeads || hierarchicalDataPending}
                        valueAccessor={LeadsViz.sizeValueAccessor}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                    <SunBurstView
                        styleName="sun-burst viz"
                        data={hierarchicalData}
                        loading={loadingLeads || hierarchicalDataPending}
                        valueAccessor={LeadsViz.sizeValueAccessor}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                    <ChordDiagramView
                        styleName="chord-diagram viz"
                        data={chordData.values}
                        loading={loadingLeads || chordDataPending}
                        labelsData={chordData.labels}
                        valueAccessor={LeadsViz.sizeValueAccessor}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                    <CorrelationMatrixView
                        styleName="correlation-matrix viz"
                        data={correlationData}
                        loading={loadingLeads || correlationDataPending}
                        margins={{ top: 100, right: 0, bottom: 50, left: 100 }}
                    />
                    <ForceDirectedGraphView
                        styleName="force-directed-graph viz"
                        data={forceDirectedData}
                        loading={loadingLeads || forceDirectedDataPending}
                        idAccessor={d => d.id}
                        groupAccessor={LeadsViz.groupValueAccessor}
                        valueAccessor={LeadsViz.valueAccessor}
                        useVoronoi={false}
                    />
                    <CollapsibleTreeView
                        styleName="collapsible-tree viz"
                        data={hierarchicalData}
                        loading={loadingLeads || hierarchicalDataPending}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                    <RadialDendrogramView
                        styleName="radial-dendrogram viz"
                        data={hierarchicalData}
                        loading={loadingLeads || hierarchicalDataPending}
                        labelAccessor={LeadsViz.labelValueAccessor}
                    />
                </div>
                <footer styleName="footer">
                    <div styleName="link-container">
                        <Link
                            styleName="link"
                            to={reverseRoute(pathNames.leads, { projectId: activeProject })}
                            replace
                        >
                            Show Table
                        </Link>
                    </div>
                </footer>
            </div>
        );
    }
}
