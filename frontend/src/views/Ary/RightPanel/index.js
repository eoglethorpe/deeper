import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import { connect } from 'react-redux';

import {
    aryStringsSelector,
} from '../../../redux';

import Metadata from './Metadata';
import Methodology from './Methodology';

import styles from './styles.scss';

const propTypes = {
    aryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    aryStrings: aryStringsSelector(state),
});
@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            currentTabRight: 'methodology',
        };
    }

    handleRightTabSelect = (selectedTab) => {
        if (selectedTab === this.state.currentTabRight) {
            return;
        }
        let oldTab;
        this.setState({
            oldTab,
            currentTabRight: selectedTab,
        });
    }

    render() {
        const {
            currentTabRight,
        } = this.state;

        return (
            <Tabs
                name="rightPaneTabs"
                selectedTab={currentTabRight}
                handleSelect={this.handleRightTabSelect}
                activeLinkStyle={{ none: 'none' }}
                className={styles['tabs-container']}
            >
                <div className={styles['tabs-header-container']}>
                    <TabLink
                        className={styles['tab-header']}
                        to="metadata"
                    >
                        {this.props.aryStrings('metadataTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="methodology"
                    >
                        {this.props.aryStrings('methodologyTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="entries"
                    >
                        {this.props.aryStrings('entriesTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="summary"
                    >
                        {this.props.aryStrings('summaryTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="score"
                    >
                        {this.props.aryStrings('scoreTabLabel')}
                    </TabLink>
                    <div styleName="empty-tab" />
                </div>
                <div className={styles['tabs-content']}>
                    <TabContent
                        className={styles.tab}
                        for="metadata"
                    >
                        <Metadata />
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="methodology"
                    >
                        <Methodology />
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="entries"
                    >
                        {this.props.aryStrings('entriesTabLabel')}
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="summary"
                    >
                        {this.props.aryStrings('summaryTabLabel')}
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="score"
                    >
                        {this.props.aryStrings('scoreTabLabel')}
                    </TabContent>
                </div>
            </Tabs>
        );
    }
}
