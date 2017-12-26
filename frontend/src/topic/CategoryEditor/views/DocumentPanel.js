import CSSModules from 'react-css-modules';
// import PropTypes from 'prop-types';
import React from 'react';

import {
    List,
} from '../../../public/components/View';

import {
    urlForKeywordExtraction,
    createParamsForCategoryEditor,
} from '../../../common/rest';

import { FgRestBuilder } from '../../../public/utils/rest';
import DocumentNGram from './DocumentNGram';

import styles from './styles.scss';

@CSSModules(styles, { allowMultiple: true })
export default class DocumentPanel extends React.PureComponent {
    constructor(props) {
        super(props);

        this.tabs = [
            'Document',
            'Simplified',
            'Extracted words',
        ];

        this.document = 'In mid August Nepal experienced the heaviest recorded rainfall in the central and western regions in the last 60 years, resulting in significant flooding in the Terai region, and several landslides in the Hill areas, impacting lives, livelihoods and infrastructure across 36 of the country’s 75 districts. A total of 160 peop le have died, 46 were injured, 352,738 have been displaced, and 29 are still missing 1 . An estimated 1.7 million people 2 (including 680,000 children) have been affected, the majority of whom are concentrated in 10 districts, and include already vulnerable and marginalised groups. In addition, over 250,000 houses and nearly 2,000 schools and have been damaged or destroyed, affecting the education of over 250,000 children. The devastation has left people in the affected areas with little food and limited access to water and sanitation, health, nutrition, education and protection -related services. While flood waters have receded, residual damage to roads and bridges still inhibits access to some remote villages, posing challenges for the delivery of relief supplies. Further monsoon rains are expected as the season continues until the end of September.';

        this.state = {
            pending: undefined,
            activeTabIndex: 0,
        };

        this.categoryEditorRequest = this.createRequestForCategoryEditor(this.document);
    }

    componentWillMount() {
        if (this.categoryEditorRequest) {
            this.categoryEditorRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.categoryEditorRequest) {
            this.categoryEditorRequest.stop();
        }
    }

    getTabStyleName = (i) => {
        const { activeTabIndex } = this.state;

        const styleNames = [];
        styleNames.push(styles['document-tab']);

        if (activeTabIndex === i) {
            styleNames.push(styles.active);
        }

        return styleNames.join(' ');
    }

    createRequestForCategoryEditor = (document) => {
        const categoryEditorRequest = new FgRestBuilder()
            .url(urlForKeywordExtraction)
            .params(() => createParamsForCategoryEditor(document))
            .preLoad(() => {
                this.setState({ pending: true });
            })
            .success((response) => {
                const ngrams = response;
                // TODO: write scheme validation
                this.setState({
                    pending: false,
                    ngrams,
                });
            })
            .build();
        return categoryEditorRequest;
    }

    handleTabClick = (i) => {
        this.setState({ activeTabIndex: i });
    }

    keyExtractorForTab = tab => tab;

    renderTab = (key, data, i) => (
        <button
            onClick={() => this.handleTabClick(i)}
            className={this.getTabStyleName(i)}
            key={key}
        >
            { data }
        </button>
    )

    renderTabContent = () => {
        const {
            activeTabIndex,
            ngrams,
            pending,
        } = this.state;

        switch (activeTabIndex) {
            case 0:
                return (
                    <div styleName="document-tab">
                        Document
                    </div>
                );
            case 1:
                return (
                    <div styleName="simplified-tab">
                        { this.document }
                    </div>
                );
            case 2:
                return (
                    <DocumentNGram
                        ngrams={ngrams}
                        pending={pending}
                    />
                );
            default:
                return null;
        }
    }

    render() {
        return (
            <div styleName="document-panel">
                <header styleName="header">
                    <List
                        data={this.tabs}
                        modifier={this.renderTab}
                        keyExtractor={this.keyExtractorForTab}
                    />
                </header>
                <div styleName="content">
                    { this.renderTabContent() }
                </div>
            </div>
        );
    }
}
