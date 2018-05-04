import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
// import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import List from '../../../vendor/react-store/components/View/List';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';

import {
    categoryEditorDocumentsSelector,
    categoryEditorSimplifiedPreviewIdSelector,
    setCeNgramsAction,
    setCeSimplifiedPreviewIdAction,
    ceIdFromRouteSelector,
} from '../../../redux';
import _ts from '../../../ts';
import SimplifiedFilePreview from '../../../components/SimplifiedFilePreview';

import DocumentNGram from './DocumentNGram';
import DocumentSelect from './DocumentSelect';

import styles from '../styles.scss';

const propTypes = {
    projectId: PropTypes.number.isRequired,
    previewId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setCeNgrams: PropTypes.func.isRequired,
    setPreviewId: PropTypes.func.isRequired,
    selectedFiles: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        title: PropTypes.string,
    })),
    categoryEditorId: PropTypes.number.isRequired,
};

const defaultProps = {
    className: '',
    previewId: undefined,
    simplified: {},
    selectedFiles: [],
};

const mapStateToProps = (state, props) => ({
    selectedFiles: categoryEditorDocumentsSelector(state, props),
    previewId: categoryEditorSimplifiedPreviewIdSelector(state, props),

    categoryEditorId: ceIdFromRouteSelector(state, props),
});


const mapDispatchToProps = dispatch => ({
    setPreviewId: params => dispatch(setCeSimplifiedPreviewIdAction(params)),
    setCeNgrams: params => dispatch(setCeNgramsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class DocumentPanel extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            pending: false,
            selectedFiles: [],
            showGallerySelectModal: false,
            fileIds: props.selectedFiles.map(file => file.id),
            activeTabIndex: 0,
        };

        this.tabs = [
            {
                key: 'document',
                title: _ts('ce', 'documentTabLabel'),
            },
            {
                key: 'simplified',
                title: _ts('ce', 'simplifiedTabLabel'),
            },
            {
                key: 'ngrams',
                title: _ts('ce', 'ngramsTabLabel'),
            },
        ];
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedFiles !== nextProps.selectedFiles) {
            this.setState({
                fileIds: nextProps.selectedFiles.map(file => file.id),
            });
        }
    }

    getTabClassName = (base, i) => {
        const classNames = [base];

        const {
            activeTabIndex,
        } = this.state;

        if (activeTabIndex === i) {
            classNames.push(styles.active);
        }

        return classNames.join(' ');
    }

    getTabHeaderClassName = i => this.getTabClassName(styles.tabHeader, i)
    getTabContentClassName = i => this.getTabClassName(styles.tabContent, i)

    // Simplification callback
    handleFilesPreviewLoad = (response) => {
        const { categoryEditorId } = this.props;

        this.props.setPreviewId({
            categoryEditorId,
            previewId: response.id,
        });

        this.props.setCeNgrams({
            categoryEditorId,
            ngrams: response.ngrams,
        });
    }

    handlePreLoad = () => {
        this.setState({
            pending: true,
        });
    }

    handlePostLoad = () => {
        this.setState({ pending: false });
    }

    // Document Select Callback
    handleModalClose = (galleryFiles) => {
        const { selectedFiles } = this.state;
        const newSelectedFiles = galleryFiles.filter(file => (
            selectedFiles.findIndex(f => f.id === file.id) === -1
        ));

        this.setState({
            showGallerySelectModal: false,
            selectedFiles: selectedFiles.concat(newSelectedFiles),
        });
    }

    // Remove file callback
    handleRemoveFiles = (id) => {
        const newSelectedFiles = [...this.state.selectedFiles];
        const index = newSelectedFiles.findIndex(file => file.id === id);
        if (index !== -1) {
            newSelectedFiles.splice(index, 1);
            this.setState({
                selectedFiles: newSelectedFiles,
            });
        }
    }

    handleTabHeaderClick = (i) => {
        this.setState({
            activeTabIndex: i,
        });
    }

    keyExtractorForGalleryFiles = file => file.id
    keyExtractorForTabs = d => d.key

    renderTabHeader = (key, data, i) => (
        <button
            key={key}
            className={this.getTabHeaderClassName(i)}
            onClick={() => { this.handleTabHeaderClick(i); }}
        >
            { data.title }
        </button>
    )

    render() {
        const {
            pending,
            fileIds,
        } = this.state;

        const {
            previewId,
            projectId,
        } = this.props;

        return (
            <div className={styles.documentPanel}>
                <header className={styles.header}>
                    <List
                        data={this.tabs}
                        keyExtractor={this.keyExtractorForTabs}
                        modifier={this.renderTabHeader}
                    />
                </header>
                <div className={styles.content}>
                    { pending && <LoadingAnimation /> }
                    <div className={`${styles.tabContent} ${this.getTabContentClassName(0)}`}>
                        <DocumentSelect projectId={projectId} />
                    </div>
                    <div className={`${styles.tabContent} ${this.getTabContentClassName(1)}`}>
                        <SimplifiedFilePreview
                            fileIds={fileIds}
                            previewId={previewId}
                            onLoad={this.handleFilesPreviewLoad}
                            preLoad={this.handlePreLoad}
                            postLoad={this.handlePostLoad}
                        />
                    </div>
                    <div className={`${styles.tabContent} ${this.getTabContentClassName(2)}`}>
                        <DocumentNGram />
                    </div>
                </div>
            </div>
        );
    }
}
