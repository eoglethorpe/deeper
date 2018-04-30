import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import {
    caseInsensitiveSubmatch,
    compareString,
    compareDate,
} from '../../vendor/react-store/utils/common';
import { FgRestBuilder } from '../../vendor/react-store/utils/rest';
import Table from '../../vendor/react-store/components/View/Table';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import ModalHeader from '../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../vendor/react-store/components/View/Modal/Footer';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';
import Button from '../../vendor/react-store/components/Action/Button';
import PrimaryButton from '../../vendor/react-store/components/Action/Button/PrimaryButton';
import AccentButton from '../../vendor/react-store/components/Action/Button/AccentButton';
import SearchInput from '../../vendor/react-store/components/Input/SearchInput';

import {
    createUrlForGalleryFiles,
    createHeaderForGalleryFile,
} from '../../rest';
import {
    userGalleryFilesSelector,
    setUserGalleryFilesAction,
    commonStringsSelector,
} from '../../redux';
import { iconNames } from '../../constants';
import { leadTypeIconMap } from '../../entities/lead';

import styles from './styles.scss';

const propTypes = {
    params: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onClose: PropTypes.func.isRequired,

    setUserGalleryFiles: PropTypes.func.isRequired,
    galleryFiles: PropTypes.arrayOf(
        PropTypes.shape({}),
    ),
    commonStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    params: {},
    galleryFiles: [],
};

const mapStateToProps = state => ({
    galleryFiles: userGalleryFilesSelector(state),
    commonStrings: commonStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setUserGalleryFiles: params => dispatch(setUserGalleryFilesAction(params)),
});

/*
 * Deep Gallery Files Selector Component
 *
 */
@connect(mapStateToProps, mapDispatchToProps)
export default class DgSelect extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.galleryFilesHeader = [
            {
                key: 'actions',
                label: this.props.commonStrings('tableHeaderSelect'),
                order: 1,
                modifier: row => this.renderCheckbox(row),
            },
            {
                key: 'mimeType',
                label: this.props.commonStrings('tableHeaderType'),
                order: 2,
                sortable: true,
                comparator: (a, b) => compareString(a.mimeType, b.mimeType),
                modifier: row => this.renderGalleryFileType(row),
            },
            {
                key: 'title',
                label: this.props.commonStrings('tableHeaderName'),
                order: 3,
                sortable: true,
                comparator: (a, b) => compareString(a.title, b.title),
            },
            {
                key: 'createdAt',
                label: this.props.commonStrings('tableHeaderDateCreated'),
                order: 4,
                sortable: true,
                comparator: (a, b) => compareDate(a.createdAt, b.createdAt),
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy hh:mm"
                    />
                ),
            },
        ];

        this.defaultSort = {
            key: 'createdAt',
            order: 'dsc',
        };

        this.state = {
            pending: true,
            selected: [],
            searchInputValue: undefined,
        };
    }

    componentWillMount() {
        if (this.userGalleryFilesRequest) {
            this.userGalleryFilesRequest.stop();
        }

        this.userGalleryFilesRequest = this.createRequestForUserGalleryFiles(this.props.params);
        this.userGalleryFilesRequest.start();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.params !== this.props.params) {
            if (this.userGalleryFilesRequest) {
                this.userGalleryFilesRequest.stop();
            }

            this.userGalleryFilesRequest = this.createRequestForUserGalleryFiles(nextProps.params);
            this.userGalleryFilesRequest.start();
        }
    }

    componentWillUnmount() {
        if (this.userGalleryFilesRequest) {
            this.userGalleryFilesRequest.stop();
        }
    }

    onClose = () => {
        this.setState({ selected: [] });
        this.props.onClose([]);
    }

    onAdd = () => {
        const { selected } = this.state;
        const { galleryFiles } = this.props;

        const selectedGalleryFiles = selected.map(id => (
            galleryFiles.find(file => file.id === +id) || { id }
        ));

        this.props.onClose(selectedGalleryFiles);
        this.setState({ selected: [] });
    }

    getTableData = ({ galleryFiles, selected, searchInputValue }) => {
        const filterdGalleryFiles = galleryFiles.filter(file =>
            caseInsensitiveSubmatch(file.title, searchInputValue),
        );

        return filterdGalleryFiles.map(file => (
            { ...file, selected: selected.includes(file.id) }
        ));
    }

    createRequestForUserGalleryFiles = (params) => {
        const userGalleryFilesRequest = new FgRestBuilder()
            .url(createUrlForGalleryFiles(params))
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
                    // FIXME: write schema
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
        const { selected } = this.state;
        const index = selected.indexOf(file.id);
        if (index === -1) {
            // add to array
            this.setState({
                selected: selected.concat(file.id),
            });
        } else {
            // remove from array
            const newSelected = [...selected];
            newSelected.splice(index, 1);
            this.setState({
                selected: newSelected,
            });
        }
    }

    handleSearchInputChange = (searchInputValue) => {
        this.setState({
            searchInputValue,
        });
    };

    keyExtractor = file => file.id

    renderGalleryFileType = (row) => {
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

    renderCheckbox = row => (
        <AccentButton
            // FIXME: use strings
            title={row.selected ? 'Unselect' : 'Select'}
            onClick={() => this.handleFileSelection(row)}
            smallVerticalPadding
            transparent
            iconName={row.selected ? iconNames.checkbox : iconNames.checkboxOutlineBlank}
        />
    )

    render() {
        const {
            pending,
            selected,
            searchInputValue,
        } = this.state;

        const { galleryFiles } = this.props;

        // FIXME: performance problem
        const tableData = this.getTableData({
            galleryFiles,
            selected,
            searchInputValue,
        });

        return ([
            <ModalHeader
                key="header"
                className={styles.modalHeader}
                title="Select Gallery Files"
                rightComponent={
                    <SearchInput
                        onChange={this.handleSearchInputChange}
                        placeholder={this.props.commonStrings('searchGalleryPlaceholder')}
                        className={styles.searchInput}
                        label={this.props.commonStrings('searchGalleryLabel')}
                        value={searchInputValue}
                        showLabel={false}
                        showHintAndError={false}
                        disabled={pending}
                    />
                }
            />,
            <ModalBody
                className={styles.modalBody}
                key="body"
            >
                { pending && <LoadingAnimation /> }
                <Table
                    data={tableData}
                    headers={this.galleryFilesHeader}
                    keyExtractor={this.keyExtractor}
                    defaultSort={this.defaultSort}
                />
            </ModalBody>,
            <ModalFooter key="footer">
                <Button
                    onClick={this.onClose}
                >
                    {this.props.commonStrings('cancelButtonLabel')}
                </Button>
                <PrimaryButton
                    onClick={this.onAdd}
                    disabled={pending}
                >
                    {this.props.commonStrings('addButtonLabel')}
                </PrimaryButton>
            </ModalFooter>,
        ]);
    }
}
