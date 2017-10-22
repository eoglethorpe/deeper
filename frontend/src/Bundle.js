import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

const propTypes = {
    load: PropTypes.func.isRequired,
};

class Bundle extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = { Component: null };
    }

    componentWillMount() {
        this.setState({
            Component: null,
        });

        this.props.load()
            .then((Component) => {
                this.setState({
                    Component: withRouter(
                        Component.default ? Component.default : Component,
                    ),
                });
            });
    }

    render() {
        const { Component } = this.state;
        return Component ? <Component {...this.props} /> : null;
    }
}

export default Bundle;
