import CSSModules from 'react-css-modules';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import styles from './styles.scss';
import { pageTitles } from '../../../common/utils/labels';
import {
    setNavbarStateAction,
} from '../../../common/redux';

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
export default class Entries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.entries = [
            {
                id: 1,
                leadId: 1,
                title: 'Comfortably numb by Pink Floyd',
                excerpt: 'Hello, Hello, is there anybody in there? Just nod if you can here me. Is there any one home?',
            },
            {
                id: 2,
                leadId: 1,
                title: 'Comfortably numb by Pink Floyd',
                excerpt: 'Relax, Relax, I need some information first. Just the basic facts, can you show me where it hurts?',
            },
            {
                id: 3,
                leadId: 2,
                title: 'Learning to fly by Pink Floyd',
                excerpt: 'Into the distance, ribbon of black. Stretched to the point of no turning back',
            },
            {
                id: 4,
                leadId: 3,
                title: 'Another brick in the wall by Pink Floyd',
                excerpt: 'We dont need no education, no dark sarcasm in the classroom',
            },
        ];
    }

    componentWillMount() {
        this.props.setNavbarState({
            visible: true,
            activeLink: pageTitles.entries,
            validLinks: [
                pageTitles.leads,
                pageTitles.entries,
                pageTitles.ary,
                pageTitles.weeklySnapshot,
                pageTitles.export,

                pageTitles.userProfile,
                pageTitles.adminPanel,
                pageTitles.countryPanel,
                pageTitles.categoryEditor,
                pageTitles.projectPanel,
            ],
        });
    }

    render() {
        return (
            <div styleName="entries">
                <Helmet>
                    <title>
                        { pageTitles.entries }
                    </title>
                </Helmet>
                <header>
                    <h2>
                        { pageTitles.entries }
                    </h2>
                </header>
                <div
                    styleName="entry-list"
                >
                    {
                        this.entries.map(entry => (
                            <div
                                styleName="entry"
                                key={entry.id}
                            >
                                <header
                                    styleName="header"
                                >
                                    <h3>
                                        { entry.title }
                                    </h3>
                                </header>
                                <p
                                    styleName="excerpt"
                                >
                                    { entry.excerpt }
                                </p>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    }
}
