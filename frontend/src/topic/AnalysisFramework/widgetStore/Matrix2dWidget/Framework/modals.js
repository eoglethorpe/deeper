import React from 'react';
import {
    TransparentButton,
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

const emptyList = [];

export const getEditWidgetModal = (parent) => {
    const {
        data,
        showEditWidgetModal,
    } = parent.state;

    const {
        sectors = emptyList,
    } = data;

    return (
        <Modal
            show={showEditWidgetModal}
            styleName="edit-widget-modal"
            onClose={parent.handler.editWidgetModalClose}
        >
            <ModalHeader
                title={`Edit ${data.title || 'title'}`}
            />
            <ModalBody styleName="modal-body">
                <TextInput
                    styleName="title-input"
                    onChange={parent.handler.widgetTitleInputChange}
                    label="Title"
                    value={data.title}
                    showHintAndError={false}
                />
                <section styleName="edit-sectors">
                    <header styleName="header">
                        <h4 styleName="heading">
                            Sectors
                        </h4>
                        <TransparentButton
                            onClick={parent.handler.addSectorButtonClick}
                        >
                            Add sector
                        </TransparentButton>
                    </header>
                    <ListView
                        styleName="list"
                        data={sectors}
                        modifier={parent.renderer.editSector}
                        keyExtractor={d => d.id}
                    />
                </section>
                <section styleName="edit-dimensions">
                    <header styleName="header">
                        <h4 styleName="heading">
                            Dimensions
                        </h4>
                        <TransparentButton
                            tabIndex="-1"
                            onClick={parent.handler.addDimensionButtonClick}
                        >
                            Add dimension
                        </TransparentButton>
                    </header>
                    <ListView
                        styleName="list"
                        data={data.dimensions || emptyList}
                        modifier={parent.renderer.editDimension}
                        keyExtractor={d => d.id}
                    />
                </section>
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={parent.handler.editWidgetModalCancelButtonClick}
                >
                    Cancel
                </Button>
                <PrimaryButton
                    onClick={parent.handler.editWidgetModalSaveButtonClick}
                >
                    Save
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
};

export const getEditSectorsModal = (parent) => {
    const {
        data,
        showEditSectorsModal,
        selectedSectorIndex,
    } = parent.state;

    const {
        sectors = emptyList,
    } = data;

    return (
        <Modal
            show={showEditSectorsModal}
            styleName="edit-sectors-modal"
            onClose={parent.handler.editSectorsModalClose}
        >
            <ModalHeader
                title="Add subsectors"
            />
            <ModalBody styleName="modal-body">
                <ListView
                    styleName="select-sector-list"
                    data={sectors || emptyList}
                    modifier={parent.renderer.selectSector}
                    keyExtractor={d => d.id}
                />
                <div styleName="edit-subsectors">
                    <header styleName="header">
                        <h4>
                            Subsectors
                        </h4>
                        <TransparentButton
                            onClick={parent.handler.addSubsectorButtonClick}
                        >
                            Add
                        </TransparentButton>
                    </header>
                    <ListView
                        styleName="sub-sector-list"
                        data={
                            (sectors[selectedSectorIndex] || emptyList).subsectors || emptyList
                        }
                        modifier={parent.renderer.editSubsector}
                        keyExtractor={d => d.id}
                    />
                </div>
            </ModalBody>
            <ModalFooter>
                <Button
                    onClick={parent.handler.editSectorsModalCancelButtonClick}
                >
                    Cancel
                </Button>
                <PrimaryButton
                    onClick={parent.handler.editSectorsModalSaveButtonClick}
                >
                    Save
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
};
