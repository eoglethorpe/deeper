import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import {
    Redirect,
    Link,
} from 'react-router-dom';

import { reverseRoute } from '../../vendor/react-store/utils/common';
import Confirm from '../../vendor/react-store/components/View/Modal/Confirm';
import FormattedDate from '../../vendor/react-store/components/View/FormattedDate';
import LoadingAnimation from '../../vendor/react-store/components/View/LoadingAnimation';
import Pager from '../../vendor/react-store/components/View/Pager';
import RawTable from '../../vendor/react-store/components/View/RawTable';
import TableHeader from '../../vendor/react-store/components/View/TableHeader';
import BoundError from '../../vendor/react-store/components/General/BoundError';
import AppError from '../../components/AppError';
import ActionButtons from './ActionButtons';

import {
    activeProjectSelector,

    arysForProjectSelector,
    totalArysCountForProjectSelector,
    aryPageActivePageSelector,
    aryPageActiveSortSelector,
    aryPageFilterSelector,
    arysStringsSelector,

    setArysAction,
    setAryPageActivePageAction,
    setAryPageActiveSortAction,
} from '../../redux';

import { pathNames } from '../../constants/';
import FilterArysForm from './FilterArysForm';
import ArysGetRequest from './requests/ArysGetRequest';
import AryDeleteRequest from './requests/AryDeleteRequest';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    arys: PropTypes.array, // eslint-disable-line react/forbid-prop-types

    activePage: PropTypes.number.isRequired,
    activeSort: PropTypes.string.isRequired,
    activeProject: PropTypes.number.isRequired,
    setArys: PropTypes.func.isRequired,
    totalArysCount: PropTypes.number,
    setAryPageActiveSort: PropTypes.func.isRequired,
    setAryPageActivePage: PropTypes.func.isRequired,

    arysStrings: PropTypes.func.isRequired,
};

const defaultProps = {
    className: '',
    arys: [],
    totalArysCount: 0,
};

const mapStateToProps = (state, props) => ({
    activeProject: activeProjectSelector(state),

    arys: arysForProjectSelector(state, props),
    totalArysCount: totalArysCountForProjectSelector(state, props),
    activePage: aryPageActivePageSelector(state, props),
    activeSort: aryPageActiveSortSelector(state, props),
    filters: aryPageFilterSelector(state, props),
    arysStrings: arysStringsSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setArys: params => dispatch(setArysAction(params)),

    setAryPageActivePage: params => dispatch(setAryPageActivePageAction(params)),
    setAryPageActiveSort: params => dispatch(setAryPageActiveSortAction(params)),
});

const MAX_ARYS_PER_REQUEST = 24;

