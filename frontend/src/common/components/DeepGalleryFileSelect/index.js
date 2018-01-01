import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';

import {
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormattedDate,
    LoadingAnimation,
} from '../../../public/components/View';
import { TextInput } from '../../../public/components/Input';
import {
    TransparentPrimaryButton,
    PrimaryButton,
    Button,
} from '../../../public/components/Action';

import {
    caseInsensitiveSubmatch,
} from '../../../public/utils/common';

import {
    urlForUsersGalleryFiles,
    createHeaderForGalleryFile,
} from '../../../common/rest';

import {
    userGalleryFilesSelector,
    setUserGalleryFilesAction,
} from '../../../common/redux';

import { iconNames } from '../../../common/constants';

import { FgRestBuilder } from '../../../public/utils/rest';

import { leadTypeIconMap } from '../../../common/entities/lead';

const propTypes = {
    show: PropTypes.bool,
    onClose: PropTypes.func.isRequired,

    setUserGalleryFiles: PropTypes.func.isRequired,
    galleryFiles: PropTypes.arrayOf(
        PropTypes.shape({}),
    ),
};

const defaultProps = {
    show: false,
    galleryFiles: [],
};

const mapStateToProps = state => ({
    galleryFiles: userGalleryFilesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGalleryFiles: params => dispatch(setUserGalleryFilesAction(params)),
});

/*
 * Deep Gallery Files Selector Component
 *
 */
@connect(mapStateToProps, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class DeepGallery extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.galleryFilesHeader = [
            {
                key: 'actions',
                label: 'Action',
                order: 1,
                modifier: row => this.showCheckbox(row),
            },
            {
                key: 'mimeType',
                label: 'Type',
                order: 2,
                sortable: true,
                comparator: (a, b) => (a.mimeType || '').localeCompare(b.mimeType || ''),
                modifier: row => this.showGalleryFileType(row),
            },
            {
                key: 'title',
                label: 'Name',
                order: 3,
                sortable: true,
                comparator: (a, b) => a.title.localeCompare(b.title),
            },
            {
                key: 'createdAt',
                label: 'Date Created',
                order: 4,
                sortable: true,
                comparator: (a, b) => a.createdAt.localeCompare(b.createdAt),
                modifier: row => <FormattedDate date={row.createdAt} mode="dd-MM-yyyy hh:mm" />,
            },
        ];

        this.defaultSort = {
            key: 'createdAt',
            order: 'dsc',
        };

        this.state = {
            pending: false,
            galleryFilesSelection: {},
            searchInputValue: undefined,
        };

        this.userGalleryFilesRequest = this.createRequestForUserGalleryFiles();
    }

    componentWillMount() {
        this.userGalleryFilesRequest.start();
    }

    componentWillUnmount() {
        this.userGalleryFilesRequest.stop();
    }

    onClose = () => {
        this.props.onClose([]);
    }

    onAdd = () => {
        const { galleryFilesSelection } = this.state;
        this.props.onClose(Object.keys(galleryFilesSelection));
    }

    getTableData = ({ galleryFiles, galleryFilesSelection, searchInputValue }) => {
        const filterdGalleryFiles = galleryFiles.filter(file =>
            caseInsensitiveSubmatch(file.title, searchInputValue),
        );

        return filterdGalleryFiles.map(file => (
            { ...file, selected: galleryFilesSelection[file.id] }
        ));
    }

    createRequestForUserGalleryFiles = () => {
        const userGalleryFilesRequest = new FgRestBuilder()
            .url(urlForUsersGalleryFiles)
            .params(createHeaderForGalleryFile())
            .preLoad(() => {
                this.setState({
                    pending: true,
                });
            })
            .postLoad(() => {
                this.setState({
                    pending: false,
                });
            })
            .success((response) => {
                try {
                    // TODO: validate schema
                    this.props.setUserGalleryFiles({
                        galleryFiles: response.results,
                    });
                } catch (err) {
                    console.error(err);
                }
            })
            .failure((response) => {
                console.error('Failed to get user gallery files', response);
                this.setState({
                    pending: false,
                });
            })
            .fatal((response) => {
                console.error('Fatal error occured while getting users gallery files', response);
                this.setState({
                    pending: false,
                });
            })
            .build();
        return userGalleryFilesRequest;
    }

    handleFileSelection = (file) => {
        const newGalleryFilesSelection = { ...this.state.galleryFilesSelection };
        newGalleryFilesSelection[file.id] = !newGalleryFilesSelection[file.id];
        this.setState({
            galleryFilesSelection: newGalleryFilesSelection,
        });
    }

    handleSearchInputChange = (searchInputValue) => {
        this.setState({
            searchInputValue,
        });
    };

    showGalleryFileType = (row) => {
        const icon = leadTypeIconMap[row.mimeType] || iconNames.documentText;
        const url = row.file;
        if (!url) {
            return (
                <i className={icon} />
            );
        }
        return (
            <a href={url} target="_blank">
                <i className={icon} />
            </a>
        );
    }

    showCheckbox = row => (
        <div>
            <TransparentPrimaryButton
                title={row.selected ? 'Unselect' : 'Select'}
                onClick={() => this.handleFileSelection(row)}
            >
                {
                    row.selected ? <i className={iconNames.checkbox} />
                        : <i className={iconNames.checkboxOutlineBlank} />
                }
            </TransparentPrimaryButton>
        </div>
    )

    keyExtractor = file => file.id

    renderFileName = ({ fileName, fileUrl }) => (
        fileUrl ?
            <a
                styleName="gallery-file-name"
                href={fileUrl}
                target="_blank"
            >
                {fileName}
            </a>
            : <span />
    )

    render() {
        const {
            pending,
            galleryFilesSelection,
            searchInputValue,
        } = this.state;

        const {
            show,
            galleryFiles,
        } = this.props;

        const tableData = this.getTableData({
            galleryFiles,
            galleryFilesSelection,
            searchInputValue,
        });

        return (
            <Modal
                styleName="add-gallery-file-modal"
                closeOnEscape
                onClose={this.onClose}
                show={show}
            >
                { pending && <LoadingAnimation /> }
                <ModalHeader
                    title="Select Gallery Files"
                    rightComponent={
                        <TransparentPrimaryButton
                            onClick={this.onClose}
                        >
                            <span className={iconNames.close} />
                        </TransparentPrimaryButton>
                    }
                />
                <TextInput
                    onChange={this.handleSearchInputChange}
                    placeholder="Search Gallery Files"
                    styleName="search-input"
                    type="search"
                    label="Search"
                    value={searchInputValue}
                    showLabel={false}
                    showHintAndError={false}
                />
                <ModalBody styleName="modal-body">
                    <Table
                        styleName="gallery-table"
                        data={tableData}
                        headers={this.galleryFilesHeader}
                        keyExtractor={this.keyExtractor}
                        defaultSort={this.defaultSort}
                    />
                </ModalBody>
                <ModalFooter>
                    <PrimaryButton
                        onClick={this.onAdd}
                    >
                        Add
                    </PrimaryButton>
                    <Button
                        onClick={this.onClose}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
