require("@testing-library/jest-dom");

// Mock Firebase
global.Firebase = {
  firestore: jest.fn(),
  auth: jest.fn(),
};

// Mock window.matchMedia for components that use it
window.matchMedia = jest.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));
