import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import MultiViewContainer from '../../../vendor/react-store/components/View/MultiViewContainer';
import FixedTabs from '../../../vendor/react-store/components/View/FixedTabs';
import { reverseRoute } from '../../../vendor/react-store/utils/common';
import { pathNames } from '../../../constants';
import {
    leadIdFromRouteSelector,
    projectIdFromRouteSelector,
    aryStringsSelector,
} from '../../../redux';

import Metadata from './Metadata';
import Methodology from './Methodology';
import styles from './styles.scss';

const propTypes = {
    activeLeadId: PropTypes.number.isRequired,
    activeProjectId: PropTypes.number.isRequired,
    aryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    aryStrings: aryStringsSelector(state),
    activeLeadId: leadIdFromRouteSelector(state),
    activeProjectId: projectIdFromRouteSelector(state),
});

@connect(mapStateToProps)
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = { currentTabKey: 'metadata' };

        const Summary = () => <div>{this.props.aryStrings('summaryTabLabel')}</div>;
        const Score = () => <div>{this.props.aryStrings('scoreTabLabel')}</div>;

        this.tabs = {
            metadata: this.props.aryStrings('metadataTabLabel'),
            methodology: this.props.aryStrings('methodologyTabLabel'),
            summary: this.props.aryStrings('summaryTabLabel'),
            score: this.props.aryStrings('scoreTabLabel'),
        };

        this.views = {
            metadata: { component: Metadata },
            methodology: { component: Methodology },
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

        const linkToEditEntries = reverseRoute(
            pathNames.editEntries,
            {
                projectId: this.props.activeProjectId,
                leadId: this.props.activeLeadId,
            },
        );

        return (
            <Fragment>
                <FixedTabs
                    className={styles.tabs}
                    active={currentTabKey}
                    tabs={this.tabs}
                    onClick={this.handleTabClick}
                >
                    <Link
                        className={styles.entriesLink}
                        to={linkToEditEntries}
                    >
                        {this.props.aryStrings('entriesTabLabel')}
                    </Link>
                </FixedTabs>
                <MultiViewContainer
                    active={currentTabKey}
                    views={this.views}
                />
            </Fragment>
        );
    }
}
