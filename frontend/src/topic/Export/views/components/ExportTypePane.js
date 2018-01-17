import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import { Checkbox, TreeSelection } from '../../../../public/components/Input';
import { List } from '../../../../public/components/View';

import {
    exportStrings,
    iconNames,
} from '../../../../common/constants';

import wordIcon from '../../../../img/word.svg';
import excelIcon from '../../../../img/excel.svg';
import pdfIcon from '../../../../img/pdf.svg';
import jsonIcon from '../../../../img/json.svg';
import styles from '../styles.scss';

const propTypes = {
    analysisFramework: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    reportStructure: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    activeExportTypeKey: PropTypes.string.isRequired,
    decoupledEntries: PropTypes.bool.isRequired,
    onExportTypeChange: PropTypes.func.isRequired,
    onReportStructureChange: PropTypes.func.isRequired,
    onDecoupledEntriesChange: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    reportStructure: undefined,
};

@CSSModules(styles, { allowMultiple: true })
export default class ExportTypePane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static exportTypes = [
        {
            key: 'word',
            img: wordIcon,
            title: exportStrings.docxLabel,
        },
        {
            key: 'pdf',
            img: pdfIcon,
            title: exportStrings.pdfLabel,
        },
        {
            key: 'excel',
            title: exportStrings.xlxsLabel,
            img: excelIcon,
        },
        {
            key: 'json',
            img: jsonIcon,
            title: exportStrings.jsonLabel,
        },
    ]

    static exportTypeKeyExtractor = d => d.key

    componentWillMount() {
        const newReportStructure = this.createReportStructure(this.props.analysisFramework);
        this.props.onReportStructureChange(newReportStructure);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.analysisFramework !== this.props.analysisFramework) {
            const newReportStructure = this.createReportStructure(nextProps.analysisFramework);
            this.props.onReportStructureChange(newReportStructure);
        }
    }

    getExportTypeClassName(key) {
        const { activeExportTypeKey } = this.props;

        const classNames = [
            styles['export-type-select'],
        ];
        if (activeExportTypeKey === key) {
            classNames.push(styles.active);
        }
        return classNames.join(' ');
    }

    mapReportLevelsToNodes = levels => levels.map(level => ({
        key: level.id,
        title: level.title,
        selected: true,
        draggable: true,
        nodes: level.sublevels && this.mapReportLevelsToNodes(level.sublevels),
    }));


    createReportStructure = (analysisFramework) => {
        if (!analysisFramework) {
            return undefined;
        }

        const { exportables, widgets } = analysisFramework;
        const nodes = [];

        if (!exportables || !widgets) {
            return undefined;
        }

        exportables.forEach((exportable) => {
            const levels = exportable.data && exportable.data.report &&
                exportable.data.report.levels;
            const widget = widgets.find(w => w.key === exportable.widgetKey);

            if (!levels || !widget) {
                return;
            }

            nodes.push({
                title: widget.title,
                key: `${exportable.id}`,
                selected: true,
                draggable: true,
                nodes: this.mapReportLevelsToNodes(levels),
            });
        });

        return nodes;
    }

    renderExportType = (key, data) => (
        <button
            className={this.getExportTypeClassName(key)}
            key={key}
            title={data.title}
            onClick={() => { this.props.onExportTypeChange(key); }}
        >
            <img
                className={styles.image}
                src={data.img}
                alt={data.title}
            />
        </button>
    )

    renderReportOptions = () => {
        if (!this.props.reportStructure) {
            return (
                <p>
                    { 'You don\'t have any matrices in your analysis framework.' }
                </p>
            );
        }
        return [
            <h4 key="header">
                Report Structure
            </h4>, // FIXME: strings
            <TreeSelection
                key="tree-selection"
                value={this.props.reportStructure}
                onChange={this.props.onReportStructureChange}
            />,
        ];
    }

    renderExcelOptions = () => (
        <div styleName="decoupled-box">
            <Checkbox
                label={exportStrings.decoupledEntriesLabel}
                value={this.props.decoupledEntries}
                onChange={this.props.onDecoupledEntriesChange}
            />
            <i
                className={iconNames.help}
                title={exportStrings.decoupledEntriesTitle}
            />
        </div>
    )

    render() {
        const { activeExportTypeKey } = this.props;
        return (
            <section styleName="export-types">
                <div styleName="export-type-select-list">
                    <List
                        styleName="export-type-select-list"
                        data={ExportTypePane.exportTypes}
                        modifier={this.renderExportType}
                        keyExtractor={ExportTypePane.exportTypeKeyExtractor}
                    />
                </div>
                <div styleName="export-type-options">
                    {
                        (activeExportTypeKey === 'word' || activeExportTypeKey === 'pdf')
                            && this.renderReportOptions()
                    }
                    { activeExportTypeKey === 'excel' && this.renderExcelOptions() }
                </div>
            </section>
        );
    }
}

