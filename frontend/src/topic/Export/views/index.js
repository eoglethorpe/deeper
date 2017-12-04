import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import styles from './styles.scss';
import { pageTitles } from '../../../common/constants';
import {
    Form,
} from '../../../public/components/Input';
import {
    TransparentButton,
} from '../../../public/components/Action';

import {
    setNavbarStateAction,
} from '../../../common/redux';
import FilterSection from '../components/FilterSection';
import StructureSection from '../components/StructureSection';

const propTypes = {
    setNavbarState: PropTypes.func.isRequired,
};

const defaultProps = {
    leads: [],
};

const mapDispatchToProps = dispatch => ({
    setNavbarState: params => dispatch(setNavbarStateAction(params)),
});

@connect(undefined, mapDispatchToProps)
@CSSModules(styles, { allowMultiple: true })
export default class Export extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.elements = [];
    }

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: pageTitles.export,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.projectPanel,
            ],
        });
    }

    render() {
        return (
            <div styleName="export">
                <Helmet>
                    <title>{ pageTitles.export }</title>
                </Helmet>
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
                        <div styleName="action-buttons">
                            <TransparentButton
                                styleName="word-document"
                            >
                                <i className="ion-android-document" />
                                Preview Docx
                            </TransparentButton>
                            <TransparentButton
                                styleName="word-document"
                            >
                                <i className="ion-android-document" />
                                Export Docx
                            </TransparentButton>
                            <TransparentButton
                                styleName="pdf-document"
                            >
                                <i className="ion-android-document" />
                                Export Pdf
                            </TransparentButton>
                            <TransparentButton
                                styleName="excel-document"
                            >
                                <i className="ion-android-document" />
                                Export Excel
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
