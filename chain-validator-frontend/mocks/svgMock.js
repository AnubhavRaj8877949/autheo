// SVG mock for Jest tests.
//
// `import logo from './logo.svg'` resolves to a URL string under
// CRA/webpack, so the mock must be a string too - returning a component
// here makes React warn about an invalid `src` on <img>.
// Nothing in this project uses the `{ ReactComponent }` form.
module.exports = "test-file-stub";
