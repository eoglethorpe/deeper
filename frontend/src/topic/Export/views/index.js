import CSSModules from 'react-css-modules';
import React from 'react';

import styles from './styles.scss';
import {
    Form,
    RadioInput,
} from '../../../public/components/Input';
import {
    TransparentButton,
} from '../../../public/components/Action';
import FilterSection from '../components/FilterSection';
import StructureSection from '../components/StructureSection';

const propTypes = {
};

const defaultProps = {
};

@CSSModules(styles, { allowMultiple: true })
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.elements = [];
        this.options = [
            {
                key: 1,
                label: 'Generic',
            },
            {
                key: 2,
                label: 'GEO',
            },
            {
                key: 3,
                label: 'Briefing Note',
            },
        ];
    }

    render() {
        return (
            <div styleName="export">
                <div styleName="preview-container">
                    <div><h1>No Preview Available</h1></div>
                </div>
                <Form
                    styleName="form-container"
                    elements={this.elements}
                >
                    <header
                        styleName="header"
                    >
                        <div styleName="export-type">
                            <RadioInput
                                name="export-type"
                                selected={1}
                                options={this.options}
                            />
                        </div>
                        <div styleName="action-buttons">
                            <TransparentButton
                                styleName="word-document"
                            >
                                <i className="ion-android-document" />
                                Docx (preview)
                            </TransparentButton>
                            <TransparentButton
                                styleName="word-document"
                            >
                                <i className="ion-android-document" />
                                Docx
                            </TransparentButton>
                            <TransparentButton
                                styleName="pdf-document"
                            >
                                <i className="ion-android-document" />
                                Pdf
                            </TransparentButton>
                            <TransparentButton
                                styleName="excel-document"
                            >
                                <i className="ion-android-document" />
                                Excel
                            </TransparentButton>
                            <TransparentButton
                                styleName="json"
                            >
                                <i className="ion-android-document" />
                                JSON
                            </TransparentButton>
                        </div>
                    </header>
                    <div styleName="content">
                        <FilterSection
                            styleName="filter-section"
                        />
                        <StructureSection
                            styleName="structure-section"
                        />
                    </div>
                </Form>
            </div>
        );
    }
}
