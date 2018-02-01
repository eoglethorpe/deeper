import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Checkbox, TreeSelection } from '../../../../public/components/Input';
import { List } from '../../../../public/components/View';

import { iconNames } from '../../../../common/constants';
import { exportStringsSelector } from '../../../../common/redux';

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
    exportStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    analysisFramework: undefined,
    reportStructure: undefined,
};

const mapStateToProps = state => ({
    exportStrings: exportStringsSelector(state),
});

@connect(mapStateToProps)
@CSSModules(styles, { allowMultiple: true })
export default class ExportTypePane extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static exportTypeKeyExtractor = d => d.key

    static mapReportLevelsToNodes = levels => levels.map(level => ({
        key: level.id,
        title: level.title,
        selected: true,
        draggable: true,
        nodes: level.sublevels && ExportTypePane.mapReportLevelsToNodes(level.sublevels),
    }));

    static createReportStructure = (analysisFramework) => {
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
                nodes: ExportTypePane.mapReportLevelsToNodes(levels),
            });
        });

        return nodes;
    }

    constructor(props) {
        super(props);

        this.exportTypes = [
            {
                key: 'word',
                img: wordIcon,
                title: this.props.exportStrings('docxLabel'),
            },
            {
                key: 'pdf',
                img: pdfIcon,
                title: this.props.exportStrings('pdfLabel'),
            },
            {
                key: 'excel',
                title: this.props.exportStrings('xlxsLabel'),
                img: excelIcon,
            },
            {
                key: 'json',
                img: jsonIcon,
                title: this.props.exportStrings('jsonLabel'),
            },
        ];
    }

    componentWillMount() {
        const newReportStructure = ExportTypePane.createReportStructure(
            this.props.analysisFramework,
        );
        this.props.onReportStructureChange(newReportStructure);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.analysisFramework !== this.props.analysisFramework) {
            const newReportStructure = ExportTypePane.createReportStructure(
                nextProps.analysisFramework,
            );
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

    renderExportType = (key, data) => (
        <button
            className={this.getExportTypeClassName(key)}
            key={key}
            title={data.title}
            onClick={() => this.props.onExportTypeChange(key)}
        >
            <img
                className={styles.image}
                src={data.img}
                alt={data.title}
            />
        </button>
    )

    renderWordPdfOptions = () => {
        if (!this.props.reportStructure) {
            return (
                <p>
                    { this.props.exportStrings('noMatrixAfText')}
                </p>
            );
        }

        return [
            <h4 key="header">
                {this.props.exportStrings('reportStructureLabel')}
            </h4>,
            <TreeSelection
                key="tree-selection"
                value={this.props.reportStructure}
                onChange={this.props.onReportStructureChange}
            />,
        ];
    }

    renderExcelOptions = () => ([
        <Checkbox
            key="checkbox"
            label={this.props.exportStrings('decoupledEntriesLabel')}
            value={this.props.decoupledEntries}
            onChange={this.props.onDecoupledEntriesChange}
        />,
        <div
            styleName="info"
            key="info"
        >
            <span
                styleName="icon"
                className={iconNames.info}
            />
            <div>
                <p>{this.props.exportStrings('decoupledEntriesTitle2')}</p>
                <p>{this.props.exportStrings('decoupledEntriesTitle')}</p>
            </div>
        </div>,
    ])

    renderOptions = (activeExportTypeKey) => {
        switch (activeExportTypeKey) {
            case 'word':
            case 'pdf':
                return this.renderWordPdfOptions();
            case 'excel':
                return this.renderExcelOptions();
            default:
                return (
                    <p>
                        { this.props.exportStrings('noOptionsAvailable') }
                    </p>
                );
        }
    }

    render() {
        const { activeExportTypeKey } = this.props;
        return (
            <section styleName="export-types">
                <div styleName="export-type-select-list">
                    <List
                        styleName="export-type-select-list"
                        data={this.exportTypes}
                        modifier={this.renderExportType}
                        keyExtractor={ExportTypePane.exportTypeKeyExtractor}
                    />
                </div>
                <div styleName="export-type-options">
                    { this.renderOptions(activeExportTypeKey) }
                </div>
            </section>
        );
    }
}
