import CSSModules from 'react-css-modules';
import PropTypes from 'prop-types';
import React from 'react';
import { SketchPicker } from 'react-color';

import {
    TextInput,
} from '../../../../../public/components/Input';
import {
    TransparentPrimaryButton,
    TransparentDangerButton,
    Button,
    PrimaryButton,
} from '../../../../../public/components/Action';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ListView,
} from '../../../../../public/components/View';
import { iconNames } from '../../../../../common/constants';
import { randomString } from '../../../../../public/utils/common';

import styles from './styles.scss';


const propTypes = {
    editAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired, //eslint-disable-line
    data: PropTypes.object, //eslint-disable-line
};

@CSSModules(styles)
export default class ScaleFrameworkList extends React.PureComponent {
    static rowKeyExtractor = d => d.key;
    static propTypes = propTypes;

    constructor(props) {
        super(props);

        this.state = {
            showEditModal: false,
            scaleUnits: [],
        };
        this.props.editAction(this.handleEdit);
    }

    getEditScaleUnits = (key, data) => (
        <div
            className={styles['edit-row']}
            key={key}
        >
            <div className={styles['color-box-container']}>
                <span className={styles['color-label']}>Color</span>
                <button
                    className={styles['color-box']}
                />
            </div>
            <TextInput
                className={styles['title-input']}
                label="Title"
                placeholder="eg: Reliable"
                onChange={(value) => { this.handleScaleUnitValueInputChange(key, value); }}
                value={data.title}
                showHintAndError={false}
            />
            <TransparentDangerButton
                className={styles['delete-button']}
                onClick={() => { this.handleScaleUnitRemoveButtonClick(key); }}
            >
                <span className={iconNames.delete} />
            </TransparentDangerButton>
        </div>
    )

    handleEdit = () => {
        this.setState({ showEditModal: true });
    }

    handleAddScaleUnitButtonClick = () => {
        this.addScaleUnit();
    }

    handleEditModalClose = () => {
        this.setState({ showEditModal: false });
    }

    handleModalCancelButtonClick = () => {
        this.setState({ showEditModal: false });
    }

    handleModalSaveButtonClick = () => {
        this.setState({ showEditModal: false });
    }

    handleScaleUnitValueInputChange = (key, value) => {
        const newScaleUnits = [...this.state.scaleUnits];

        const rowIndex = newScaleUnits.findIndex(d => d.key === key);
        newScaleUnits[rowIndex].title = value;

        this.setState({
            scaleUnits: newScaleUnits,
        });
    }

    handleScaleUnitRemoveButtonClick = (key) => {
        const newScaleUnits = [...this.state.scaleUnits];

        const scaleUnitIndex = newScaleUnits.findIndex(d => d.key === key);
        newScaleUnits.splice(scaleUnitIndex, 1);

        this.setState({
            scaleUnits: newScaleUnits,
        });
    }

    addScaleUnit = () => {
        const newScaleUnit = {
            key: randomString(16).toLowerCase(),
            title: '',
            color: '',
        };

        this.setState({
            scaleUnits: [
                ...this.state.scaleUnits,
                newScaleUnit,
            ],
        });
    }

    render() {
        const {
            scaleUnits,
            showEditModal,
        } = this.state;

        return (
            <div styleName="scale-list">
                Scalalal
                <Modal
                    styleName="edit-scales-modal"
                    show={showEditModal}
                    onClose={this.handleEditModalClose}
                >
                    <ModalHeader
                        title="Edit scales"
                        rightComponent={
                            <TransparentPrimaryButton
                                iconName={iconNames.add}
                                onClick={this.handleAddScaleUnitButtonClick}
                            >
                                Add scale unit
                            </TransparentPrimaryButton>
                        }
                    />
                    <ModalBody styleName="scale-units-container">
                        <ListView
                            styleName="list"
                            data={scaleUnits}
                            keyExtractor={ScaleFrameworkList.rowKeyExtractor}
                            modifier={this.getEditScaleUnits}
                        />
                        <SketchPicker />
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
