import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';

import MatrixRow from '../common/MatrixRow';

import { iconNames } from '../../../../../common/constants';
import { randomString } from '../../../../../public/utils/common';
import {
    TransparentPrimaryButton,
    TransparentDangerButton,
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';
import {
    TextInput,
} from '../../../../../public/components/Input';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
} from '../../../../../public/components/View';

import styles from '../styles.scss';

const propTypes = {
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    data: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    data: [],
};

@CSSModules(styles)
export default class Matrix1dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            rows: props.data || [],
        };

        this.props.editAction(this.handleEdit);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            rows: nextProps.data || [],
        });
    }

    getEditRow = (key, data) => (
        <div
            className={styles['edit-row']}
            key={key}
        >
            <TextInput
                className={styles['title-input']}
                label="Title"
                placeholder="eg: Context"
                onChange={(value) => { this.handleRowValueInputChange(key, value); }}
                value={data.title}
            />
            <TransparentDangerButton
                className={styles['delete-button']}
                onClick={() => { this.handleRowRemoveButtonClick(key); }}
            >
                <span className={iconNames.delete} />
            </TransparentDangerButton>
        </div>
    )

    getRow = (key, data) => (
        <MatrixRow
            key={key}
            title={data.title}
            cells={data.cells}
            onChange={(value) => { this.handleRowDataChange(key, value); }}
        />
    )

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleRowDataChange = (key, cells) => {
        const newRows = [...this.state.rows];

        const rowIndex = newRows.findIndex(d => d.key === key);

        newRows[rowIndex].cells = cells;

        this.setState({
            rows: newRows,
        });
    }

    handleRowRemoveButtonClick = (key) => {
        const newRows = [...this.state.rows];

        const rowIndex = newRows.findIndex(d => d.key === key);
        newRows.splice(rowIndex, 1);

        this.setState({
            rows: newRows,
        });
    }

    handleRowValueInputChange = (key, value) => {
        const newRows = [...this.state.rows];

        const rowIndex = newRows.findIndex(d => d.key === key);
        newRows[rowIndex].title = value;

        this.setState({
            rows: newRows,
        });
    }

    handleAddRowButtonClick = () => {
        this.addRow();
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({
            showEditModal: false,
            rows: this.props.data,
        });
    }

    handleModalSaveButtonClick = () => {
        this.setState({
            showEditModal: false,
        });

        this.props.onChange(this.state.rows);
    }

    addRow = () => {
        const newRow = {
            key: randomString(),
            title: '',
            cells: [],
        };

        this.setState({
            rows: [
                ...this.state.rows,
                newRow,
            ],
        });
    }

    render() {
        const {
            rows,
            showEditModal,
        } = this.state;

        return (
            <div styleName="framework-matrix-1d">
                <ListView
                    data={rows}
                    className={styles.rows}
                    keyExtractor={Matrix1dOverview.rowKeyExtractor}
                    modifier={this.getRow}
                />
                <Modal
                    styleName="edit-row-modal"
                    show={showEditModal}
                    onClose={this.handleEditModalClose}
                >
                    <ModalHeader
                        title="Edit row"
                        rightComponent={
                            <TransparentPrimaryButton
                                onClick={this.handleAddRowButtonClick}
                            >
                                Add row
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody>
                        <ListView
                            data={rows}
                            className={styles['row-list']}
                            keyExtractor={Matrix1dOverview.rowKeyExtractor}
                            modifier={this.getEditRow}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            onClick={this.handleModalCancelButtonClick}
                        >
                            Cancel
                        </Button>
                        <PrimaryButton
                            onClick={this.handleModalSaveButtonClick}
                        >
                            Save
                        </PrimaryButton>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
