import React from 'react';

export default class Matrix1dList extends React.PureComponent {
    constructor(props) {
        super(props);

        console.log(props);
    }

    render() {
        return (
            <div>
                Matrix 1d view list
            </div>
        );
    }
}
