# GuitarLookup

A modern web application for decoding guitar serial numbers across multiple brands.

## Features

- Simple, intuitive interface with large input fields
- Support for major guitar brands (Fender, Gibson, Martin, Taylor, etc.)
- Mobile-responsive design
- Clean, modular React architecture
- Easy-to-maintain JSON-based data storage

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Main page components
├── data/           # Brand and serial number data
├── styles/         # CSS modules and global styles
└── utils/          # Helper functions
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd guitarlookup-dot-com
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will open automatically at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Development Tips

- The app uses Vite for fast HMR (Hot Module Replacement)
- All components use CSS Modules for scoped styling
- Form data is stored in sessionStorage for navigation between pages
- The serial number decoder logic will be implemented in `src/utils/serialDecoder.js`

## Current Implementation Status

✅ Basic project structure  
✅ Home page with brand selection and serial input  
✅ Reusable component library (Button, Input)  
✅ Responsive layout and styling  
✅ Page routing setup  
⏳ Clarification page logic  
⏳ Results display  
⏳ Feedback system  
⏳ Serial number decoding logic

## Next Steps

1. Implement the serial number decoding logic
2. Create the clarification questions based on brand/serial patterns
3. Build out the results display with guitar information
4. Add the feedback collection system
5. Populate the brand-specific serial data files

## Technologies Used

- React 18
- React Router 6
- Vite
- CSS Modules
- Modern JavaScript (ES6+)
