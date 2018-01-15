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
    hierarchialDataSelector,
    chordDataSelector,
    correlationDataSelector,
    forceDirectedDataSelector,
} from '../../../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    hierarchicalData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    correlationData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    chordData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    forceDirectedData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

    hierarchicalDataPending: PropTypes.bool,
    chordDataPending: PropTypes.bool,
    correlationDataPending: PropTypes.bool,
    forceDirectedDataPending: PropTypes.bool,
};

const defaultProps = {
    className: '',
    totalLeadsCount: 0,

    hierarchicalDataPending: false,
    chordDataPending: false,
    correlationDataPending: false,
    forceDirectedDataPending: false,
};

const mapStateToProps = state => ({
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

            hierarchicalDataPending,
            chordDataPending,
            correlationDataPending,
            forceDirectedDataPending,
        } = this.props;

        return (
            <div
                styleName="viz-container"
                className={className}
            >
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
