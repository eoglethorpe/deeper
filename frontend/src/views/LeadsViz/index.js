import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ts from '../../ts';

import {
    reverseRoute,
    isObjectEmpty,
} from '../../vendor/react-store/utils/common';

import SunBurstView from '../../vendor/react-store/components/Visualization/SunBurstView';
import ChordDiagramView from '../../vendor/react-store/components/Visualization/ChordDiagramView';
import TreeMapView from '../../vendor/react-store/components/Visualization/TreeMapView';
import CorrelationMatrixView from '../../vendor/react-store/components/Visualization/CorrelationMatrixView';
import ForceDirectedGraphView from '../../vendor/react-store/components/Visualization/ForceDirectedGraphView';
import CollapsibleTreeView from '../../vendor/react-store/components/Visualization/CollapsibleTreeView';
import RadialDendrogramView from '../../vendor/react-store/components/Visualization/RadialDendrogramView';
import GeoReferencedMap from '../../vendor/react-store/components/Visualization/GeoReferencedMap';
import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';

import {
    projectDetailsSelector,
    leadPageFilterSelector,

    setLeadVisualizationAction,
    hierarchialDataSelector,
    chordDataSelector,
    correlationDataSelector,
    forceDirectedDataSelector,
    geoPointsDataSelector,
} from '../../redux';
import { pathNames } from '../../constants/';

import LeadKeywordCorrelationRequest from './requests/LeadKeywordCorrelationRequest';
import LeadTopicCorrelationRequest from './requests/LeadTopicCorrelationRequest';
import LeadTopicModelingRequest from './requests/LeadTopicModelingRequest';
import LeadCDIdRequest from './requests/LeadCDIdRequest';
import LeadNerRequest from './requests/LeadNerRequest';

import FilterLeadsForm from '../Leads/FilterLeadsForm';
import styles from './styles.scss';

