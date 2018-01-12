import raf from './tempPolyfills'; // eslint-disable-line no-unused-vars

// NOTE: the relative import must be before other imports in this case
import { configure } from 'enzyme'; // eslint-disable-line import/first
import Adapter from 'enzyme-adapter-react-16'; // eslint-disable-line import/first

configure({ adapter: new Adapter() });
