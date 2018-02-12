import React from 'react';

const BoundError = WrappedComponent => (
    class extends React.PureComponent {
        constructor(props) {
            super(props);

            this.state = {
                hasError: false,
            };
        }

        componentDidCatch(error, info) {
            this.setState({ hasError: true });
            console.warn(info);
        }

        render() {
            if (this.state.hasError) {
                return (
                    <div>Oops!!! Something went wrong</div>
                );
            }


            return <WrappedComponent {...this.props} />;
        }
    }
);

export default BoundError;
