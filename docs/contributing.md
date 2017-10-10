# Documentation

## Project Structure

```
/src/public -> react-store
/src/common
/src/topic
```

## React Noobs

1. setState is an async function. If you need an action to be called after setState, it provides a second argument which accepts a callback.

2. Use immutable objects most of the time. Instead of mutating an object, use immutable-helpers.

3. If a re-render is expected after value is changed, the value should be kept in this.state. If not, don't keep it in this.state.

4. Redux store stores global states.

5. If possible, don't instantiate objects and functions in render method. Also avoid writing complex logic in render method.

6. When setting a new state to component. You can only set attributes that need to be changed.

## Internal Libraries

1. Use RestRequest for all REST api calls. Use RestBuilder to create RestRequest.

2. Use Form to validate form data.

3. Use RAVL to validate data from REST response.


## Contributing

1. Most likely, you will never require jquery.

2. For JSX, if there are more than one attributes, the attributes must be broken down in multiple lines. And all this attributes should be sorted in alphabetical order.

3. For imports, the absolute and relative imports must be spaced with a new line. All the default imports must be sorted alphabetically.

4. propTypes and defaultProps for React class must be written at the top of the file, only after imports. The attributes should be sorted alphabetically.

5. Prefer decorators for Higher-Order Components

6. Always use selectors to access data from redux store. Some additional calculations can be performed in selectors and the calculations are cached if selectors are used.

7. Always use action creators to dispatch action to redux store. Always use action types to define an action creator.

## Testing

### Writing tests

> Author: *Bibek Dahal*

Tests are written using enzyme and jest. Tests files are stored in *\__tests__* directory which lies inside same directory as the component or logic that needs to be tested.

Following is an example for testing a component if it renders properly.

```javascript
// components/Table/__tests__/index.js

import React from 'react';
import { shallow } from 'enzyme';
import Table from '../index';

// Describe a test suite: a group of related tests
describe('<Table />', () => {
    // Initial setup (synchronous)
    const tableData = [
        { a: 'b', c: 'd' },
        { a: 'e', c: 'f' },
    ];
    const tableHeaders = [
        { a: '1', c: '2' },
    ];

    const wrapper = shallow(
        <Table
            data={tableData}
            headers={tableHeaders}
        />,
    );

    // Test if it renders
    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
    });

    // More tests
    // ...
});
```

If the initial setup is asynchronous, one may use `beforeEach` or `beforeAll` functions, both of which can return a promise object.

To test redux-connected components, one can use the `redux-mock-store`:

```javascript
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import Table from '../index';

describe('<Table />', () => {
    const mockStore = configureStore();
    const store = mockStore(initialState);
    const wrapper = shallow(<Provider store={store}><Table /></Provider>);

    it('renders properly', () => {
        expect(wrapper.length).toEqual(1);
        expect(wrapper.prop('someProp').toEqual(initialState.someProp);
    });

});
```

More examples using redux: [writing tests](https://github.com/reactjs/redux/blob/master/docs/recipes/WritingTests.md).

For event based behavioral testing, the enzyme's `simulate` method can be used as helper method.

```js
wrapper.find('button').simulate('click');
expect(wrapper.find('.no-of-clicks').text()).toBe('1');
```

# Building and Running

- Building
- Running
- Adding dependencies
- Running tests locally
