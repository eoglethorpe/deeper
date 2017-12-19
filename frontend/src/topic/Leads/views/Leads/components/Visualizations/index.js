import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

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
    leadsForProjectSelector,

    hierarchialDataSelector,
    chordDataSelector,
    correlationDataSelector,
    forceDirectedDataSelector,
} from '../../../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    leads: PropTypes.array, // eslint-disable-line
    hierarchicalData: PropTypes.object.isRequired, // eslint-disable-line
    correlationData: PropTypes.object.isRequired, // eslint-disable-line
    chordData: PropTypes.object.isRequired, // eslint-disable-line
    forceDirectedData: PropTypes.object.isRequired, // eslint-disable-line
};

const defaultProps = {
    className: '',
    leads: [],
    totalLeadsCount: 0,
};

const mapStateToProps = state => ({
    leads: leadsForProjectSelector(state),

    hierarchicalData: hierarchialDataSelector(state),
    chordData: chordDataSelector(state),
    correlationData: correlationDataSelector(state),
    forceDirectedData: forceDirectedDataSelector(state),
});

@connect(mapStateToProps, null)
@CSSModules(styles, { allowMultiple: true })
export default class Visualizations extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static sizeValueAccessor = d => d.size;
    static labelValueAccessor = d => d.name;
    static groupValueAccessor = d => d.group;
    static valueAccessor = d => d.value;

    render() {
        const {
            className,
            chordData,
            hierarchicalData,
            correlationData,
            forceDirectedData,
        } = this.props;

        return (
            <div
                styleName="viz-container"
                className={className}
            >
                <TreeMapView
                    styleName="tree-map viz"
                    data={hierarchicalData}
                    valueAccessor={Visualizations.sizeValueAccessor}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
                <SunBurstView
                    styleName="sun-burst viz"
                    data={hierarchicalData}
                    valueAccessor={Visualizations.sizeValueAccessor}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
                <ChordDiagramView
                    styleName="chord-diagram viz"
                    data={chordData.values}
                    labelsData={chordData.labels}
                    valueAccessor={Visualizations.sizeValueAccessor}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
                <CorrelationMatrixView
                    styleName="correlation-matrix viz"
                    data={correlationData}
                />
                <ForceDirectedGraphView
                    styleName="force-directed-graph viz"
                    data={forceDirectedData}
                    idAccessor={d => d.id}
                    groupAccessor={Visualizations.groupValueAccessor}
                    valueAccessor={Visualizations.valueAccessor}
                    useVoronoi={false}
                />
                <CollapsibleTreeView
                    styleName="collapsible-tree viz"
                    data={hierarchicalData}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
                <RadialDendrogramView
                    styleName="radial-dendrogram viz"
                    data={hierarchicalData}
                    labelAccessor={Visualizations.labelValueAccessor}
                />
            </div>
        );
    }
}