const propTypes = {
    activeProject: PropTypes.shape({
        id: PropTypes.number,
        title: PropTypes.string,
    }).isRequired,
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
    activeProject: projectDetailsSelector(state),
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

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class LeadsViz extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static sizeValueAccessor = d => d.size;
    static labelValueAccessor = d => d.name;
    static groupValueAccessor = d => d.group;
    static valueAccessor = d => d.value;

    constructor(props) {
        super(props);

        this.state = {
            noLeadSelected: false,
            loadingLeads: true,
            hierarchicalDataPending: true,
            chordDataPending: true,
            correlationDataPending: true,
            forceDirectedDataPending: true,
            geoPointsDataPending: true,
        };
    }

    componentWillMount() {
        this.startRequestForLeadCDId();
    }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.filters !== this.props.filters ||
            nextProps.activeProject.id !== this.props.activeProject.id
        ) {
            if (this.leadCDIdRequest) {
                this.leadCDIdRequest.stop();
            }
            this.stopNlpRequests();

            this.startRequestForLeadCDId(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.leadCDIdRequest) {
            this.leadCDIdRequest.stop();
        }
        this.stopNlpRequests();
    }

    startNlpRequests = (docIds = []) => {
        if (docIds.length > 0) {
            this.startRequestForLeadTopicModeling(docIds);
            this.startRequestForLeadNer(docIds);
            this.startRequestForLeadTopicCorrelation(docIds);
            this.startRequestForLeadKeywordCorrelationRequest(docIds);
            this.setState({ noLeadSelected: false });
        } else {
            this.setState({ noLeadSelected: true });
        }
    }

    stopNlpRequests = () => {
        if (this.leadTopicModelingRequest) {
            this.leadTopicModelingRequest.stop();
        }
        if (this.leadNerRequest) {
            this.leadNerRequest.stop();
        }
        if (this.leadTopicCorrelationRequest) {
            this.leadTopicCorrelationRequest.stop();
        }
        if (this.leadKeywordCorrelationRequest) {
            this.leadKeywordCorrelationRequest.stop();
        }
    }

    startRequestForLeadCDId = (props = this.props) => {
        if (this.leadCDIdRequest) {
            this.leadCDIdRequest.stop();
        }
        const { activeProject, filters } = props;
        const { stopNlpRequests, startNlpRequests } = this;
        const leadCDIdRequest = new LeadCDIdRequest({
            stopNlpRequests,
            startNlpRequests,
            setState: params => this.setState(params),
        });
        this.leadCDIdRequest = leadCDIdRequest.create({ activeProject, filters });
        this.leadCDIdRequest.start();
    }

    startRequestForLeadTopicModeling = (docIds, props = this.props) => {
        if (this.leadTopicModelingRequest) {
            this.leadTopicModelingRequest.stop();
        }
        const { activeProject } = props;
        const leadTopicModelingRequest = new LeadTopicModelingRequest({
            setLeadVisualization: this.props.setLeadVisualization,
            setState: params => this.setState(params),
        });
        this.leadTopicModelingRequest = leadTopicModelingRequest.create({
            activeProject, docIds, isFilter: !isObjectEmpty(this.props.filters),
        });
        this.leadTopicModelingRequest.start();
    }

    startRequestForLeadNer = (docIds, props = this.props) => {
        if (this.leadNerRequest) {
            this.leadNerRequest.stop();
        }
        const { activeProject, setLeadVisualization } = props;
        const leadNerRequest = new LeadNerRequest({
            setLeadVisualization,
            setState: params => this.setState(params),
        });
        this.leadNerRequest = leadNerRequest.create({
            activeProject, docIds, isFilter: !isObjectEmpty(this.props.filters),
        });
        this.leadNerRequest.start();
    }

    startRequestForLeadTopicCorrelation = (docIds, props = this.props) => {
        if (this.leadTopicCorrelationRequest) {
            this.leadTopicCorrelationRequest.stop();
        }
        const { activeProject, setLeadVisualization } = props;
        const leadTopicCorrelationRequest = new LeadTopicCorrelationRequest({
            setLeadVisualization,
            setState: params => this.setState(params),
        });
        this.leadTopicCorrelationRequest = leadTopicCorrelationRequest.create({
            activeProject, docIds, isFilter: !isObjectEmpty(this.props.filters),
        });
        this.leadTopicCorrelationRequest.start();
    }

    startRequestForLeadKeywordCorrelationRequest = (docIds, props = this.props) => {
        if (this.leadKeywordCorrelationRequest) {
            this.leadKeywordCorrelationRequest.stop();
        }
        const { activeProject, setLeadVisualization } = props;
        const leadKeywordCorrelationRequest = new LeadKeywordCorrelationRequest({
            setLeadVisualization,
            setState: params => this.setState(params),
        });
        this.leadKeywordCorrelationRequest = leadKeywordCorrelationRequest.create({
            activeProject, docIds, isFilter: !isObjectEmpty(this.props.filters),
        });
        this.leadKeywordCorrelationRequest.start();
    }

    renderNoLeadFound = () => (
        <div className={styles.noLeadFound}>
            <h3>
                {
                    // No leads found
                    _ts('leadsViz', 'noLeadsFoundHeader')
                }
            </h3>
            <p>
                {
                    // Try with different filters
                    _ts('leadsViz', 'noLeadsFoundDescription')
                }
            </p>
        </div>
    )

    renderCharts = () => {
        const {
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
            <div className={styles.vizContainer}>
                <GeoReferencedMap
                    className={`${styles.geoReferencedMap} ${styles.viz}`}
                    vizContainerClass={styles.chartContainer}
                    loading={loadingLeads || geoPointsDataPending}
                    geoPoints={geoPointsData.points}
                />
                <TreeMapView
                    className={`${styles.treeMap} ${styles.viz}`}
                    data={hierarchicalData}
                    vizContainerClass={styles.chartContainer}
                    loading={loadingLeads || hierarchicalDataPending}
                    headerText={_ts('leadsViz', 'treeMap')}
                    valueAccessor={LeadsViz.sizeValueAccessor}
                    labelAccessor={LeadsViz.labelValueAccessor}
                />
                <SunBurstView
                    className={`${styles.sunBurst} ${styles.viz}`}
                    data={hierarchicalData}
                    vizContainerClass={styles.chartContainer}
                    loading={loadingLeads || hierarchicalDataPending}
                    headerText={_ts('leadsViz', 'sunburst')}
                    valueAccessor={LeadsViz.sizeValueAccessor}
                    labelAccessor={LeadsViz.labelValueAccessor}
                />
                <ChordDiagramView
                    className={`${styles.chordDiagram} ${styles.viz}`}
                    data={chordData.values}
                    loading={loadingLeads || chordDataPending}
                    headerText={_ts('leadsViz', 'chordDiagram')}
                    vizContainerClass={styles.chartContainer}
                    labelsData={chordData.labels}
                    valueAccessor={LeadsViz.sizeValueAccessor}
                    labelAccessor={LeadsViz.labelValueAccessor}
                />
                <CorrelationMatrixView
                    className={`${styles.correlationMatrix} ${styles.viz}`}
                    data={correlationData}
                    headerText={_ts('leadsViz', 'correlationMatrix')}
                    loading={loadingLeads || correlationDataPending}
                    vizContainerClass={styles.chartContainer}
                />
                <ForceDirectedGraphView
                    className={`${styles.forceDirectedGraph} ${styles.viz}`}
                    data={forceDirectedData}
                    loading={loadingLeads || forceDirectedDataPending}
                    headerText={_ts('leadsViz', 'forcedDirectedGraph')}
                    vizContainerClass={styles.chartContainer}
                    idAccessor={d => d.id}
                    groupAccessor={LeadsViz.groupValueAccessor}
                    valueAccessor={LeadsViz.valueAccessor}
                    useVoronoi={false}
                />
                <CollapsibleTreeView
                    className={`${styles.collapsibleTree} ${styles.viz}`}
                    headerText={_ts('leadsViz', 'collapsibleTreeView')}
                    data={hierarchicalData}
                    loading={loadingLeads || hierarchicalDataPending}
                    vizContainerClass={styles.chartContainer}
                    labelAccessor={LeadsViz.labelValueAccessor}
                />
                <RadialDendrogramView
                    className={`${styles.radialDendrogram} ${styles.viz}`}
                    headerText={_ts('leadsViz', 'radialDendogram')}
                    data={hierarchicalData}
                    loading={loadingLeads || hierarchicalDataPending}
                    vizContainerClass={styles.chartContainer}
                    labelAccessor={LeadsViz.labelValueAccessor}
                />
            </div>
        );
    }

    render() {
        const { activeProject } = this.props;
        const { noLeadSelected } = this.state;

        return (
            <div className={styles.leads}>
                <header className={styles.header}>
                    <FilterLeadsForm className={styles.filters} />
                </header>
                { noLeadSelected ? this.renderNoLeadFound() : this.renderCharts() }
                <footer className={styles.footer}>
                    <Link
                        className={styles.link}
                        to={reverseRoute(pathNames.leads, { projectId: activeProject.id })}
                        replace
                    >
                        {
                            // Show Table
                            _ts('leadsViz', 'showTable')
                        }
                    </Link>
                </footer>
            </div>
        );
    }
}
