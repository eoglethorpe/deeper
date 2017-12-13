import CSSModules from 'react-css-modules';
import React from 'react';

import MatrixRow from '../common/MatrixRow';

import { iconNames } from '../../../../../common/constants';
import { randomString } from '../../../../../public/utils/common';
import {
    TransparentButton,
    TransparentPrimaryButton,
    Button,
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

@CSSModules(styles)
export default class Matrix1dOverview extends React.PureComponent {
    static rowKeyExtractor = d => d.key;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            rows: [],
        };
    }

    getEditRow = (key, data) => (
        <div
            className={styles['edit-row']}
            key={key}
        >
            <TextInput
                placeholder="Enter row title"
                onChange={(value) => { this.handleRowValueInputChange(key, value); }}
                value={data.title}
            />
            <TransparentButton
                onClick={() => { this.handleRowRemoveButtonClick(key); }}
            >
                <span className={iconNames.delete} />
            </TransparentButton>
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

    handleEditButtonClick = () => {
        this.setState({ showEditModal: true });
    }

    handleAddRowButtonClick = () => {
        this.addRow();
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleCloseModalButtonClick = () => {
        this.setState({ showEditModal: false });
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
            <div styleName="tagging-matrix-1d">
                <ListView
                    data={rows}
                    className={styles.rows}
                    keyExtractor={Matrix1dOverview.rowKeyExtractor}
                    modifier={this.getRow}
                />
                <div styleName="action-buttons">
                    <Button
                        onClick={this.handleEditButtonClick}
                    >
                        <span className={iconNames.edit} /> Edit
                    </Button>
                </div>
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
                            onClick={this.handleCloseModalButtonClick}
                        >
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
