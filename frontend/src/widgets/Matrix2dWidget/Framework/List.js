import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { afStringsSelector } from '../../../redux';
import BoundError from '../../../vendor/react-store/components/General/BoundError';
import WidgetError from '../../../components/WidgetError';

import styles from './styles.scss';

const propTypes = {
    afStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    afStrings: afStringsSelector(state),
});

@BoundError(WidgetError)
@connect(mapStateToProps)
export default class Matrix2dList extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { afStrings } = this.props;
        const contentText = afStrings('matrix2DWidgetLabel');
        return (
            <div className={styles.list}>
                { contentText }
            </div>
        );
    }
}
