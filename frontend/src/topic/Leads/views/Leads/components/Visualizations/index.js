import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
} from '../../../../../../public/components/View';

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
} from '../../../../../../public/components/Action';

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
                    valueAccessor={d => d.size}
                    labelAccessor={d => d.name}
                />
                <SunBurstView
                    styleName="sun-burst viz"
                    data={hierarchicalData}
                    valueAccessor={d => d.size}
                    labelAccessor={d => d.name}
                />
                <ChordDiagramView
                    styleName="chord-diagram viz"
                    data={chordData.values}
                    labelsData={chordData.labels}
                    valueAccessor={d => d.size}
                    labelAccessor={d => d.name}
                />
                <CorrelationMatrixView
                    styleName="correlation-matrix viz"
                    data={correlationData}
                />
                <ForceDirectedGraphView
                    styleName="force-directed-graph viz"
                    data={forceDirectedData}
                    idAccessor={d => d.id}
                    groupAccessor={d => d.group}
                    valueAccessor={d => d.value}
                    useVoronoi={false}
                />
                <CollapsibleTreeView
                    styleName="collapsible-tree viz"
                    data={hierarchicalData}
                    labelAccessor={d => d.name}
                />
                <RadialDendrogramView
                    styleName="radial-dendrogram viz"
                    data={hierarchicalData}
                    labelAccessor={d => d.name}
                />
            </div>
        );
    }
}
