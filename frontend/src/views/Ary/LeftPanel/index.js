import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    entryStringsSelector,
    aryStringsSelector,
} from '../../../redux';

// import styles from './styles.scss';

const propTypes = {
    /*
    entryStrings: PropTypes.func.isRequired,
    aryStrings: PropTypes.func.isRequired,
    */
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    aryStrings: aryStringsSelector(state),
});

@connect(mapStateToProps)
export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        return (
            <div>
                Coming Soon
            </div>
        );
    }
}
