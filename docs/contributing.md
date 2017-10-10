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

> Author: *Navin Ayer*

## Building

Install `docker` and `docker-compose v3`

Required everytime dependencies are updated.
```
cd deep-project-root
docker-compose build
```

## Running

Usefull commands for:

- Starting docker containers
    ```
    docker-compose up               # non-detach mode, shows logs, ctrl+c to exit
    docker-compose up -d            # detach mode, runs in background
    ```
- Viewing logs (for detach mode)
    ```
    docker-compose logs -f          # view logs -f is for flow
    docker-compose logs -f web      # view logs for web container
    ```
- Running commands
    ```
    docker-compose exec web <command>    # Run command inside web container
    docker-compose exec web bash         # Get into web container bash
    ```

[Note: `web` is the container name (view `docker-compose.yml`)]

## Adding dependencies

- Get into web container bash

    ```
    docker-compose exec web bash
    ```

- Adding Frontend Dependencies [JS]

    ```
    cd frontend/
    yarn add <dependency>       # Installs dependency and updates package.json and yarn.lock
    ```

- Adding Backend Dependencies [Python]

    - Avoid `pip freeze > requirements.txt`

    - Temporary Dependency install [Dependency might not be in next `docker-compose up`]
    ```
    cd backend/
    . /venv/bin/activate                     # Activate virtualenv
    pip3 install <dependency>                # Install dependency
    pip3 freeze | grep <dependency>          # Get depedency version
    vim requirements.txt                     # Update python requirements [This will exist in next up]
    ```
    - Permanent Dependency install
        - `docker-compose build` after `requirements.txt` is updated

## Running tests locally

- Initial commands
    ```
    docker-compose exec web bash

    # Inside container
    . /venv/bin/activate
    ```

- Overall project test
    ```
    # Inside container
    tox                         # Overall project test
    ```

- Python/Django test
    ```
    # Inside container
    cd /code/backend/
    python3 manage.py test                      # Overall django test
    python3 manage.py test app.module           # specific app module test
    ```

- JS/React test
    ```
    # Inside container
    cd /code/frontend/
    yarn test                   # Provides different usage
    yarn test a                 # Overall JS/React test
    yarn test o                 # test only changes files
    yarn test --coverage        # Also generate coverage
    ```
