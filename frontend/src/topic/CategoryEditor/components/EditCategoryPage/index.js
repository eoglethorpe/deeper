import CSSModules from 'react-css-modules';
import React from 'react';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

import {
    SelectInput,
    TextInput,
    TextArea,
    Form,
    requiredCondition,
    NonFieldErrors,
} from '../../../../public/components/Input';
import {
    PrimaryButton,
    DangerButton,
    TransparentButton,
} from '../../../../public/components/Action';
import {
    Table,
    FormattedDate,
    LoadingAnimation,
} from '../../../../public/components/View';

import styles from './styles.scss';


@CSSModules(styles, { allowMultiple: true })
export default class EditCategoryPage extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            formErrors: [],
            formFieldErrors: {},
            formValues: [],
            pending: false,
            stale: false,
        };

        this.elements = [
            'subLabel',
            'subSubLabel',
        ];

        this.validations = {
            subLabel: [requiredCondition],
            subSubLabel: [requiredCondition],
        };

        this.data = [
            {
                id: 1,
                keyword: 'Sanitation',
                publishedOn: 125412312,
            },
            {
                id: 2,
                keyword: 'Diseases',
                publishedOn: 525412312,
            },
            {
                id: 3,
                keyword: 'Cholera',
                publishedOn: 525412312,
            },
            {
                id: 4,
                keyword: 'Dysentery',
                publishedOn: 525412312,
            },
        ];
        this.tableHeaders = [
            {
                key: 'keyword',
                label: 'Keyword',
                order: 1,
                sortable: true,
                comparator: (a, b) => a.keyword.localeCompare(b.keyword),
            },
            {
                key: 'publishedOn',
                label: 'Added On',
                order: 2,
                sortable: true,
                comparator: (a, b) => a.publishedOn - b.publishedOn,
                modifier: row => <FormattedDate date={row.publishedOn} mode="dd-MM-yyyy" />,

            },
            {
                key: 'actions',
                label: 'Actions',
                order: 3,
                modifier: row => (
                    <div className="actions">
                        <TransparentButton
                            className="select-btn"
                            onClick={() => this.handleKeywordSelect(row)}
                            disabled
                        >
                            <i className="ion-android-delete" />
                        </TransparentButton>
                        <TransparentButton
                            className="select-btn"
                            onClick={() => this.handleKeywordSelect(row)}
                            disabled
                        >
                            <i className="ion-edit" />
                        </TransparentButton>
                    </div>
                ),
            },
        ];
    }

    handleKeywordSelect = (row) => {
        console.log(row);
    };

    tabStyle = { none: 'none' };

    render() {
        const {
            formValues,
            formFieldErrors,
            pending,
            stale,
            formErrors,
        } = this.state;

        return (
            <Form
                changeCallback={() => {}}
                elements={this.elements}
                failureCallback={() => {}}
                successCallback={() => {}}
                validations={this.validations}
                styleName="edit-category-page"
            >
                {
                    pending && <LoadingAnimation />
                }
                <NonFieldErrors errors={formErrors} />
                <div styleName="header">
                    <div styleName="title-children-parent">
                        <TextInput
                            formname="title"
                            label="title"
                            styleName="header-input"
                            showHintAndError={false}
                            value={formValues.title}
                            error={formFieldErrors.title}
                        />
                        <TextInput
                            formname="parent"
                            label="Parent"
                            styleName="header-input"
                            showHintAndError={false}
                            value={formValues.parent}
                            error={formFieldErrors.parent}
                        />
                        <SelectInput
                            formname="children"
                            label="Children"
                            styleName="header-input"
                            placeholder=""
                            showLabel
                            showHintAndError={false}
                            value={formValues.children}
                            error={formFieldErrors.children}
                        />
                        <div styleName="action-buttons">
                            <DangerButton
                                onClick={this.handleAddNewSubSubCategoryClose}
                                type="button"
                                disabled={pending}
                            >
                                Cancel
                            </DangerButton>
                            <PrimaryButton
                                disabled={pending || !stale}
                            >
                                Save Changes
                            </PrimaryButton>
                        </div>
                    </div>
                    <TextArea
                        formname="description"
                        label="Description"
                        styleName="textarea-content"
                        value={formValues.description}
                        error={formFieldErrors.description}
                    />
                </div>
                <Tabs
                    activeLinkStyle={this.tabStyle}
                    styleName="tabs-container"
                >
                    <div styleName="tabs-header-container">
                        <TabLink
                            styleName="tab-header"
                            to="English"
                        >
                            English
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="French"
                        >
                            French
                        </TabLink>
                        <TabLink
                            styleName="tab-header"
                            to="Spanish"
                        >
                            Spanish
                        </TabLink>
                        {/* Essential for border bottom, for more info contact AdityaKhatri */}
                        <div styleName="empty-tab" />
                    </div>
                    <TabContent
                        for="English"
                        styleName="tab"
                    >
                        <div styleName="n-gram-1">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (1)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-2">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (2)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-3">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (3)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-4">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (4)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                    </TabContent>
                    <TabContent
                        for="French"
                        styleName="tab"
                    >
                        <div styleName="n-gram-1">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (un)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-2">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (deux)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-3">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (trois)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-4">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (quatre)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                    </TabContent>
                    <TabContent
                        for="Spanish"
                        styleName="tab"
                    >
                        <div styleName="n-gram-1">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (UNO)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-2">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (Dos)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-3">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (Tres)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                        <div styleName="n-gram-4">
                            <div styleName="header">
                                <h3>
                                    N-GRAM (Quatro)
                                </h3>
                                <TextInput
                                    placeholder="Search Keyword"
                                    styleName="search"
                                    showHintAndError={false}
                                />
                            </div>
                            <div styleName="keyword-table">
                                <Table
                                    data={this.data}
                                    headers={this.tableHeaders}
                                    keyExtractor={rowData => rowData.id}
                                />
                            </div>
                        </div>
                    </TabContent>
                </Tabs>
            </Form>
        );
    }
}