@BoundError(AppError)
@connect(mapStateToProps, mapDispatchToProps)
export default class Arys extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.headers = [
            {
                key: 'lead__title',
                label: this.props.arysStrings('titleLabel'),
                order: 1,
                sortable: true,
                modifier: row => row.leadTitle,
            },
            {
                key: 'created_at',
                label: this.props.arysStrings('createdAt'),
                order: 2,
                sortable: true,
                modifier: row => (
                    <FormattedDate
                        date={row.createdAt}
                        mode="dd-MM-yyyy"
                    />
                ),
            },
            {
                key: 'created_by',
                label: this.props.arysStrings('createdByFilterLabel'),
                order: 3,
                sortable: true,
                modifier: row => (
                    <Link
                        key={row.createdBy}
                        to={reverseRoute(pathNames.userProfile, { userId: row.createdBy })}
                    >
                        {row.createdByName}
                    </Link>
                ),
            },
            {
                key: 'actions',
                label: this.props.arysStrings('tableHeaderActions'),
                order: 4,
                sortable: false,
                modifier: row => (
                    <ActionButtons
                        row={row}
                        arysStrings={this.props.arysStrings}
                        activeProject={this.props.activeProject}
                        onRemoveAry={this.handleRemoveAry}
                    />
                ),
            },
        ];

        this.state = {
            loadingArys: false,
            redirectTo: undefined,

            showDeleteModal: false,
            aryToDelete: undefined,
        };
    }

    componentWillMount() {
        this.pullArys();
    }

    componentWillReceiveProps(nextProps) {
        const {
            activeProject,
            activeSort,
            filters,
            activePage,
        } = nextProps;

        if (
            this.props.activeProject !== activeProject ||
            this.props.activeSort !== activeSort ||
            this.props.filters !== filters ||
            this.props.activePage !== activePage
        ) {
            this.pullArys(nextProps);
        }
    }

    componentWillUnmount() {
        this.arysRequest.stop();

        if (this.aryDeleteRequest) {
            this.aryDeleteRequest.stop();
        }
    }

    pullArys = (props = this.props) => {
        const {
            activePage,
            activeProject,
            activeSort,
            filters,
        } = props;

        if (this.arysRequest) {
            this.arysRequest.stop();
        }

        const arysRequest = new ArysGetRequest({
            setState: params => this.setState(params),
            setArys: this.props.setArys,
        });

        this.arysRequest = arysRequest.create({
            activeProject,
            activePage,
            activeSort,
            filters,
            MAX_ARYS_PER_REQUEST,
        });

        this.arysRequest.start();
    }

    // UI

    handleRemoveAry = (row) => {
        this.setState({
            showDeleteModal: true,
            aryToDelete: row,
        });
    };

    handleDeleteModalClose = (confirm) => {
        if (confirm) {
            const { aryToDelete } = this.state;
            if (this.aryDeleteRequest) {
                this.aryDeleteRequest.stop();
            }
            const aryDeleteRequest = new AryDeleteRequest({
                setState: params => this.setState(params),
                pullArys: this.pullArys,
            });
            this.aryDeleteRequest = aryDeleteRequest.create(aryToDelete);
            this.aryDeleteRequest.start();
        }

        this.setState({
            showDeleteModal: false,
            aryToDelete: undefined,
        });
    }

    handlePageClick = (page) => {
        this.props.setAryPageActivePage({ activePage: page });
    }

    // TABLE

    aryKeyExtractor = ary => (ary.id.toString())

    aryModifier = (ary, columnKey) => {
        const header = this.headers.find(d => d.key === columnKey);
        if (header.modifier) {
            return header.modifier(ary);
        }
        return ary[columnKey];
    }

    headerModifier = (headerData) => {
        const { activeSort } = this.props;

        let sortOrder = '';
        if (activeSort === headerData.key) {
            sortOrder = 'asc';
        } else if (activeSort === `-${headerData.key}`) {
            sortOrder = 'dsc';
        }
        return (
            <TableHeader
                label={headerData.label}
                sortOrder={sortOrder}
                sortable={headerData.sortable}
            />
        );
    }

    handleTableHeaderClick = (key) => {
        const headerData = this.headers.find(h => h.key === key);
        // prevent click on 'actions' column
        if (!headerData.sortable) {
            return;
        }

        let { activeSort } = this.props;
        if (activeSort === key) {
            activeSort = `-${key}`;
        } else {
            activeSort = key;
        }
        this.props.setAryPageActiveSort({ activeSort });
    }

    renderHeader = () => (
        <header className={styles.header}>
            <FilterArysForm className={styles.filters} />
        </header>
    )

    renderFooter = () => {
        const {
            totalArysCount,
            activePage,
        } = this.props;

        // FIXME: use strings
        return (
            <footer className={styles.footer}>
                <Pager
                    activePage={activePage}
                    className={styles.pager}
                    itemsCount={totalArysCount}
                    maxItemsPerPage={MAX_ARYS_PER_REQUEST}
                    onPageClick={this.handlePageClick}
                />
            </footer>
        );
    }

    render() {
        const {
            loadingArys,
            showDeleteModal,
            redirectTo,
        } = this.state;
        const { className, arys } = this.props;

        if (redirectTo) {
            return (
                <Redirect
                    to={redirectTo}
                    push
                />
            );
        }

        const Header = this.renderHeader;
        const Footer = this.renderFooter;

        return (
            <div className={`${className} ${styles.arys}`}>
                <Header />
                <div className={styles.tableContainer}>
                    <RawTable
                        data={arys}
                        dataModifier={this.aryModifier}
                        headerModifier={this.headerModifier}
                        headers={this.headers}
                        onHeaderClick={this.handleTableHeaderClick}
                        keyExtractor={this.aryKeyExtractor}
                        className={styles.arysTable}
                    />
                    { loadingArys && <LoadingAnimation /> }
                </div>
                <Footer />
                <Confirm
                    show={showDeleteModal}
                    closeOnEscape
                    onClose={this.handleDeleteModalClose}
                >
                    <p>
                        {this.props.arysStrings('aryDeleteConfirmText')}
                    </p>
                </Confirm>
            </div>
        );
    }
}
