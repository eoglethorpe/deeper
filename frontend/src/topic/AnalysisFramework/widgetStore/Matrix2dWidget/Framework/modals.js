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

import { afStrings } from '../../../../../common/constants';

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
                            {afStrings.sectorLabel}
                        </h4>
                        <TransparentButton
                            onClick={parent.handler.addSectorButtonClick}
                        >
                            {afStrings.addSectorButtonLabel}
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
                            {afStrings.dimensionLabel}
                        </h4>
                        <TransparentButton
                            tabIndex="-1"
                            onClick={parent.handler.addDimensionButtonClick}
                        >
                            {afStrings.addDimensionButtonLabel}
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
                    {afStrings.cancelButtonLabel}
                </Button>
                <PrimaryButton
                    onClick={parent.handler.editWidgetModalSaveButtonClick}
                >
                    {afStrings.saveButtonLabel}
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
                title={afStrings.addSubsectorModalTitle}
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
                            {afStrings.subsectorsLabel}
                        </h4>
                        <TransparentButton
                            onClick={parent.handler.addSubsectorButtonClick}
                        >
                            {afStrings.addButtonLabel}
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
                    {afStrings.cancelButtonLabel}
                </Button>
                <PrimaryButton
                    onClick={parent.handler.editSectorsModalSaveButtonClick}
                >
                    {afStrings.saveButtonLabel}
                </PrimaryButton>
            </ModalFooter>
        </Modal>
    );
};
