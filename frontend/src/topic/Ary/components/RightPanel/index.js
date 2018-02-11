import CSSModules from 'react-css-modules';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import { connect } from 'react-redux';

import {
    entryStringsSelector,
    afStringsSelector,
} from '../../../../common/redux';

import styles from './styles.scss';

const propTypes = {
    // entryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    afStrings: afStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class RightPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            currentTabLeft: 'metadata',
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
                        Metadata
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="methodology"
                    >
                        Methodology
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="entries"
                    >
                        Entries
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="summary"
                    >
                        Summary
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="score"
                    >
                        Score
                    </TabLink>
                    <div styleName="empty-tab" />
                </div>
                <div className={styles['tabs-content']}>
                    <TabContent
                        className={styles.tab}
                        for="metadata"
                    >
                        Metadata
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="methodology"
                    >
                        Methodology
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="entries"
                    >
                        Entries
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="summary"
                    >
                        Summary
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="score"
                    >
                        Score
                    </TabContent>
                </div>
            </Tabs>
        );
    }
}
