import CSSModules from 'react-css-modules';
import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import { connect } from 'react-redux';

import {
    entryStringsSelector,
    aryStringsSelector,
} from '../../../redux';

import styles from './styles.scss';

const propTypes = {
    entryStrings: PropTypes.func.isRequired,
    aryStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
};

const mapStateToProps = state => ({
    entryStrings: entryStringsSelector(state),
    aryStrings: aryStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class LeftPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            currentTabLeft: 'simplified-preview',
        };
    }

    handleLeftTabSelect = (selectedTab) => {
        if (selectedTab === this.state.currentTabLeft) {
            return;
        }
        let oldTab;
        this.setState({
            oldTab,
            currentTabLeft: selectedTab,
        });
    }

    render() {
        const {
            currentTabLeft,
        } = this.state;

        return (
            <Tabs
                name="leftPaneTabs"
                selectedTab={currentTabLeft}
                handleSelect={this.handleLeftTabSelect}
                activeLinkStyle={{ none: 'none' }}
                className={`${styles['tabs-container']}`}
            >
                <div className={styles['tabs-header-container']}>
                    <TabLink
                        className={styles['tab-header']}
                        to="simplified-preview"
                    >
                        {this.props.entryStrings('simplifiedTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="assisted-tagging"
                    >
                        {this.props.entryStrings('assistedTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="original-preview"
                    >
                        {this.props.entryStrings('originalTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="images-preview"
                    >
                        {this.props.entryStrings('imagesTabLabel')}
                    </TabLink>
                    <TabLink
                        className={styles['tab-header']}
                        to="highlights"
                    >
                        {this.props.aryStrings('highlightsTabLabel')}
                    </TabLink>
                    <div styleName="empty-tab" />
                </div>
                <div className={styles['tabs-content']}>
                    <TabContent
                        className={styles.tab}
                        for="simplified-preview"
                    >
                        {this.props.entryStrings('simplifiedTabLabel')}
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="assisted-tagging"
                    >
                        {this.props.entryStrings('assistedTabLabel')}
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="original-preview"
                    >
                        {this.props.entryStrings('originalTabLabel')}
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="images-preview"
                    >
                        {this.props.entryStrings('imagesTabLabel')}
                    </TabContent>
                    <TabContent
                        className={styles.tab}
                        for="highlights"
                    >
                        <div className={styles['highlights-container']}>
                            {this.props.aryStrings('highlightsTabLabel')}
                        </div>
                    </TabContent>
                </div>
            </Tabs>
        );
    }
}
