import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import {
    ListItem,
    LoadingAnimation,
} from '../../../../public/components/View';
import {
    TransparentDangerButton,
} from '../../../../public/components/Action';

import {
    categoryEditorDocumentsSelector,
    categoryEditorSimplifiedPreviewIdSelector,
    setCeNgramsAction,
    setCeSimplifiedPreviewIdAction,
} from '../../../../common/redux';

import SimplifiedFilePreview from '../../../../common/components/SimplifiedFilePreview';

import DocumentNGram from './DocumentNGram';
import DocumentSelect from './DocumentSelect';

import iconNames from '../../../../common/constants/iconNames';
import styles from '../styles.scss';

const propTypes = {
    match: PropTypes.object.isRequired, // eslint-disable-line
    selectedFiles: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.idRequired,
        title: PropTypes.string,
    })),
    previewId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setCeNgrams: PropTypes.func.isRequired,
    setPreviewId: PropTypes.func.isRequired,
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
});


const mapDispatchToProps = dispatch => ({
    setPreviewId: params => dispatch(setCeSimplifiedPreviewIdAction(params)),
    setCeNgrams: params => dispatch(setCeNgramsAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
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
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedFiles !== nextProps.selectedFiles) {
            this.setState({
                fileIds: nextProps.selectedFiles.map(file => file.id),
            });
        }
    }

    // Simplification callback
    handleFilesPreviewLoad = (response) => {
        const { categoryEditorId } = this.props.match.params;

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
        this.setState({
            pending: false,
        });
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

    keyExtractorForGalleryFiles = file => file.id

    renderGalleryFilesListItem = (fileId, file) => (
        <ListItem
            key={fileId}
        >
            {file.title}
            <TransparentDangerButton
                onClick={() => this.handleRemoveFiles(fileId)}
            >
                <span
                    // styleName="icon"
                    className={iconNames.delete}
                />
            </TransparentDangerButton>
        </ListItem>
    )

    render() {
        const {
            pending,
            fileIds,
        } = this.state;

        const {
            match,
            previewId,
        } = this.props;

        return (
            <Tabs
                activeLinkStyle={{ none: 'none' }}
                styleName="document-panel"
            >
                <div styleName="header">
                    <TabLink
                        styleName="document-tab"
                        to="document-view"
                    >
                        Document
                    </TabLink>
                    <TabLink
                        styleName="document-tab"
                        to="simplified-view"
                    >
                        Simplified
                    </TabLink>
                    <TabLink
                        styleName="document-tab"
                        to="ngram-view"
                    >
                        Extracted Words
                    </TabLink>
                    {/* Essential for border bottom, for more info contact AdityaKhatri */}
                    <div styleName="empty-tab" />
                </div>
                <div styleName="content">
                    { pending && <LoadingAnimation /> }
                    <TabContent
                        styleName="document-tab"
                        for="document-view"
                    >
                        <DocumentSelect
                            match={match}
                        />
                    </TabContent>
                    <TabContent
                        styleName="simplified-tab"
                        for="simplified-view"
                    >
                        <div styleName="simplified-tab">
                            <SimplifiedFilePreview
                                // styleName="text"
                                fileIds={fileIds}
                                previewId={previewId}
                                onLoad={this.handleFilesPreviewLoad}
                                preLoad={this.handlePreLoad}
                                postLoad={this.handlePostLoad}
                            />
                        </div>
                    </TabContent>
                    <TabContent
                        styleName="ngrams-tab"
                        for="ngram-view"
                    >
                        <DocumentNGram
                            match={match}
                        />
                    </TabContent>
                </div>
            </Tabs>
        );
    }
}
