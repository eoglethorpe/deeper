import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { FgRestBuilder } from '../../../../../../public/utils/rest';
import schema from '../../../../../../common/schema';

import { LoadingAnimation } from '../../../../../../public/components/View';
import {
    SunBurstView,
    ChordDiagramView,
    TreeMapView,
    CorrelationMatrixView,
    ForceDirectedGraphView,
    CollapsibleTreeView,
    RadialDendrogramView,
} from '../../../../../../public/components/Visualization';

import {
    urlForLeadTopicModeling,
    createParamsForLeadTopicModeling,
    createUrlForLeadsOfProject,
    createParamsForUser,
    transformResponseErrorToFormError,
} from '../../../../../../common/rest';

import {
    activeProjectSelector,
    leadPageFilterSelector,

    setLeadVisualizationAction,
    hierarchialDataSelector,
    chordDataSelector,
    correlationDataSelector,
    forceDirectedDataSelector,
    visualizationStaleSelector,
} from '../../../../../../common/redux';

import Leads from '../../../Leads';
import notify from '../../../../../../common/notify';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    activeProject: PropTypes.number.isRequired,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    stale: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
    ]),

    hierarchicalData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    correlationData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    chordData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    forceDirectedData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    setLeadVisualization: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    stale: false,
    totalLeadsCount: 0,
};

const mapStateToProps = state => ({
    activeProject: activeProjectSelector(state),
    filters: leadPageFilterSelector(state),
    hierarchicalData: hierarchialDataSelector(state),
    chordData: chordDataSelector(state),
    correlationData: correlationDataSelector(state),
    forceDirectedData: forceDirectedDataSelector(state),
    stale: visualizationStaleSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLeadVisualization: parms => dispatch(setLeadVisualizationAction(parms)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Visualizations extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static sizeValueAccessor = d => d.size;
    static labelValueAccessor = d => d.name;
    static groupValueAccessor = d => d.group;
    static valueAccessor = d => d.value;

    constructor(props) {
        super(props);

        this.state = {
            loadingLeads: false,
            hierarchicalDataPending: false,
            chordDataPending: false,
            correlationDataPending: false,
            forceDirectedDataPending: false,
        };
    }

    componentWillMount() {
        this.loadVisualizationData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.stale !== nextProps.stale) {
            this.loadVisualizationData(nextProps);
        }
    }

    componentWillUnmount() {
        if (this.leadCDIdRequest) {
            this.leadCDIdRequest.stop();
        }
        if (this.requestForLeadTopicmodeling) {
            this.requestForLeadTopicmodeling.stop();
        }
    }

    loadVisualizationData = (props) => {
        const {
            activeProject,
            filters,
            stale,
        } = props;

        if (stale) {
            if (this.leadCDIdRequest) {
                this.leadCDIdRequest.stop();
            }

            this.leadCDIdRequest = this.createRequestForProjectLeadsCDId({
                activeProject,
                filters,
            });

            this.leadCDIdRequest.start();
        }
    }

    createRequestForProjectLeadsCDId = ({ activeProject, filters }) => {
        const sanitizedFilters = Leads.getFiltersForRequest(filters);

        const urlForProjectLeads = createUrlForLeadsOfProject({
            project: activeProject,
            fields: 'classified_doc_id',
            ...sanitizedFilters,
        });

        const leadRequest = new FgRestBuilder()
            .url(urlForProjectLeads)
            .params(() => createParamsForUser())
            .preLoad(() => {
                this.setState({ loadingLeads: true });
            })
            .postLoad(() => {
                this.setState({ loadingLeads: false });
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
                    if (this.requestForLeadTopicmodeling) {
                        this.requestForLeadTopicmodeling.stop();
                    }
                    this.requestForLeadTopicmodeling =
                        this.createRequestForLeadTopicModeling(docIds);
                    this.requestForLeadTopicmodeling.start();
                    /*
                    this.props.setLeads({
                        projectId: activeProject,
                        leads: response.results,
                        totalLeadsCount: response.count,
                    });
                    */
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
            })
            .fatal(() => {
                notify.send({
                    title: 'Leads', // FIXME: strings
                    type: notify.type.ERROR,
                    message: 'Couldn\'t load leads', // FIXME: strings
                    duration: notify.duration.MEDIUM,
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
                    this.props.setLeadVisualization({ data: response });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error(response);
                // TODO: notify user for failure
            })
            .fatal((response) => {
                console.error(response);
                // TODO: notify user for failure
            })
            .build();
        return request;
    }

    render() {
        const {
            className,
            chordData,
            hierarchicalData,
            correlationData,
            forceDirectedData,
        } = this.props;

        const {
            loadingLeads,

            hierarchicalDataPending,
            chordDataPending,
            correlationDataPending,
            forceDirectedDataPending,
        } = this.state;

        return (
            <div
                styleName="viz-container"
                className={className}
            >
                { loadingLeads && <LoadingAnimation /> }
                <TreeMapView
                    styleName="tree-map viz"
                    data={hierarchicalData}
                    loading={hierarchicalDataPending}
                    valueAccessor={Visualizations.sizeValueAccessor}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
                <SunBurstView
                    styleName="sun-burst viz"
                    data={hierarchicalData}
                    loading={hierarchicalDataPending}
                    valueAccessor={Visualizations.sizeValueAccessor}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
                <ChordDiagramView
                    styleName="chord-diagram viz"
                    data={chordData.values}
                    loading={chordDataPending}
                    labelsData={chordData.labels}
                    valueAccessor={Visualizations.sizeValueAccessor}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
                <CorrelationMatrixView
                    styleName="correlation-matrix viz"
                    data={correlationData}
                    loading={correlationDataPending}
                />
                <ForceDirectedGraphView
                    styleName="force-directed-graph viz"
                    data={forceDirectedData}
                    loading={forceDirectedDataPending}
                    idAccessor={d => d.id}
                    groupAccessor={Visualizations.groupValueAccessor}
                    valueAccessor={Visualizations.valueAccessor}
                    useVoronoi={false}
                />
                <CollapsibleTreeView
                    styleName="collapsible-tree viz"
                    data={hierarchicalData}
                    loading={hierarchicalDataPending}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
                <RadialDendrogramView
                    styleName="radial-dendrogram viz"
                    data={hierarchicalData}
                    loading={hierarchicalDataPending}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
            </div>
        );
    }
}
