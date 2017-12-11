import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';
import {
    Form,
    RadioInput,
} from '../../../public/components/Input';
import {
    TransparentButton,
} from '../../../public/components/Action';
import {
    ListView,
} from '../../../public/components/View';

import FilterSection from '../components/FilterSection';
import StructureSection from '../components/StructureSection';
import wordLogo from '../../../img/ms-word.svg';
import excelLogo from '../../../img/ms-excel.svg';
import pdfLogo from '../../../img/pdf-logo.svg';
import jsonLogo from '../../../img/json-logo.svg';

const propTypes = {
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;
    static exportButtonKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        this.state = {
            buttonIsHovered: false,
        };

        this.elements = [];
        this.options = [
            {
                key: 'generic',
                label: 'Generic',
            },
            {
                key: 'geo',
                label: 'GEO',
            },
            {
                key: 'briefingNote',
                label: 'Briefing Note',
            },
        ];

        this.exports = [
            {
                key: 'word',
                img: wordLogo,
                preview: true,
            },
            {
                key: 'excel',
                img: excelLogo,
            },
            {
                key: 'pdf',
                img: pdfLogo,
                preview: true,
            },
            {
                key: 'json',
                img: jsonLogo,
            },
        ];
    }

    getExportButton = (key, data) => (
        <div
            key={key}
            className={styles['export-button']}
        >
            <img src={data.img} alt={key} />
            <div
                className={styles['action-buttons']}
            >
                <TransparentButton
                    onClick={() => { this.handleExportButtonClick(key); }}
                >
                    Export
                </TransparentButton>
                {
                    data.preview && (
                        <TransparentButton
                            onClick={() => { this.handlePreviewButtonClick(key); }}
                        >
                            Preview
                        </TransparentButton>
                    )
                }
            </div>
        </div>
    )

    handleExportButtonClick = (key) => {
        console.log('exporting', key);
    }

    handlePreviewButtonClick = (key) => {
        console.log('previewing', key);
    }

    render() {
        return (
            <div styleName="export">
                <div styleName="preview-container">
                    <div><h1>No Preview Available</h1></div>
                </div>
                <Form
                    styleName="form-container"
                    elements={this.elements}
                >
                    <header
                        styleName="header"
                    >
                        <div styleName="export-type">
                            <RadioInput
                                name="export-type"
                                selected={'geo'}
                                options={this.options}
                            />
                        </div>
                        <ListView
                            styleName="export-buttons"
                            data={this.exports}
                            modifier={this.getExportButton}
                            keyExtractor={Export.exportButtonKeyExtractor}
                        />
                    </header>
                    <div styleName="content">
                        <FilterSection
                            styleName="filter-section"
                        />
                        <StructureSection
                            styleName="structure-section"
                        />
                    </div>
                </Form>
            </div>
        );
    }
}
