import PropTypes from 'prop-types';
import React from 'react';

import ScaleInput from '../../../vendor/react-store/components/Input/ScaleInput';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

const propTypes = {
    attribute: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    data: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    attribute: {},
    data: undefined,
};

const emptyObject = {};
const emptyList = [];

@BoundError(WidgetError)
export default class ScaleViewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.createScaleUnits(props);
    }

    componentWillReceiveProps(nextProps) {
        const { data: newData } = nextProps.data;
        const { data: oldData } = this.props;

        if (oldData !== newData) {
            this.createScaleUnits(nextProps);
        }
    }

    createScaleUnits = ({ data = emptyObject }) => {
        const scaleUnits = data.scaleUnits || emptyList;
        const tempScaleUnits = {};
        scaleUnits.forEach((s) => {
            tempScaleUnits[s.key] = s;
        });
        this.scaleUnits = tempScaleUnits;
    }

    render() {
        const { selectedScale } = this.props.attribute;

        return (
            <ScaleInput
                options={this.scaleUnits}
                value={selectedScale}
                readOnly
            />
        );
    }
}
