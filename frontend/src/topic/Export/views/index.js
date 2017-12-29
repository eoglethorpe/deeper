import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';
import {
    Button,
} from '../../../public/components/Action';
import {
    List,
} from '../../../public/components/View';
import update from '../../../public/utils/immutable-update';

import wordIcon from '../../../img/word.svg';
import excelIcon from '../../../img/excel.svg';
import pdfIcon from '../../../img/pdf.svg';
import jsonIcon from '../../../img/json.svg';

import BasicInformationInputs from '../components/BasicInformationInputs';

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
            activeExportTypeKey: undefined,
            values: {
                excerpt: '',
                createdBy: [],
                createdAt: {},
            },
        };

        this.options = [
            {
                key: 'generic',
                label: 'Generic',
            },
            {
                key: 'geo',
                label: 'Geo',
            },
        ];

        this.exportTypes = [
            {
                key: 'word',
                img: wordIcon,
                title: 'DOCX',
            },
            {
                key: 'pdf',
                img: pdfIcon,
                title: 'PDF',
            },
            {
                key: 'excel',
                title: 'XLXS',
                img: excelIcon,
            },
            {
                key: 'json',
                img: jsonIcon,
                title: 'JSON',
            },
        ];
    }

    getExportTypeClassName = (key) => {
        const {
            activeExportTypeKey,
        } = this.state;

        const classNames = [styles['export-type-select']];

        if (activeExportTypeKey === key) {
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    exportTypeKeyExtractor = d => d.key

    handleExportTypeSelectButtonClick = (key) => {
        this.setState({
            activeExportTypeKey: key,
        });
    }

    handleFilterInputsChange = (newValues) => {
        const {
            values: oldValues,
        } = this.state;

        const settings = {
            $merge: newValues,
        };

        const values = update(oldValues, settings);

        this.setState({
            values,
        });
    }

    renderExportType = (key, data) => (
        <button
            className={this.getExportTypeClassName(key)}
            key={key}
            title={data.title}
            onClick={() => { this.handleExportTypeSelectButtonClick(key); }}
        >
            <img
                className={styles.image}
                src={data.img}
                alt={data.title}
            />
        </button>
    )

    render() {
        const {
            values,
        } = this.state;

        return (
            <div styleName="export">
                <header styleName="header">
                    <h2>Export</h2>
                    <div styleName="action-buttons">
                        <Button>Show preview</Button>
                        <Button>Start export</Button>
                    </div>
                </header>
                <div styleName="main-content">
                    <section
                        styleName="export-types"
                    >
                        <header styleName="header">
                            <h4 styleName="heading">Select export type</h4>
                        </header>
                        <div styleName="content">
                            <div styleName="export-type-select-list">
                                <List
                                    styleName="export-type-select-list"
                                    data={this.exportTypes}
                                    modifier={this.renderExportType}
                                    keyExtractor={this.exportTypeKeyExtractor}
                                />
                            </div>
                            <div styleName="export-type-options">
                                Export type options
                            </div>
                        </div>
                    </section>
                    <section
                        styleName="filters"
                    >
                        <header styleName="header">
                            <h4>Select filters</h4>
                        </header>
                        <div styleName="content">
                            <div styleName="left">
                                <div styleName="basic-information">
                                    <BasicInformationInputs
                                        onChange={this.handleFilterInputsChange}
                                        values={values}
                                    />
                                </div>
                                <div styleName="entry-attributes">
                                    Entry attributes
                                </div>
                            </div>
                            <div styleName="right">
                                <div styleName="lead-attributes">
                                    Lead attributes
                                </div>
                                <div styleName="leads">
                                    Leads
                                </div>
                            </div>
                        </div>
                    </section>
                    <section styleName="preview">
                        Export preview
                    </section>
                </div>
            </div>
        );
    }
}
