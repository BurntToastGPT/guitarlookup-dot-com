# GuitarLookup Project Structure

```
guitarlookup-dot-com/
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Input.jsx
│   │   │
│   │   ├── home/
│   │   │   └── BrandSerialForm.jsx
│   │   │
│   │   ├── clarification/
│   │   │   └── ClarificationForm.jsx
│   │   │
│   │   ├── results/
│   │   │   └── ResultsDisplay.jsx
│   │   │
│   │   └── feedback/
│   │       ├── FeedbackForm.jsx
│   │       └── ThankYou.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Clarification.jsx
│   │   ├── Results.jsx
│   │   ├── Feedback.jsx
│   │   └── ThankYou.jsx
│   │
│   ├── data/
│   │   ├── brands.json
│   │   ├── fender-serials.json
│   │   ├── gibson-serials.json
│   │   ├── martin-serials.json
│   │   └── README.md (data format documentation)
│   │
│   ├── utils/
│   │   ├── serialDecoder.js
│   │   ├── validation.js
│   │   └── formatters.js
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── components/
│   │       ├── Button.module.css
│   │       ├── Input.module.css
│   │       └── Form.module.css
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── .gitignore
├── .env.example
├── package.json
├── vite.config.js
├── README.md
└── index.html
```

## Key Directories:

- **components/**: Reusable UI components organized by feature
- **pages/**: Main page components for each route
- **data/**: JSON files containing brand and serial number data
- **utils/**: Helper functions for decoding, validation, and formatting
- **styles/**: CSS modules and global styles
