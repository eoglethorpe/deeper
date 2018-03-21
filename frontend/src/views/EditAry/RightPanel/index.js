import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import FixedTabs from '../../../vendor/react-store/components/View/FixedTabs';

import { aryStringsSelector } from '../../../redux';

import Metadata from './Metadata';
import Methodology from './Methodology';
import styles from './styles.scss';

const propTypes = {
    aryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    aryStrings: aryStringsSelector(state),
});

@connect(mapStateToProps)
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { currentTabKey: 'methodology' };

        const Entries = () => <div>{this.props.aryStrings('entriesTabLabel')}</div>;
        const Summary = () => <div>{this.props.aryStrings('summaryTabLabel')}</div>;
        const Score = () => <div>{this.props.aryStrings('scoreTabLabel')}</div>;

        this.tabs = {
            metadata: this.props.aryStrings('metadataTabLabel'),
            methodology: this.props.aryStrings('methodologyTabLabel'),
            entries: this.props.aryStrings('entriesTabLabel'),
            summary: this.props.aryStrings('summaryTabLabel'),
            score: this.props.aryStrings('scoreTabLabel'),
        };

        this.views = {
            metadata: { component: Metadata },
            methodology: { component: Methodology },
            entries: { component: Entries },
            summary: { component: Summary },
            score: { component: Score },
        };
    }

    handleTabClick = (key) => {
        if (key !== this.state.currentTabKey) {
            this.setState({ currentTabKey: key });
        }
    }

    render() {
        const { currentTabKey } = this.state;

        return (
            <Fragment>
                <FixedTabs
                    className={styles.tabs}
                    active={currentTabKey}
                    tabs={this.tabs}
                    onClick={this.handleTabClick}
                />
                <MultiViewContainer
                    active={currentTabKey}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
