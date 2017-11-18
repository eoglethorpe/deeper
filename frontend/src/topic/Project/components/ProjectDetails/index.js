import CSSModules from 'react-css-modules';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import ProjectGeneral from '../ProjectGeneral';
import ProjectRegions from '../ProjectRegions';
import ProjectAnalysisFramework from '../ProjectAnalysisFramework';
import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class ProjectDetails extends React.PureComponent {
    render() {
        return (
            <Tabs
                activeLinkStyle={{ none: 'none' }}
                styleName="tabs-container"
                renderActiveTabContentOnly
            >
                <div styleName="tabs-header-container">
                    <TabLink
                        styleName="tab-header"
                        to="project-details"
                    >
                        Details
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="geo-areas"
                    >
                        Geo Areas
                    </TabLink>
                    <TabLink
                        styleName="tab-header"
                        to="analysis-framework"
                    >
                        Analysis Framework
                    </TabLink>
                    {/* Essential for border bottom, for more info contact AdityaKhatri */}
                    <div styleName="empty-tab" />
                </div>
                <div styleName="tabs-content">
                    <TabContent
                        for="project-details"
                        styleName="tab"
                    >
                        <ProjectGeneral />
                    </TabContent>
                    <TabContent
                        for="geo-areas"
                        styleName="tab"
                    >
                        <ProjectRegions />
                    </TabContent>
                    <TabContent
                        for="analysis-framework"
                        styleName="tab"
                    >
                        <ProjectAnalysisFramework />
                    </TabContent>
                </div>
            </Tabs>
        );
    }
}
